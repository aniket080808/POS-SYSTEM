package com.aniket.payload.response;

import com.aniket.domain.StoreStatus;
import com.aniket.domain.StoreSubscriptionStatus;
import com.aniket.modal.SubscriptionPlan;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreSubscriptionStatusResponse {
    private StoreStatus registrationStatus;
    private String registrationRejectionReason;
    private StoreSubscriptionStatus subscriptionStatus;

    private SubscriptionPlan currentPlan;
    private SubscriptionPlan requestedPlan;
    private String subscriptionRejectionReason;

    private Long rejectedPlanId;
    private String rejectedPlanName;
}
