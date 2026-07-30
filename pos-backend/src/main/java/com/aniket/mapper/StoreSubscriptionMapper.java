package com.aniket.mapper;

import com.aniket.modal.StoreSubscription;
import com.aniket.payload.dto.StoreSubscriptionDTO;

public class StoreSubscriptionMapper {

    public static StoreSubscriptionDTO toDto(StoreSubscription sub) {
        if (sub == null) return null;

        return StoreSubscriptionDTO.builder()
                .id(sub.getId())
                .storeId(sub.getStore() != null ? sub.getStore().getId() : null)
                .status(sub.getStatus())
                .currentPlanId(sub.getCurrentPlan() != null ? sub.getCurrentPlan().getId() : null)
                .currentPlanName(sub.getCurrentPlan() != null ? sub.getCurrentPlan().getName() : null)
                .requestedPlanId(sub.getRequestedPlan() != null ? sub.getRequestedPlan().getId() : null)
                .requestedPlanName(sub.getRequestedPlan() != null ? sub.getRequestedPlan().getName() : null)
                .rejectionReason(sub.getRejectionReason())
                .createdAt(sub.getCreatedAt())
                .updatedAt(sub.getUpdatedAt())
                .build();
    }
}
