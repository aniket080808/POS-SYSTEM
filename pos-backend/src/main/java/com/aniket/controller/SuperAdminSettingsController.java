package com.aniket.controller;

import com.aniket.exception.UserException;
import com.aniket.modal.NotificationPreference;
import com.aniket.modal.User;
import com.aniket.payload.response.ApiResponse;
import com.aniket.repository.NotificationPreferenceRepository;
import com.aniket.service.ActivityLogService;
import com.aniket.service.SystemSettingService;
import com.aniket.service.UserService;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/super-admin/settings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class SuperAdminSettingsController {

    private final UserService userService;
    private final SystemSettingService systemSettingService;
    private final ActivityLogService activityLogService;
    private final NotificationPreferenceRepository preferenceRepository;

    private final Bucket bucket = Bucket.builder()
            .addLimit(Bandwidth.classic(5, Refill.greedy(5, Duration.ofMinutes(1))))
            .build();

    @GetMapping("/system")
    public ResponseEntity<ApiResponse<Map<String, String>>> getSystemSettings() {
        return ResponseEntity.ok(new ApiResponse<>(true, "System settings fetched", systemSettingService.getAllSettings()));
    }

    @PutMapping("/system")
    public ResponseEntity<ApiResponse<Void>> updateSystemSetting(@RequestBody Map<String, String> payload) {
        String key = payload.get("key");
        String value = payload.get("value");
        try {
            User user = userService.getCurrentUser();
            systemSettingService.updateSetting(key, value, user.getFullName());
            return ResponseEntity.ok(new ApiResponse<>(true, "System setting updated", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/notification-preferences")
    public ResponseEntity<ApiResponse<NotificationPreference>> getNotificationPreferences() {
        try {
            User user = userService.getCurrentUser();
            NotificationPreference prefs = preferenceRepository.findByUserId(user.getId());
            if (prefs == null) {
                prefs = NotificationPreference.builder().userId(user.getId()).build();
                prefs = preferenceRepository.save(prefs);
            }
            return ResponseEntity.ok(new ApiResponse<>(true, "Notification preferences fetched", prefs));
        } catch (UserException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PutMapping("/notification-preferences")
    public ResponseEntity<ApiResponse<NotificationPreference>> updateNotificationPreferences(@RequestBody NotificationPreference payload) {
        try {
            User user = userService.getCurrentUser();
            NotificationPreference prefs = preferenceRepository.findByUserId(user.getId());
            if (prefs == null) {
                prefs = NotificationPreference.builder().userId(user.getId()).build();
            }
            prefs.setNewStoreRequests(payload.isNewStoreRequests());
            prefs.setStoreApprovals(payload.isStoreApprovals());
            prefs.setCommissionUpdates(payload.isCommissionUpdates());
            prefs.setSystemAlerts(payload.isSystemAlerts());
            prefs.setEmailNotifications(payload.isEmailNotifications());
            
            prefs = preferenceRepository.save(prefs);

            activityLogService.log(
                    "NOTIFICATION_SETTINGS_CHANGED",
                    "Notification settings updated",
                    "NotificationPreference",
                    user.getId(),
                    user.getFullName(),
                    "UPDATED"
            );

            return ResponseEntity.ok(new ApiResponse<>(true, "Notification preferences updated", prefs));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<User>> updateProfile(@RequestBody Map<String, String> payload) {
        if (!bucket.tryConsume(1)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(new ApiResponse<>(false, "Too many requests. Please try again later.", null));
        }
        try {
            User user = userService.getCurrentUser();
            User updated = userService.updateProfile(
                    user,
                    payload.get("fullName"),
                    payload.get("phone"),
                    payload.get("email")
            );

            activityLogService.log(
                    "ADMIN_PROFILE_UPDATED",
                    "Admin profile updated",
                    "User",
                    updated.getId(),
                    updated.getFullName(),
                    "SUCCESS"
            );

            return ResponseEntity.ok(new ApiResponse<>(true, "Profile updated successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@RequestBody Map<String, String> payload) {
        if (!bucket.tryConsume(1)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(new ApiResponse<>(false, "Too many requests. Please try again later.", null));
        }
        try {
            User user = userService.getCurrentUser();
            userService.changePassword(user, payload.get("currentPassword"), payload.get("newPassword"));

            activityLogService.log(
                    "PASSWORD_CHANGED",
                    "Password changed for admin \"" + user.getFullName() + "\"",
                    "User",
                    user.getId(),
                    user.getFullName(),
                    "SUCCESS"
            );

            return ResponseEntity.ok(new ApiResponse<>(true, "Password changed successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}