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
public class LowStockAlertEvent {
    private Long branchId;
    private String branchName;
    private Long productId;
    private String productName;
    private Integer currentStock;
    private Integer threshold;
    private LocalDateTime alertTime;
}
