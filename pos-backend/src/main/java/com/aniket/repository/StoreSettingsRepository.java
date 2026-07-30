package com.aniket.repository;

import com.aniket.modal.StoreSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StoreSettingsRepository extends JpaRepository<StoreSettings, Long> {
    Optional<StoreSettings> findByStoreId(Long storeId);
}