package com.aniket.modal;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "alert_dismissals", indexes = {
    @Index(name = "idx_alert_dismissal_store_ref", columnList = "storeId, alertType, referenceId")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertDismissal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long storeId;

    @Column(nullable = false)
    private String alertType; // LOW_STOCK, INACTIVE_CASHIER, NO_SALE_TODAY, REFUND_SPIKE

    @Column(nullable = false)
    private String referenceId; // product ID, cashier ID, branch ID, or refund ID

    private Long dismissedById;

    @Column(nullable = false)
    private LocalDateTime dismissedAt;

    private String snapshotValue; // e.g., stock level or date string at time of dismissal

    @PrePersist
    protected void onCreate() {
        if (dismissedAt == null) {
            dismissedAt = LocalDateTime.now();
        }
    }
}
