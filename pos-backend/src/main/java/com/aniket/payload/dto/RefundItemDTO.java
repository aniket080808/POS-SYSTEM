package com.aniket.payload.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundItemDTO {
    private Long orderItemId;
    private Long productId;
    private Integer quantity;
    private Double price;
}
