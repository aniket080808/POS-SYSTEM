package com.aniket.payload.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HeldOrderItemDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String sku;
    private Double price;
    private Double sellingPrice;
    private Integer quantity;
    private String image;
}
