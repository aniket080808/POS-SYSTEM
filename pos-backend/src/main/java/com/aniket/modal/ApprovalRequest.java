package com.aniket.modal;

import com.aniket.domain.ApprovalRequestStatus;
import com.aniket.domain.ApprovalRequestType;
import com.aniket.domain.SubscriptionAction;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "approval_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalRequestType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalRequestStatus status;

    @ManyToOne(optional = false)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @ManyToOne
    @JoinColumn(name = "requested_by_id")
    private User requestedBy;

    // Subscription request specific fields
    @Enumerated(EnumType.STRING)
    private SubscriptionAction subscriptionAction;

    @ManyToOne
    @JoinColumn(name = "requested_plan_id")
    private SubscriptionPlan requestedPlan;

    @ManyToOne
    @JoinColumn(name = "current_plan_id")
    private SubscriptionPlan currentPlan;

    private String paymentReference;

    private String rejectionReason;

    private String adminNotes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;

    @ManyToOne
    @JoinColumn(name = "resolved_by_id")
    private User resolvedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = updatedAt = LocalDateTime.now();
        if (status == null) {
            status = ApprovalRequestStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
