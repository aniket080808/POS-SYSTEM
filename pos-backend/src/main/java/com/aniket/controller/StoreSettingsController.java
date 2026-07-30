package com.aniket.controller;

import com.aniket.exception.UserException;
import com.aniket.modal.Store;
import com.aniket.payload.dto.StoreSettingsDTO;
import com.aniket.service.StoreService;
import com.aniket.service.StoreSettingsService;
import com.aniket.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/stores/settings")
@RequiredArgsConstructor
public class StoreSettingsController {

    private final StoreSettingsService storeSettingsService;
    private final StoreService storeService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<?> getStoreSettings() {
        try {
            StoreSettingsDTO settings = storeSettingsService.getSettingsForCurrentStore();
            return ResponseEntity.ok(Map.of("success", true, "data", settings));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping
    public ResponseEntity<?> updateStoreSettings(@RequestBody StoreSettingsDTO dto) {
        try {
            Store store = storeService.getStoreByAdminId();
            StoreSettingsDTO updated = storeSettingsService.updateSettings(store.getId(), dto);
            return ResponseEntity.ok(Map.of("success", true, "data", updated, "message", "Store settings updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}