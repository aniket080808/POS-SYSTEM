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
    private Integer quantity;

    public ProductDTO(Long id, String name, String sku, String description, Double mrp,
                      String brand, String image, Long categoryId, String category,
                      LocalDateTime createdAt, LocalDateTime updatedAt, Long storeId,
                      String storeName, Integer stock, Double sellingPrice, Boolean isActive) {
        this.id = id;
        this.name = name;
        this.sku = sku;
        this.description = description;
        this.mrp = mrp;
        this.brand = brand;
        this.image = image;
        this.categoryId = categoryId;
        this.category = category;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.storeId = storeId;
        this.storeName = storeName;
        this.stock = stock;
        this.sellingPrice = sellingPrice;
        this.isActive = isActive;
    }
}