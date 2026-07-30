package com.aniket.payload.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDTO {
    // Catalog fields (from products table)
    private Long id;
    private String name;
    private String sku;
    private String description;
    private Double mrp;
    private String brand;
    private String image;
    private Long categoryId;
    private String category;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Inventory fields (from branch_inventory table)
    private Long storeId;
    private String storeName;
    private Integer stock;
    private Double sellingPrice;
    private Boolean isActive;
}