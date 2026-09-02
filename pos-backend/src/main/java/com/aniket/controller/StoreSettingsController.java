package com.aniket.controller;

import com.aniket.domain.UserRole;
import com.aniket.exception.UserException;
import com.aniket.modal.Store;
import com.aniket.modal.User;
import com.aniket.payload.dto.StoreSettingsDTO;
import com.aniket.service.StoreService;
import com.aniket.service.StoreSettingsService;
import com.aniket.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    @PreAuthorize("hasAnyAuthority('ROLE_STORE_ADMIN', 'ROLE_STORE_MANAGER') or hasAnyRole('STORE_ADMIN', 'STORE_MANAGER')")
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
    @PreAuthorize("hasAnyAuthority('ROLE_STORE_ADMIN', 'ROLE_STORE_MANAGER') or hasAnyRole('STORE_ADMIN', 'STORE_MANAGER')")
    public ResponseEntity<?> updateStoreSettings(@Valid @RequestBody StoreSettingsDTO dto) {
        try {
            User currentUser = userService.getCurrentUser();
            Store store = currentUser.getStore();
            if (store == null) {
                store = storeService.getStoreByAdminId();
            }
            if (store == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "Store not found for current user"));
            }
            StoreSettingsDTO updated = storeSettingsService.updateSettings(store.getId(), dto, currentUser);
            return ResponseEntity.ok(Map.of("success", true, "data", updated, "message", "Store settings updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}