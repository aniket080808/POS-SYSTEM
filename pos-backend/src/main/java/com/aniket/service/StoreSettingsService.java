package com.aniket.service;

import com.aniket.modal.Store;
import com.aniket.payload.dto.StoreSettingsDTO;

public interface StoreSettingsService {
    StoreSettingsDTO getSettingsByStoreId(Long storeId);
    StoreSettingsDTO getSettingsForCurrentStore();
    StoreSettingsDTO updateSettings(Long storeId, StoreSettingsDTO settingsDTO);
    StoreSettingsDTO createDefaultSettings(Store store);
}