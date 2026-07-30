package com.aniket.modal;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notification_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreference {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private Long userId;
    
    @Builder.Default
    private boolean newStoreRequests = true;
    @Builder.Default
    private boolean storeApprovals = true;
    @Builder.Default
    private boolean commissionUpdates = false;
    @Builder.Default
    private boolean systemAlerts = true;
    @Builder.Default
    private boolean emailNotifications = true;
}
