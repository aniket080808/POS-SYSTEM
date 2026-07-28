package com.aniket.repository;

import com.aniket.modal.NotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {
    NotificationPreference findByUserId(Long userId);
}
