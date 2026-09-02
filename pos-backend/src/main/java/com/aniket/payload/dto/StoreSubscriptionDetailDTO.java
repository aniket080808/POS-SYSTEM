package com.aniket.payload.dto;

import com.aniket.domain.BillingCycle;
import com.aniket.domain.StoreSubscriptionStatus;
import com.aniket.domain.SubscriptionStatus;
import com.aniket.modal.SubscriptionPlan;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreSubscriptionDetailDTO {
    private Long storeId;
    private StoreSubscriptionStatus subscriptionStatus;

    // Current active plan info
    private Long planId;
    private String planName;
    private Double planPrice;
    private BillingCycle billingCycle;
    private Integer maxProducts;
    private Integer maxBranches;
    private Integer maxUsers;

    // Nested currentPlan object for frontends expecting currentPlan.*
    private SubscriptionPlan currentPlan;

    // Pending Requested Plan (if any upgrade/request is pending approval)
    private Long requestedPlanId;
    private String requestedPlanName;
    private Double requestedPlanPrice;
    private BillingCycle requestedPlanBillingCycle;
    private Integer requestedMaxBranches;
    private Integer requestedMaxUsers;
    private Integer requestedMaxProducts;
    private SubscriptionPlan requestedPlan;
    private Boolean isPendingApproval;

    // Subscription status representation
    private String status; // PENDING, TRIAL, ACTIVE, EXPIRED, CANCELLED
    private LocalDate startDate;
    private LocalDate endDate;
}