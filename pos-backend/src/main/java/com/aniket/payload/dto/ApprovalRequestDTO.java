package com.aniket.payload.dto;

import com.aniket.domain.ApprovalRequestStatus;
import com.aniket.domain.ApprovalRequestType;
import com.aniket.domain.SubscriptionAction;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalRequestDTO {
    private Long id;
    private ApprovalRequestType type;
    private ApprovalRequestStatus status;

    private Long storeId;
    private String storeName;
    private String storeType;
    private UserDTO requestedBy;

    private SubscriptionAction subscriptionAction;
    private Long requestedPlanId;
    private String requestedPlanName;
    private Double requestedPlanPrice;

    private Long currentPlanId;
    private String currentPlanName;

    private String paymentReference;
    private String rejectionReason;
    private String adminNotes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private UserDTO resolvedBy;
}
