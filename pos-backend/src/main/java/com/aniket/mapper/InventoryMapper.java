package com.aniket.mapper;


import com.aniket.modal.Branch;
import com.aniket.modal.Inventory;
import com.aniket.modal.Product;
import com.aniket.payload.dto.InventoryDTO;

public class InventoryMapper {

    public static InventoryDTO toDto(Inventory inventory) {
        return InventoryDTO.builder()
                .id(inventory.getId())
                .branchId(inventory.getBranch().getId())
                .productId(inventory.getProduct().getId())
                .quantity(inventory.getQuantity())
                .build();
    }

    public static Inventory toEntity(InventoryDTO dto, Branch branch, Product product) {
        return Inventory.builder()
                .id(dto.getId())
                .branch(branch)
                .product(product)
                .quantity(dto.getQuantity())
                .build();
    }
}

