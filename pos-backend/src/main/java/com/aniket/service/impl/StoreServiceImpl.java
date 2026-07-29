package com.aniket.service.impl;


import com.aniket.domain.StoreStatus;
import com.aniket.domain.UserRole;
import com.aniket.exception.ResourceNotFoundException;
import com.aniket.exception.UserException;
import com.aniket.mapper.StoreMapper;
import com.aniket.mapper.UserMapper;
import com.aniket.modal.Branch;
import com.aniket.modal.Store;
import com.aniket.modal.StoreContact;
import com.aniket.modal.User;
import com.aniket.payload.dto.StoreDTO;
import com.aniket.payload.dto.UserDTO;
import com.aniket.repository.BranchRepository;
import com.aniket.repository.StoreRepository;
import com.aniket.repository.UserRepository;
import com.aniket.service.ActivityLogService;
import com.aniket.service.ApprovalRequestService;
import com.aniket.service.NotificationService;
import com.aniket.service.StoreService;
import com.aniket.service.StoreSubscriptionService;
import com.aniket.service.SystemSettingService;
import com.aniket.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
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
    @Override
    public StoreDTO createStore(StoreDTO storeDto, User user) {
        if (storeRepository.findByStoreAdminId(user.getId()) != null) {
            throw new IllegalArgumentException("User already owns a store");
        }

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
        return StoreMapper.toDto(store);
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

      store.setStatus(action);
        Store updatedStore = storeRepository.save(store);

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

        return StoreMapper.toDto(updatedStore);
    }


}
