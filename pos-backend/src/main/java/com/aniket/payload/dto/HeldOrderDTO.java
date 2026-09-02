package com.aniket.payload.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HeldOrderDTO {
    private Long id;
    private Long branchId;
    private Long storeId;
    private Long cashierId;
    private String cashierName;

    private Long customerId;
    private String customerName;
    private String customerPhone;
    private String note;
    private Double subtotal;
    private Double tax;
    private Double discountAmount;
    private Double totalAmount;
    private String referenceTag;
    private List<HeldOrderItemDTO> items;
    private LocalDateTime createdAt;
}
