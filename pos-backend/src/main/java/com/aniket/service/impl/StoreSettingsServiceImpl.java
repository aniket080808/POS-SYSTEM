package com.aniket.service.impl;

import com.aniket.exception.UserException;
import com.aniket.modal.Store;
import com.aniket.modal.StoreSettings;
import com.aniket.modal.User;
import com.aniket.payload.dto.StoreSettingsDTO;
import com.aniket.repository.StoreRepository;
import com.aniket.repository.StoreSettingsRepository;
import com.aniket.service.StoreSettingsService;
import com.aniket.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StoreSettingsServiceImpl implements StoreSettingsService {

    private final StoreSettingsRepository storeSettingsRepository;
    private final StoreRepository storeRepository;
    private final UserService userService;

    @Override
    public StoreSettingsDTO getSettingsByStoreId(Long storeId) {
        StoreSettings settings = storeSettingsRepository.findByStoreId(storeId)
                .orElseThrow(() -> new RuntimeException("Store settings not found for store: " + storeId));
        return toDto(settings);
    }

    @Override
    public StoreSettingsDTO getSettingsForCurrentStore() {
        try {
            User currentUser = userService.getCurrentUser();
            Store store = currentUser.getStore();
            if (store == null) {
                store = storeRepository.findByStoreAdminId(currentUser.getId());
            }
            if (store == null) {
                throw new RuntimeException("Store not found for current user");
            }
            final Store targetStore = store;
            StoreSettings settings = storeSettingsRepository.findByStoreId(targetStore.getId())
                    .orElseGet(() -> {
                        StoreSettings defaultSettings = createDefaultSettingsEntity(targetStore);
                        return storeSettingsRepository.save(defaultSettings);
                    });
            return toDto(settings);
        } catch (UserException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    @Transactional
    public StoreSettingsDTO updateSettings(Long storeId, StoreSettingsDTO dto) {
        User currentUser = null;
        try {
            currentUser = userService.getCurrentUser();
        } catch (Exception ignored) {}
        return updateSettings(storeId, dto, currentUser);
    }

    @Override
    @Transactional
    public StoreSettingsDTO updateSettings(Long storeId, StoreSettingsDTO dto, User user) {
        StoreSettings settings = storeSettingsRepository.findByStoreId(storeId)
                .orElseThrow(() -> new RuntimeException("Store settings not found for store: " + storeId));

        // Always update operational settings (accessible by Store Admin and Store Manager)
        settings.setEmailNotifications(dto.isEmailNotifications());
        settings.setLowStockAlerts(dto.isLowStockAlerts());
        settings.setSalesReports(dto.isSalesReports());
        settings.setEmployeeActivity(dto.isEmployeeActivity());

        // Update governance/security settings ONLY if the user is Store Admin or Super Admin
        boolean isAdmin = user != null && (user.getRole() == com.aniket.domain.UserRole.ROLE_STORE_ADMIN || user.getRole() == com.aniket.domain.UserRole.ROLE_ADMIN);
        if (isAdmin) {
            settings.setTwoFactorAuth(dto.isTwoFactorAuth());
            settings.setIpRestriction(dto.isIpRestriction());
            if (dto.getPasswordExpiry() != null && dto.getPasswordExpiry() > 0) {
                settings.setPasswordExpiry(dto.getPasswordExpiry());
            }
            if (dto.getSessionTimeout() != null && dto.getSessionTimeout() > 0) {
                int timeout = dto.getSessionTimeout();
                if (timeout < 10) {
                    timeout = 10; // Enforce minimum to avoid throttle conflicts
                }
                settings.setSessionTimeout(timeout);
            }
        }

        StoreSettings saved = storeSettingsRepository.save(settings);
        return toDto(saved);
    }

    @Override
    @Transactional
    public StoreSettingsDTO createDefaultSettings(Store store) {
        StoreSettings settings = createDefaultSettingsEntity(store);
        StoreSettings saved = storeSettingsRepository.save(settings);
        return toDto(saved);
    }

    private StoreSettings createDefaultSettingsEntity(Store store) {
        return StoreSettings.builder()
                .store(store)
                .emailNotifications(true)
                .lowStockAlerts(true)
                .salesReports(true)
                .employeeActivity(true)
                .twoFactorAuth(false)
                .ipRestriction(false)
                .passwordExpiry(90)
                .sessionTimeout(30)
                .build();
    }

    private StoreSettingsDTO toDto(StoreSettings settings) {
        return StoreSettingsDTO.builder()
                .id(settings.getId())
                .storeId(settings.getStore().getId())
                .emailNotifications(settings.isEmailNotifications())
                .lowStockAlerts(settings.isLowStockAlerts())
                .salesReports(settings.isSalesReports())
                .employeeActivity(settings.isEmployeeActivity())
                .twoFactorAuth(settings.isTwoFactorAuth())
                .ipRestriction(settings.isIpRestriction())
                .passwordExpiry(settings.getPasswordExpiry())
                .sessionTimeout(settings.getSessionTimeout())
                .build();
    }
}