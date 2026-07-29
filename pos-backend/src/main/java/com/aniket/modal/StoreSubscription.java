package com.aniket.modal;

import com.aniket.domain.StoreSubscriptionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "store_subscriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "store_id", referencedColumnName = "id", nullable = false, unique = true)
    private Store store;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StoreSubscriptionStatus status;

    @ManyToOne
    @JoinColumn(name = "current_plan_id")
    private SubscriptionPlan currentPlan;

    @ManyToOne
    @JoinColumn(name = "requested_plan_id")
    private SubscriptionPlan requestedPlan;

    private String rejectionReason;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = updatedAt = LocalDateTime.now();
        if (status == null) {
            status = StoreSubscriptionStatus.NONE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
