package com.aniket.service.impl;

import com.aniket.modal.SystemSetting;
import com.aniket.modal.SystemSettingHistory;
import com.aniket.repository.SystemSettingHistoryRepository;
import com.aniket.repository.SystemSettingRepository;
import com.aniket.service.ActivityLogService;
import com.aniket.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemSettingServiceImpl implements SystemSettingService {

    private final SystemSettingRepository settingRepository;
    private final SystemSettingHistoryRepository historyRepository;
    private final ActivityLogService activityLogService;

    private static final Map<String, String> DEFAULT_SETTINGS = Map.of(
        "autoApproveStores", "false",
        "requireDocumentVerification", "true",
        "commissionAutoCalculation", "true",
        "maintenanceMode", "false"
    );

    @PostConstruct
    public void initDefaults() {
        DEFAULT_SETTINGS.forEach((key, defaultValue) -> {
            if (settingRepository.findBySettingKey(key) == null) {
                SystemSetting setting = SystemSetting.builder()
                        .settingKey(key)
                        .settingValue(defaultValue)
                        .lastModifiedBy("SYSTEM")
                        .build();
                settingRepository.save(setting);
            }
        });
    }

    @Override
    public String getSetting(String key, String defaultValue) {
        SystemSetting setting = settingRepository.findBySettingKey(key);
        return setting != null ? setting.getSettingValue() : defaultValue;
    }

    @Override
    public boolean getBooleanSetting(String key, boolean defaultValue) {
        String value = getSetting(key, String.valueOf(defaultValue));
        return Boolean.parseBoolean(value);
    }

    @Override
    public Map<String, String> getAllSettings() {
        List<SystemSetting> settings = settingRepository.findAll();
        return settings.stream()
                .collect(Collectors.toMap(SystemSetting::getSettingKey, SystemSetting::getSettingValue));
    }

    @Override
    @Transactional
    public void updateSetting(String key, String value, String modifiedBy) {
        SystemSetting setting = settingRepository.findBySettingKey(key);
        String previousValue = null;
        if (setting == null) {
            setting = SystemSetting.builder().settingKey(key).build();
        } else {
            previousValue = setting.getSettingValue();
        }

        if (value.equals(previousValue)) return; // No change

        setting.setSettingValue(value);
        setting.setLastModifiedBy(modifiedBy);
        settingRepository.save(setting);

        SystemSettingHistory history = SystemSettingHistory.builder()
                .settingKey(key)
                .previousValue(previousValue)
                .newValue(value)
                .modifiedBy(modifiedBy)
                .build();
        historyRepository.save(history);

        // Determine the action label
        String actionLabel;
        String settingName;
        switch (key) {
            case "maintenanceMode":
                actionLabel = "MAINTENANCE_MODE_" + ("true".equals(value) ? "ENABLED" : "DISABLED");
                settingName = "Maintenance mode";
                break;
            case "commissionAutoCalculation":
                actionLabel = "COMMISSION_UPDATED";
                settingName = "Commission auto-calculation";
                break;
            case "notificationSettings":
                actionLabel = "NOTIFICATION_SETTINGS_CHANGED";
                settingName = "Notification settings";
                break;
            default:
                actionLabel = "SYSTEM_SETTINGS_CHANGED";
                settingName = key;
        }

        activityLogService.log(
                actionLabel,
                settingName + " changed to \"" + value + "\"",
                "SystemSetting",
                null,
                modifiedBy,
                value
            );
        
        log.info("System setting '{}' updated from '{}' to '{}' by {}", key, previousValue, value, modifiedBy);
    }

    @Override
    @Transactional
    public void resetToDefaults(String modifiedBy) {
        DEFAULT_SETTINGS.forEach((key, defaultValue) -> updateSetting(key, defaultValue, modifiedBy));
        log.info("System settings reset to defaults by {}", modifiedBy);
    }
}
