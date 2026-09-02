package com.aniket.payload.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RefundDTO {
    private Long id;
    private Long orderId;
    private String reason;
    private Double amount;
    private String cashierName;
    private String customerName;
    private com.aniket.domain.PaymentType paymentType;
    private Long shiftReportId;
    private Long branchId;
    private LocalDateTime createdAt;
    private String spikeReason;
    private java.util.List<RefundItemDTO> items;

    public RefundDTO(Long id, Long orderId, String reason, Double amount, String cashierName, Long shiftReportId, Long branchId, LocalDateTime createdAt, String spikeReason) {
        this.id = id;
        this.orderId = orderId;
        this.reason = reason;
        this.amount = amount;
        this.cashierName = cashierName;
        this.shiftReportId = shiftReportId;
        this.branchId = branchId;
        this.createdAt = createdAt;
        this.spikeReason = spikeReason;
    }
}
