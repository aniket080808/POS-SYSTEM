package com.aniket.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundCreatedEvent {
    private Long refundId;
    private Long orderId;
    private Long branchId;
    private String branchName;
    private Long cashierId;
    private String cashierName;
    private Double amount;
    private String reason;
    private LocalDateTime createdAt;
}
