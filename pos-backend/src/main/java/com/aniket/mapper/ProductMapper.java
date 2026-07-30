package com.aniket.mapper;

import com.aniket.modal.BranchInventory;
import com.aniket.modal.Product;
import com.aniket.modal.Store;
import com.aniket.payload.dto.ProductDTO;

public class ProductMapper {

    public static ProductDTO toDto(Product product, BranchInventory inventory) {
        if (product == null) return null;

        return ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .sku(product.getSku())
                .description(product.getDescription())
                .mrp(product.getMrp())
                .brand(product.getBrand())
                .image(product.getImage())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .category(product.getCategory() != null ? product.getCategory().getName() : null)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                // Inventory fields from branch_inventory
                .storeId(inventory != null && inventory.getStore() != null ? inventory.getStore().getId() : null)
                .storeName(inventory != null && inventory.getStore() != null ? inventory.getStore().getBrand() : null)
                .stock(inventory != null ? inventory.getStock() : 0)
                .sellingPrice(inventory != null ? inventory.getSellingPrice() : null)
                .isActive(inventory != null ? inventory.getIsActive() : null)
                .build();
    }

    public static ProductDTO toDto(Product product) {
        return toDto(product, null);
    }

    public static Product toEntity(ProductDTO dto, Store store) {
        if (dto == null) return null;

        return Product.builder()
                .id(dto.getId())
                .name(dto.getName())
                .sku(dto.getSku())
                .description(dto.getDescription())
                .mrp(dto.getMrp())
                .brand(dto.getBrand())
                .image(dto.getImage())
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .build();
    }
}