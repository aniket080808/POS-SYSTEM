package com.aniket.service.impl;

import com.aniket.domain.NotificationType;
import com.aniket.domain.Priority;
import com.aniket.modal.Notification;
import com.aniket.modal.NotificationPreference;
import com.aniket.repository.NotificationPreferenceRepository;
import com.aniket.repository.NotificationRepository;
import com.aniket.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public void createNotification(NotificationType type, Priority priority, String title, String message, String entityType, Long entityId, String actionUrl, Long recipientId) {
        // Check preferences
        NotificationPreference prefs = preferenceRepository.findByUserId(recipientId);
        if (prefs != null) {
            boolean shouldSend = true;
            switch (type) {
                case STORE_REGISTERED: shouldSend = prefs.isNewStoreRequests(); break;
                case STORE_APPROVED:
                case STORE_REJECTED:
                case STORE_BLOCKED:
                case STORE_UNBLOCKED:
                case STORE_DELETED:
                case SUBSCRIPTION_APPROVED:
                case SUBSCRIPTION_REJECTED: shouldSend = prefs.isStoreApprovals(); break;
                case SYSTEM_ALERT: shouldSend = prefs.isSystemAlerts(); break;
                default: break;
            }
            if (!shouldSend) {
                log.debug("Notification suppressed by user preferences: {} for user {}", type, recipientId);
                return;
            }
        }

        Notification notification = Notification.builder()
                .type(type)
                .priority(priority)
                .title(title)
                .message(message)
                .entityType(entityType)
                .entityId(entityId)
                .actionUrl(actionUrl)
                .recipientId(recipientId)
                .build();

        Notification saved = notificationRepository.save(notification);
        
        // Push via WebSocket
        try {
            messagingTemplate.convertAndSend("/topic/admin-notifications/" + recipientId, saved);
        } catch (Exception e) {
            log.error("Failed to push websocket notification to user {}", recipientId, e);
        }
    }

    @Override
    public Page<Notification> getNotifications(Long recipientId, boolean unreadOnly, Pageable pageable) {
        if (unreadOnly) {
            return notificationRepository.findByRecipientIdAndReadAndDeletedFalseOrderByCreatedAtDesc(recipientId, false, pageable);
        }
        return notificationRepository.findByRecipientIdAndDeletedFalseOrderByCreatedAtDesc(recipientId, pageable);
    }

    @Override
    public int getUnreadCount(Long recipientId) {
        return notificationRepository.countByRecipientIdAndReadFalseAndDeletedFalse(recipientId);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    @Override
    @Transactional
    public void markAllAsRead(Long recipientId) {
        notificationRepository.markAllAsRead(recipientId);
    }

    @Override
    @Transactional
    public void deleteNotification(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setDeleted(true);
            notificationRepository.save(notification);
        });
    }

    @Override
    @Transactional
    public void deleteAllNotifications(Long recipientId) {
        notificationRepository.deleteAllByRecipientId(recipientId);
    }

    @Override
    @Transactional
    @Scheduled(cron = "0 0 2 * * ?") // Run at 2 AM every day
    public void cleanupOldNotifications() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(90);
        int deletedCount = notificationRepository.softDeleteOlderThan(cutoff);
        log.info("Cleaned up {} old notifications (older than 90 days)", deletedCount);
    }
}
