package com.aniket.service;

import com.aniket.domain.NotificationType;
import com.aniket.domain.Priority;
import com.aniket.modal.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    void createNotification(NotificationType type, Priority priority, String title, String message, String entityType, Long entityId, String actionUrl, Long recipientId);
    Page<Notification> getNotifications(Long recipientId, boolean unreadOnly, Pageable pageable);
    int getUnreadCount(Long recipientId);
    void markAsRead(Long notificationId);
    void markAllAsRead(Long recipientId);
    void deleteNotification(Long notificationId);
    void deleteAllNotifications(Long recipientId);
    void cleanupOldNotifications();
}
