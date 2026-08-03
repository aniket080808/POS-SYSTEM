package com.aniket.service.impl;


import com.aniket.domain.StoreStatus;
import com.aniket.domain.StoreSubscriptionStatus;
import com.aniket.domain.SubscriptionStatus;
import com.aniket.domain.UserRole;
import com.aniket.exception.AccessDeniedException;
import com.aniket.exception.ResourceNotFoundException;
import com.aniket.exception.UserException;
import com.aniket.mapper.StoreMapper;
import com.aniket.mapper.UserMapper;
import com.aniket.modal.ApprovalRequest;
import com.aniket.modal.Branch;
import com.aniket.modal.Store;
import com.aniket.modal.StoreContact;
import com.aniket.modal.StoreSubscription;
import com.aniket.modal.Subscription;
import com.aniket.modal.User;
import com.aniket.payload.dto.StoreDTO;
import com.aniket.payload.dto.UserDTO;
import com.aniket.domain.ApprovalRequestStatus;
import com.aniket.domain.ApprovalRequestType;
import com.aniket.repository.ApprovalRequestRepository;
import com.aniket.repository.BranchRepository;
import com.aniket.repository.StoreRepository;
import com.aniket.repository.StoreSubscriptionRepository;
import com.aniket.repository.SubscriptionRepository;
import com.aniket.repository.UserRepository;
import com.aniket.service.ActivityLogService;
import com.aniket.service.ApprovalRequestService;
import com.aniket.service.EmailService;
import com.aniket.service.NotificationService;
import com.aniket.service.StoreService;
import com.aniket.service.StoreSettingsService;
import com.aniket.service.StoreSubscriptionService;
import com.aniket.service.SystemSettingService;
import com.aniket.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
@Slf4j
public class StoreServiceImpl implements StoreService {

    private final StoreRepository storeRepository;
    private final UserService userService;
    private final BranchRepository branchRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ActivityLogService activityLogService;
    private final SystemSettingService systemSettingService;
    private final NotificationService notificationService;
    private final ApprovalRequestService approvalRequestService;
    private final StoreSubscriptionService storeSubscriptionService;
    private final StoreSubscriptionRepository storeSubscriptionRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final ApprovalRequestRepository approvalRequestRepository;
    private final StoreSettingsService storeSettingsService;
    private final EmailService emailService;
    @Override
    public StoreDTO createStore(StoreDTO storeDto, User user) throws UserException {
        if (storeRepository.findByStoreAdminId(user.getId()) != null) {
            throw new IllegalArgumentException("User already owns a store");
        }

        // Check for duplicate store contact email/phone
        validateStoreContactUniqueness(storeDto.getContact(), null);

        System.out.println(storeDto);

        Store store = StoreMapper.toEntity(storeDto, user);

        boolean autoApprove = systemSettingService.getBooleanSetting("autoApproveStores", false);
        if (autoApprove) {
            store.setStatus(StoreStatus.ACTIVE);
        }
        
        Store savedStoreEntity = storeRepository.save(store);
        user.setOwnedStore(savedStoreEntity);
        user.setStore(savedStoreEntity);
        userRepository.save(user);

        storeSubscriptionService.getOrCreateForStore(savedStoreEntity);
        
        // Create default store settings (notification & security toggles)
        storeSettingsService.createDefaultSettings(savedStoreEntity);
        
        if (!autoApprove) {
            approvalRequestService.createRegistrationRequest(savedStoreEntity, user);
        }

        StoreDTO savedStore = StoreMapper.toDto(savedStoreEntity);

        activityLogService.log(
                "STORE_REGISTERED",
                "New store \"" + savedStore.getBrand() + "\" registered",
                "Store",
                savedStore.getId(),
                user.getFullName(),
                store.getStatus().name()
        );

        userRepository.findByRole(UserRole.ROLE_ADMIN).forEach(admin -> {
            notificationService.createNotification(
                    com.aniket.domain.NotificationType.STORE_REGISTERED,
                    com.aniket.domain.Priority.INFO,
                    "New Store Registered",
                    "Store \"" + savedStore.getBrand() + "\" has registered.",
                    "Store",
                    savedStore.getId(),
                    "/super-admin/stores",
                    admin.getId()
            );
        });

        return savedStore;
    }

    @Override
    public StoreDTO getStoreById(Long id) throws ResourceNotFoundException {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found"));

        User currentUser;
        try {
            currentUser = userService.getCurrentUser();
        } catch (UserException e) {
            throw new AccessDeniedException("You are not authorized to view this store.", e);
        }
        Store userStore = storeRepository.findByStoreAdminId(currentUser.getId());
        if (userStore == null || !userStore.getId().equals(store.getId())) {
            throw new AccessDeniedException("You are not authorized to view this store.");
        }

        return StoreMapper.toDto(store);
    }

    @Override
    public Page<StoreDTO> searchStores(StoreStatus status, String search, Pageable pageable) {
        String searchPattern = (search != null && !search.trim().isEmpty())
                ? "%" + search.trim().toLowerCase() + "%"
                : null;
        Page<Store> page = storeRepository.searchStores(status, searchPattern, pageable);
        return page.map(StoreMapper::toDto);
    }

    @Override
    public List<StoreDTO> getAllStores(StoreStatus status) {
        List<Store> stores;
        if (status != null) {
            stores = storeRepository.findByStatus(status);
        } else {
            stores = storeRepository.findAll();
        }

        return stores.stream()
                .map(StoreMapper::toDto)
                .collect(Collectors.toList());


    }

    @Override
    public Store getStoreByAdminId() throws UserException {
        User currentUser=userService.getCurrentUser();
        if (currentUser.getStore() != null) {
            return currentUser.getStore();
        }
        return storeRepository.findByStoreAdminId(
                currentUser.getId()
        );
    }

    @Override
    public StoreDTO getStoreByEmployee() throws UserException {
        User currentUser=userService.getCurrentUser();


        if(currentUser.getStore()==null){
            throw new UserException("user does not have enough permissions to access this store");
        }
        return StoreMapper.toDto(currentUser.getStore());
    }

    @Override
    public StoreDTO updateStore(Long id, StoreDTO storeDto) throws ResourceNotFoundException, UserException {
        User currentUser=userService.getCurrentUser();
        Store existing = storeRepository.findByStoreAdminId(currentUser.getId());

        if(existing == null) {
            throw new ResourceNotFoundException("store not found");
        }

        applyStoreUpdateFields(existing, storeDto);

        StoreDTO updatedStore = StoreMapper.toDto(storeRepository.save(existing));

        activityLogService.log(
                "STORE_UPDATED",
                "Store \"" + updatedStore.getBrand() + "\" was updated",
                "Store",
                updatedStore.getId(),
                currentUser.getFullName(),
                updatedStore.getStatus() != null ? updatedStore.getStatus().name() : "UPDATED"
        );

        return updatedStore;
    }

    /**
     * Super-admin variant of updateStore: resolves the store by its ID path param
     * (instead of the current user's ownership) so an admin can edit any store.
     * Reuses the exact same field-update logic.
     */
    @Override
    public StoreDTO updateStoreAsSuperAdmin(Long id, StoreDTO storeDto) throws ResourceNotFoundException, UserException {
        Store existing = storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + id));

        // Check for duplicate store contact email/phone, excluding current store
        validateStoreContactUniqueness(storeDto.getContact(), id);

        applyStoreUpdateFields(existing, storeDto);

        StoreDTO updatedStore = StoreMapper.toDto(storeRepository.save(existing));

        activityLogService.log(
                "STORE_UPDATED",
                "Store \"" + updatedStore.getBrand() + "\" was updated by Super Admin",
                "Store",
                updatedStore.getId(),
                "Super Admin",
                updatedStore.getStatus() != null ? updatedStore.getStatus().name() : "UPDATED"
        );

        return updatedStore;
    }

    /**
     * Shared field-update logic used by both updateStore (owner-scoped) and
     * updateStoreAsSuperAdmin (admin-scoped). Includes GST/PAN format validation.
     */
    private void applyStoreUpdateFields(Store existing, StoreDTO storeDto) throws UserException {
        existing.setBrand(storeDto.getBrand());
        existing.setDescription(storeDto.getDescription());

        // Convert string storeType to enum, if not null
        if (storeDto.getStoreType() != null) {
            existing.setStoreType(storeDto.getStoreType());
        }

        // Set contact info if provided
        if (storeDto.getContact() != null) {
            StoreContact contact = StoreContact.builder()
                    .address(storeDto.getContact().getAddress())
                    .phone(storeDto.getContact().getPhone())
                    .email(storeDto.getContact().getEmail())
                    .build();
            existing.setContact(contact);
        }

        // Set business documents (GST/PAN) with validation if provided
        String gstNumber = storeDto.getGstNumber();
        if (gstNumber != null && !gstNumber.trim().isEmpty()) {
            if (!gstNumber.matches("^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$")) {
                throw new UserException("Invalid GST number format. Expected 15-char format: 2 digits + 5 letters + 4 digits + 1 letter + 1 alphanumeric + Z + 1 alphanumeric");
            }
            existing.setGstNumber(gstNumber.trim());
        } else {
            existing.setGstNumber(null);
        }

        String panNumber = storeDto.getPanNumber();
        if (panNumber != null && !panNumber.trim().isEmpty()) {
            if (!panNumber.matches("^[A-Z]{5}[0-9]{4}[A-Z]{1}$")) {
                throw new UserException("Invalid PAN number format. Expected 10-char format: 5 letters + 4 digits + 1 letter");
            }
            existing.setPanNumber(panNumber.trim());
        } else {
            existing.setPanNumber(null);
        }

        // Store business settings
        if (storeDto.getCurrency() != null) {
            existing.setCurrency(storeDto.getCurrency());
        }
        if (storeDto.getTaxRate() != null) {
            existing.setTaxRate(storeDto.getTaxRate());
        }
        if (storeDto.getTimezone() != null) {
            existing.setTimezone(storeDto.getTimezone());
        }
        if (storeDto.getDateFormat() != null) {
            existing.setDateFormat(storeDto.getDateFormat());
        }
        if (storeDto.getReceiptFooter() != null) {
            existing.setReceiptFooter(storeDto.getReceiptFooter());
        }
        if (storeDto.getAcceptedPaymentMethods() != null) {
            existing.setAcceptedPaymentMethods(storeDto.getAcceptedPaymentMethods());
        }
    }

    @Override
    public void deleteStore() throws ResourceNotFoundException, UserException {
        User currentUser = userService.getCurrentUser();
        Store store = getStoreByAdminId();

        if (store==null) {
            throw new ResourceNotFoundException("Store not found");
        }

        String storeName = store.getBrand();
        Long storeId = store.getId();
        storeRepository.deleteById(storeId);

        activityLogService.log(
                "STORE_DELETED",
                "Store \"" + storeName + "\" was deleted",
                "Store",
                storeId,
                currentUser.getFullName(),
                "DELETED"
        );
    }

    @Override
    public UserDTO addEmployee(Long id, UserDTO userDto) throws UserException {
        Store store=getStoreByAdminId();

        User employee = UserMapper.toEntity(userDto);
        if(userDto.getRole()== UserRole.ROLE_STORE_MANAGER){
            employee.setStore(store);
        }else if(userDto.getRole()== UserRole.ROLE_BRANCH_MANAGER){
            Branch branch=branchRepository.findById(userDto.getBranchId()).orElseThrow(
                    ()-> new EntityNotFoundException("branch not found")
            );
            employee.setBranch(branch);
            employee.setStore(store);
        }

        employee.setPassword(passwordEncoder.encode(userDto.getPassword()));
        User addedEmployee=userRepository.save(employee);

        return UserMapper.toDTO(addedEmployee);
    }

    @Override
    public List<UserDTO> getEmployeesByStore(Long storeId) throws UserException {
        User currentUser=userService.getCurrentUser();

        Store store=storeRepository.findById(storeId).orElseThrow(
                ()->new EntityNotFoundException("store not found")
        );
        if(store.getStoreAdmin().getId().equals(currentUser.getId())
                || currentUser.getStore().getId().equals(store.getId())){
            List<User> employees=userRepository.findByStoreId(storeId);
            return UserMapper.toDTOList(employees);
        }

        throw new UserException("user does not have enough permissions to access this store");
    }


    @Override
    public StoreDTO moderateStore(Long storeId, StoreStatus action) throws ResourceNotFoundException {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + storeId));

        User adminUser;
        try {
            adminUser = userService.getCurrentUser();
        } catch (UserException e) {
            adminUser = null;
        }

        // 1. Update Store status
        store.setStatus(action);
        Store updatedStore = storeRepository.save(store);

        // 2. Sync Subscription status and ApprovalRequest based on action
        switch (action) {
            case PENDING:
                // Set subscription to INACTIVE
                storeSubscriptionService.updateStatus(storeId, StoreSubscriptionStatus.INACTIVE);
                // Create or update re-approval request
                approvalRequestService.createOrUpdateReApprovalRequest(store, adminUser);
                break;

            case ACTIVE:
                // Restore subscription to ACTIVE only if it has a non-expired plan
                StoreSubscription storeSub = storeSubscriptionService.getOrCreateForStore(store);
                if (storeSub.getCurrentPlan() != null) {
                    List<Subscription> activeSubs = subscriptionRepository.findByStoreAndStatus(store, SubscriptionStatus.ACTIVE);
                    boolean hasActiveSubscription = activeSubs.stream()
                            .anyMatch(s -> s.getEndDate() != null && !s.getEndDate().isBefore(LocalDate.now()));
                    if (hasActiveSubscription) {
                        storeSub.setStatus(StoreSubscriptionStatus.ACTIVE);
                    } else {
                        storeSub.setStatus(StoreSubscriptionStatus.INACTIVE);
                    }
                } else {
                    storeSub.setStatus(StoreSubscriptionStatus.ACTIVE);
                }
                storeSubscriptionRepository.save(storeSub);
                // Resolve any pending re-approval request via the existing approveRequest method
                resolvePendingApprovalRequest(store, adminUser, true, null);
                break;

            case BLOCKED:
                // Set subscription to INACTIVE (no approval request — admin enforcement action)
                storeSubscriptionService.updateStatus(storeId, StoreSubscriptionStatus.INACTIVE);
                break;

            case REJECTED:
                // Set subscription to REJECTED
                storeSubscriptionService.updateStatus(storeId, StoreSubscriptionStatus.REJECTED);
                // Resolve any pending re-approval request via the existing rejectRequest method
                resolvePendingApprovalRequest(store, adminUser, false, "Store rejected by admin");
                break;
        }

        // 3. Logging
        String actionLabel;
        switch (action) {
            case ACTIVE:
                actionLabel = "STORE_APPROVED";
                break;
            case BLOCKED:
                actionLabel = "STORE_BLOCKED";
                break;
            case PENDING:
                actionLabel = "STORE_PENDING";
                break;
            default:
                actionLabel = "STORE_MODERATED";
        }

        activityLogService.log(
                actionLabel,
                "Store \"" + updatedStore.getBrand() + "\" " + action.name().toLowerCase(),
                "Store",
                updatedStore.getId(),
                "Super Admin",
                action.name()
        );

        com.aniket.domain.NotificationType type = com.aniket.domain.NotificationType.STORE_APPROVED;
        if (action == StoreStatus.BLOCKED) type = com.aniket.domain.NotificationType.STORE_BLOCKED;
        else if (action == StoreStatus.PENDING) type = com.aniket.domain.NotificationType.STORE_REJECTED;

        com.aniket.domain.NotificationType finalType = type;
        userRepository.findByRole(UserRole.ROLE_ADMIN).forEach(admin -> {
            notificationService.createNotification(
                    finalType,
                    com.aniket.domain.Priority.INFO,
                    "Store Status Updated",
                    "Store \"" + updatedStore.getBrand() + "\" is now " + action.name(),
                    "Store",
                    updatedStore.getId(),
                    "/super-admin/stores",
                    admin.getId()
            );
        });

        // Notify the store admin about the status change
        if (updatedStore.getStoreAdmin() != null) {
            String storeAdminMessage;
            com.aniket.domain.Priority storeAdminPriority;
            String storeAdminTitle;
            String storeAdminActionUrl;

            switch (action) {
                case ACTIVE:
                    storeAdminTitle = "Store Approved";
                    storeAdminMessage = "Your store \"" + updatedStore.getBrand() + "\" has been approved and is now active.";
                    storeAdminPriority = com.aniket.domain.Priority.SUCCESS;
                    storeAdminActionUrl = "/store/dashboard";
                    break;
                case BLOCKED:
                    storeAdminTitle = "Store Blocked";
                    storeAdminMessage = "Your store \"" + updatedStore.getBrand() + "\" has been blocked. Please contact support for more information.";
                    storeAdminPriority = com.aniket.domain.Priority.ERROR;
                    storeAdminActionUrl = "/store/upgrade";
                    break;
                case PENDING:
                    storeAdminTitle = "Store Pending Review";
                    storeAdminMessage = "Your store \"" + updatedStore.getBrand() + "\" is now pending review. Please wait for admin approval.";
                    storeAdminPriority = com.aniket.domain.Priority.WARNING;
                    storeAdminActionUrl = "/store/upgrade";
                    break;
                case REJECTED:
                    storeAdminTitle = "Store Rejected";
                    storeAdminMessage = "Your store \"" + updatedStore.getBrand() + "\" registration has been rejected. Reason: " + (updatedStore.getRegistrationRejectionReason() != null ? updatedStore.getRegistrationRejectionReason() : "Not specified");
                    storeAdminPriority = com.aniket.domain.Priority.ERROR;
                    storeAdminActionUrl = "/store/upgrade";
                    break;
                default:
                    storeAdminTitle = "Store Status Updated";
                    storeAdminMessage = "Your store \"" + updatedStore.getBrand() + "\" is now " + action.name();
                    storeAdminPriority = com.aniket.domain.Priority.INFO;
                    storeAdminActionUrl = "/store/dashboard";
            }

            notificationService.createNotification(
                    finalType,
                    storeAdminPriority,
                    storeAdminTitle,
                    storeAdminMessage,
                    "Store",
                    updatedStore.getId(),
                    storeAdminActionUrl,
                    updatedStore.getStoreAdmin().getId()
            );

            // Send fail-safe email notification to the store admin
            if (updatedStore.getStoreAdmin().getEmail() != null) {
                try {
                    String emailSubject = storeAdminTitle;
                    String emailBody = "<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto'>"
                        + "<h2 style='color:#333'>" + storeAdminTitle + "</h2>"
                        + "<p style='font-size:16px;color:#555'>" + storeAdminMessage + "</p>"
                        + "<hr style='border:none;border-top:1px solid #eee;margin:20px 0'/>"
                        + "<p style='font-size:14px;color:#999'>This is an automated message from the POS System.</p>"
                        + "</div>";
                    emailService.sendEmail(updatedStore.getStoreAdmin().getEmail(), emailSubject, emailBody);
                } catch (Exception emailEx) {
                    log.warn("Failed to send store status email to {}: {}", updatedStore.getStoreAdmin().getEmail(), emailEx.getMessage());
                }
            }
        }

        return StoreMapper.toDto(updatedStore);
    }

    /**
     * Resolves any pending STORE_REGISTRATION approval request for the given store
     * by calling the existing approveRequest/rejectRequest methods to ensure
     * consistent audit trail (resolvedBy, resolvedAt, adminNotes, etc.).
     */
    private void resolvePendingApprovalRequest(Store store, User adminUser, boolean approve, String reason) {
        if (adminUser == null) return;

        // Find the most recent PENDING STORE_REGISTRATION request for this store
        java.util.Optional<ApprovalRequest> pendingOpt = approvalRequestRepository
                .findFirstByStoreIdAndTypeAndStatusOrderByCreatedAtDesc(
                        store.getId(), ApprovalRequestType.STORE_REGISTRATION, ApprovalRequestStatus.PENDING);

        if (pendingOpt.isEmpty()) return;

        Long requestId = pendingOpt.get().getId();

        // Delegate to the existing service methods to ensure consistent audit trail
        if (approve) {
            approvalRequestService.approveRequest(requestId, adminUser, "Store re-activated via status update");
        } else {
            approvalRequestService.rejectRequest(requestId, adminUser, reason);
        }
    }

    /**
     * Validates that store contact email and phone are unique across all stores.
     * 
     * @param contact the StoreContact DTO to validate
     * @param excludeStoreId the store ID to exclude from the check (for updates), or null for new stores
     * @throws UserException if duplicate email or phone is found
     */
    private void validateStoreContactUniqueness(StoreContact contact, Long excludeStoreId) throws UserException {
        if (contact == null) return;

        // Check for duplicate email
        if (contact.getEmail() != null && !contact.getEmail().trim().isEmpty()) {
            List<Store> storesWithEmail = storeRepository.findByContact_Email(contact.getEmail());
            boolean hasEmailDuplicate = excludeStoreId == null 
                ? !storesWithEmail.isEmpty()
                : storesWithEmail.stream().anyMatch(s -> !s.getId().equals(excludeStoreId));
            
            if (hasEmailDuplicate) {
                throw new UserException("A store with this email or phone is already registered");
            }
        }

        // Check for duplicate phone
        if (contact.getPhone() != null && !contact.getPhone().trim().isEmpty()) {
            List<Store> storesWithPhone = storeRepository.findByContact_Phone(contact.getPhone());
            boolean hasPhoneDuplicate = excludeStoreId == null
                ? !storesWithPhone.isEmpty()
                : storesWithPhone.stream().anyMatch(s -> !s.getId().equals(excludeStoreId));
            
            if (hasPhoneDuplicate) {
                throw new UserException("A store with this email or phone is already registered");
            }
        }
    }

}
