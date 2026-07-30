package com.aniket.controller;

import com.aniket.exception.UserException;
import com.aniket.modal.Notification;
import com.aniket.modal.User;
import com.aniket.payload.response.ApiResponse;
import com.aniket.service.NotificationService;
import com.aniket.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/super-admin/notifications")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'STORE_ADMIN', 'STORE_MANAGER')")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Notification>>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "false") boolean unreadOnly) {
        try {
            User user = userService.getCurrentUser();
            Pageable pageable = PageRequest.of(page, size);
            Page<Notification> notifications = notificationService.getNotifications(user.getId(), unreadOnly, pageable);
            return ResponseEntity.ok(new ApiResponse<>(true, "Notifications fetched", notifications));
        } catch (UserException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Integer>> getUnreadCount() {
        try {
            User user = userService.getCurrentUser();
            int count = notificationService.getUnreadCount(user.getId());
            return ResponseEntity.ok(new ApiResponse<>(true, "Unread count fetched", count));
        } catch (UserException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Notification marked as read", null));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        try {
            User user = userService.getCurrentUser();
            notificationService.markAllAsRead(user.getId());
            return ResponseEntity.ok(new ApiResponse<>(true, "All notifications marked as read", null));
        } catch (UserException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Notification deleted", null));
    }

    @DeleteMapping("/all")
    public ResponseEntity<ApiResponse<Void>> deleteAllNotifications() {
        try {
            User user = userService.getCurrentUser();
            notificationService.deleteAllNotifications(user.getId());
            return ResponseEntity.ok(new ApiResponse<>(true, "All notifications deleted", null));
        } catch (UserException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}