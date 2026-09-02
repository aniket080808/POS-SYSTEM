package com.aniket.service;

import com.aniket.exception.AccessDeniedException;
import com.aniket.exception.UserException;
import com.aniket.payload.dto.InventoryDTO;

import java.util.List;

public interface InventoryService {
    InventoryDTO createInventory(InventoryDTO dto) throws AccessDeniedException, UserException;
    InventoryDTO updateInventory(Long id, InventoryDTO dto) throws AccessDeniedException, UserException;
    void deleteInventory(Long id) throws AccessDeniedException, UserException;
    InventoryDTO getInventoryById(Long id);
    InventoryDTO getInventoryByProductId(Long productId);
    List<InventoryDTO> getInventoryByBranch(Long branchId);
}
