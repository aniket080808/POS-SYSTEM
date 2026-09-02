package com.aniket.modal;

import com.aniket.domain.NotificationType;
import com.aniket.domain.Priority;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notif_recipient", columnList = "recipientId"),
    @Index(name = "idx_notif_read", columnList = "read"),
    @Index(name = "idx_notif_deleted", columnList = "deleted"),
    @Index(name = "idx_notif_created_at", columnList = "createdAt")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLRestriction("deleted = false")
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false, length = 1000)
    private String message;
    
    private String entityType;
    private Long entityId;
    
    private String actionUrl;
    
    @Column(nullable = false)
    private Long recipientId;
    
    @Builder.Default
    @Column(nullable = false, name = "read")
    private boolean read = false;
    
    @Builder.Default
    @Column(nullable = false)
    private boolean deleted = false;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
