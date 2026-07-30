package com.aniket.configrations;

import com.aniket.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class ActivityLogCleanupScheduler {

    private final ActivityLogRepository activityLogRepository;

    /**
     * Clean up activity logs older than 90 days.
     * Runs daily at midnight.
     */
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void cleanupOldActivityLogs() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(90);
        int deletedCount = activityLogRepository.deleteOlderThan(cutoffDate);
        if (deletedCount > 0) {
            log.info("Cleaned up {} activity log entries older than {}", deletedCount, cutoffDate);
        }
    }
}