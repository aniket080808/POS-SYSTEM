package com.aniket.service;

import java.util.Map;

public interface SystemSettingService {
    String getSetting(String key, String defaultValue);
    boolean getBooleanSetting(String key, boolean defaultValue);
    Map<String, String> getAllSettings();
    void updateSetting(String key, String value, String modifiedBy);
    void resetToDefaults(String modifiedBy);
}
