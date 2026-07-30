package com.aniket.payload.dto;

import com.aniket.domain.BillingCycle;
import com.aniket.domain.StoreSubscriptionStatus;
import com.aniket.domain.SubscriptionStatus;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreSubscriptionDetailDTO {
    private Long storeId;
    private StoreSubscriptionStatus subscriptionStatus;

    // Current plan info
    private Long planId;
    private String planName;
    private Double planPrice;
    private BillingCycle billingCycle;

    // Active subscription period info
    private SubscriptionStatus status; // TRIAL, ACTIVE, EXPIRED, CANCELLED
    private LocalDate startDate;
    private LocalDate endDate;
}