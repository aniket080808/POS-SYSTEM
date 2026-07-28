package com.aniket.repository;

import com.aniket.modal.SystemSetting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SystemSettingRepository extends JpaRepository<SystemSetting, Long> {
    SystemSetting findBySettingKey(String settingKey);
}
