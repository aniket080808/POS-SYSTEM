package com.aniket.repository;

import com.aniket.modal.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByRecipientIdAndDeletedFalseOrderByCreatedAtDesc(Long recipientId, Pageable pageable);
    
    Page<Notification> findByRecipientIdAndReadAndDeletedFalseOrderByCreatedAtDesc(Long recipientId, boolean read, Pageable pageable);

    int countByRecipientIdAndReadFalseAndDeletedFalse(Long recipientId);
    
    @Modifying
    @Query("UPDATE Notification n SET n.deleted = true WHERE n.createdAt < :cutoffDate")
    int softDeleteOlderThan(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.recipientId = :recipientId AND n.deleted = false")
    int markAllAsRead(@Param("recipientId") Long recipientId);
    
    @Modifying
    @Query("UPDATE Notification n SET n.deleted = true WHERE n.recipientId = :recipientId")
    int deleteAllByRecipientId(@Param("recipientId") Long recipientId);
}
