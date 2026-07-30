package com.aniket.payload.dto;

import com.aniket.domain.StoreSubscriptionStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreSubscriptionDTO {
    private Long id;
    private Long storeId;
    private StoreSubscriptionStatus status;

    private Long currentPlanId;
    private String currentPlanName;

    private Long requestedPlanId;
    private String requestedPlanName;

    private String rejectionReason;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
