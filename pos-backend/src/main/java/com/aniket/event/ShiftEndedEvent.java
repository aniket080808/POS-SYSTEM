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
public class ShiftEndedEvent {
    private Long shiftId;
    private Long branchId;
    private String branchName;
    private Long cashierId;
    private String cashierName;
    private Double totalSales;
    private Integer totalOrders;
    private LocalDateTime shiftStart;
    private LocalDateTime shiftEnd;
}
