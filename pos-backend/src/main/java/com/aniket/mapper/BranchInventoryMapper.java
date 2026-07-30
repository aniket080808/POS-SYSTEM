package com.aniket.mapper;

import com.aniket.modal.BranchInventory;
import com.aniket.payload.dto.BranchInventoryDTO;

public class BranchInventoryMapper {

    public static BranchInventoryDTO toDto(BranchInventory inventory) {
        if (inventory == null) return null;

        return BranchInventoryDTO.builder()
                .id(inventory.getId())
                .storeId(inventory.getStore() != null ? inventory.getStore().getId() : null)
                .storeName(inventory.getStore() != null ? inventory.getStore().getBrand() : null)
                .productId(inventory.getProduct() != null ? inventory.getProduct().getId() : null)
                .productName(inventory.getProduct() != null ? inventory.getProduct().getName() : null)
                .sku(inventory.getProduct() != null ? inventory.getProduct().getSku() : null)
                .stock(inventory.getStock())
                .sellingPrice(inventory.getSellingPrice())
                .isActive(inventory.getIsActive())
                .createdAt(inventory.getCreatedAt())
                .updatedAt(inventory.getUpdatedAt())
                .build();
    }

    public static BranchInventory toEntity(BranchInventoryDTO dto) {
        if (dto == null) return null;

        return BranchInventory.builder()
                .id(dto.getId())
                .stock(dto.getStock())
                .sellingPrice(dto.getSellingPrice())
                .isActive(dto.getIsActive())
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .build();
    }
}