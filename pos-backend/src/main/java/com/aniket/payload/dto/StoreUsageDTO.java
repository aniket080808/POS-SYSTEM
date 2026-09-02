package com.aniket.payload.dto;

import com.aniket.domain.BillingCycle;
import com.aniket.domain.StoreSubscriptionStatus;
import com.aniket.domain.SubscriptionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreUsageDTO {
    private Long storeId;

    // Current plan info
    private Long planId;
    private String planName;
    private Double planPrice;
    private BillingCycle billingCycle;

    // Subscription status
    private StoreSubscriptionStatus subscriptionStatus;
    private SubscriptionStatus status; // TRIAL, ACTIVE, EXPIRED, CANCELLED
    private LocalDate startDate;
    private LocalDate endDate;

    // Plan limits
    private Integer maxProducts;
    private Integer maxBranches;
    private Integer maxUsers;

    // Usage counts
    private Integer totalProductsUsed;
    private Integer totalBranchesUsed;
    private Integer totalEmployeesUsed;

    // Direct aliases for frontend property binding
    public Integer getActiveBranches() {
        return totalBranchesUsed != null ? totalBranchesUsed : 0;
    }

    public Integer getActiveUsers() {
        return totalEmployeesUsed != null ? totalEmployeesUsed : 0;
    }

    public Integer getActiveProducts() {
        return totalProductsUsed != null ? totalProductsUsed : 0;
    }
}