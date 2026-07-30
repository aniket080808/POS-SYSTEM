package com.aniket.service.impl;

import com.aniket.configrations.JwtProvider;
import com.aniket.domain.NotificationType;
import com.aniket.domain.Priority;
import com.aniket.domain.StoreStatus;
import com.aniket.domain.UserRole;
import com.aniket.exception.UserException;
import com.aniket.mapper.StoreMapper;
import com.aniket.mapper.UserMapper;
import com.aniket.modal.Store;
import com.aniket.modal.StoreContact;
import com.aniket.modal.User;
import com.aniket.payload.dto.UserDTO;
import com.aniket.payload.request.OnboardingRequestDTO;
import com.aniket.payload.response.AuthResponse;
import com.aniket.repository.StoreRepository;
import com.aniket.repository.UserRepository;
import com.aniket.service.ActivityLogService;
import com.aniket.service.ApprovalRequestService;
import com.aniket.service.NotificationService;
import com.aniket.service.OnboardingService;
import com.aniket.service.StoreSubscriptionService;
import com.aniket.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class OnboardingServiceImpl implements OnboardingService {

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final SystemSettingService systemSettingService;
    private final ActivityLogService activityLogService;
    private final NotificationService notificationService;
    private final ApprovalRequestService approvalRequestService;
    private final StoreSubscriptionService storeSubscriptionService;

    @Override
    public AuthResponse completeOnboarding(OnboardingRequestDTO dto) throws UserException {
        // Step 1: Execute User and Store creation within a single database transaction
        Store savedStore = registerUserAndStoreTx(dto);

        User savedUser = savedStore.getStoreAdmin();

        // Step 2: Generate JWT token AFTER database transaction has committed
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                savedUser.getEmail(),
                null,
                Collections.singletonList(new SimpleGrantedAuthority(savedUser.getRole().name()))
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtProvider.generateToken(authentication);

        // Step 3: Log activity & Notify Super Admin
        activityLogService.log(
                "STORE_REGISTERED",
                "New store \"" + savedStore.getBrand() + "\" registered during onboarding",
                "Store",
                savedStore.getId(),
                savedUser.getFullName(),
                savedStore.getStatus().name()
        );

        userRepository.findByRole(UserRole.ROLE_ADMIN).forEach(admin -> {
            notificationService.createNotification(
                    NotificationType.STORE_REGISTERED,
                    Priority.INFO,
                    "New Store Registered",
                    "Store \"" + savedStore.getBrand() + "\" has registered.",
                    "Store",
                    savedStore.getId(),
                    "/super-admin/stores",
                    admin.getId()
            );
        });

        // Step 4: Construct AuthResponse with user and store details
        UserDTO userDTO = UserMapper.toDTO(savedUser);

        AuthResponse response = new AuthResponse();
        response.setTitle("Welcome " + savedUser.getEmail());
        response.setMessage("Onboarding completed successfully");
        response.setJwt(jwt);
        response.setUser(userDTO);

        return response;
    }

    @Transactional
    public Store registerUserAndStoreTx(OnboardingRequestDTO dto) throws UserException {
        // 1. Validation before database writes
        if (dto.getEmail() == null || dto.getEmail().trim().isEmpty()) {
            throw new UserException("Email is mandatory");
        }
        if (dto.getPassword() == null || dto.getPassword().trim().length() < 6) {
            throw new UserException("Password must be at least 6 characters long");
        }
        if (dto.getStoreName() == null || dto.getStoreName().trim().isEmpty()) {
            throw new UserException("Store name is required");
        }

        User existingUser = userRepository.findByEmail(dto.getEmail());
        if (existingUser != null) {
            throw new UserException("Email id already registered");
        }

        // 2. Create and save Store Admin User
        User user = new User();
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setFullName(dto.getFullName());
        user.setPhone(dto.getPhone());
        user.setRole(UserRole.ROLE_STORE_ADMIN);
        user.setVerified(false);
        user.setLastLogin(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        // 3. Create and save Store
        Store store = new Store();
        store.setBrand(dto.getStoreName());
        store.setStoreType(dto.getStoreType());
        store.setDescription(dto.getDescription());
        store.setStoreAdmin(savedUser);

        StoreContact contact = new StoreContact();
        contact.setAddress(dto.getStoreAddress() != null ? dto.getStoreAddress() : "");
        contact.setEmail(dto.getEmail());
        contact.setPhone(dto.getPhone() != null ? dto.getPhone() : "");
        store.setContact(contact);

        boolean autoApprove = systemSettingService.getBooleanSetting("autoApproveStores", false);
        store.setStatus(autoApprove ? StoreStatus.ACTIVE : StoreStatus.PENDING);

        Store savedStore = storeRepository.save(store);

        // 4. Link store reference on user & flush transaction
        savedUser.setOwnedStore(savedStore);
        savedUser.setStore(savedStore);
        userRepository.save(savedUser);

        // 5. Initialize StoreSubscription and create registration ApprovalRequest
        storeSubscriptionService.getOrCreateForStore(savedStore);

        if (!autoApprove) {
            approvalRequestService.createRegistrationRequest(savedStore, savedUser);
        }

        return savedStore;
    }
}
