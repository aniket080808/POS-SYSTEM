package com.aniket.payload.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BranchInventoryDTO {
    private Long id;
    private Long storeId;
    private String storeName;
    private Long productId;
    private String productName;
    private String sku;
    private Integer stock;
    private Double sellingPrice;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}