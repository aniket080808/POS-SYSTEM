package com.aniket.payload.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertDismissalDTO {
    private Long id;
    private Long storeId;
    private String alertType; // LOW_STOCK, INACTIVE_CASHIER, NO_SALE_TODAY, REFUND_SPIKE
    private String referenceId;
    private Long dismissedById;
    private LocalDateTime dismissedAt;
    private String snapshotValue;
}
