package com.aniket.mapper;

import com.aniket.modal.ApprovalRequest;
import com.aniket.payload.dto.ApprovalRequestDTO;

public class ApprovalRequestMapper {

    public static ApprovalRequestDTO toDto(ApprovalRequest request) {
        if (request == null) return null;

        return ApprovalRequestDTO.builder()
                .id(request.getId())
                .type(request.getType())
                .status(request.getStatus())
                .storeId(request.getStore() != null ? request.getStore().getId() : null)
                .storeName(request.getStore() != null ? request.getStore().getBrand() : null)
                .storeType(request.getStore() != null ? request.getStore().getStoreType() : null)
                .requestedBy(request.getRequestedBy() != null ? UserMapper.toDTO(request.getRequestedBy()) : null)
                .subscriptionAction(request.getSubscriptionAction())
                .requestedPlanId(request.getRequestedPlan() != null ? request.getRequestedPlan().getId() : null)
                .requestedPlanName(request.getRequestedPlan() != null ? request.getRequestedPlan().getName() : null)
                .requestedPlanPrice(request.getRequestedPlan() != null ? request.getRequestedPlan().getPrice() : null)
                .currentPlanId(request.getCurrentPlan() != null ? request.getCurrentPlan().getId() : null)
                .currentPlanName(request.getCurrentPlan() != null ? request.getCurrentPlan().getName() : null)
                .paymentReference(request.getPaymentReference())
                .rejectionReason(request.getRejectionReason())
                .adminNotes(request.getAdminNotes())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .resolvedAt(request.getResolvedAt())
                .resolvedBy(request.getResolvedBy() != null ? UserMapper.toDTO(request.getResolvedBy()) : null)
                .build();
    }
}
