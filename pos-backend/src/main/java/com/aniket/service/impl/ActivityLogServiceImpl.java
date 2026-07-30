package com.aniket.service.impl;

import com.aniket.modal.ActivityLog;
import com.aniket.repository.ActivityLogRepository;
import com.aniket.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ActivityLogServiceImpl implements ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void log(String action, String description, String entityType, Long entityId, String performedBy, String status) {
        ActivityLog log = ActivityLog.builder()
                .action(action)
                .description(description)
                .entityType(entityType)
                .entityId(entityId)
                .performedBy(performedBy)
                .status(status)
                .build();
        activityLogRepository.save(log);

        // Broadcast the new activity to connected WebSocket clients
        try {
            messagingTemplate.convertAndSend("/topic/activities", log);
        } catch (Exception e) {
            // WebSocket broker may not be available; ignore
        }
    }
}