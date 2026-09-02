package com.aniket.controller;

import com.aniket.exception.AccessDeniedException;
import com.aniket.exception.UserException;
import com.aniket.payload.dto.InventoryDTO;
import com.aniket.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventories")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping
    @PreAuthorize("hasAnyRole('STORE_MANAGER', 'STORE_ADMIN', 'BRANCH_ADMIN', 'BRANCH_MANAGER', 'ADMIN')")
    public ResponseEntity<InventoryDTO> create(@RequestBody InventoryDTO dto) throws AccessDeniedException, UserException {
        return ResponseEntity.ok(inventoryService.createInventory(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STORE_MANAGER', 'STORE_ADMIN', 'BRANCH_ADMIN', 'BRANCH_MANAGER', 'ADMIN')")
    public ResponseEntity<InventoryDTO> update(@PathVariable Long id,
                                               @RequestBody InventoryDTO dto) throws AccessDeniedException, UserException {
        return ResponseEntity.ok(inventoryService.updateInventory(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STORE_MANAGER', 'STORE_ADMIN', 'BRANCH_ADMIN', 'BRANCH_MANAGER', 'ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) throws AccessDeniedException, UserException {
        inventoryService.deleteInventory(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STORE_MANAGER', 'STORE_ADMIN', 'BRANCH_ADMIN', 'BRANCH_MANAGER', 'BRANCH_CASHIER', 'ADMIN')")
    public ResponseEntity<InventoryDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.getInventoryById(id));
    }

    @GetMapping("/product/{productId}")
    @PreAuthorize("hasAnyRole('STORE_MANAGER', 'STORE_ADMIN', 'BRANCH_ADMIN', 'BRANCH_MANAGER', 'BRANCH_CASHIER', 'ADMIN')")
    public ResponseEntity<InventoryDTO> getInventoryByProduct(
            @PathVariable Long productId) {
        return ResponseEntity.ok(
                inventoryService.getInventoryByProductId(productId)
        );
    }

    @GetMapping("/branch/{branchId}")
    @PreAuthorize("hasAnyRole('STORE_MANAGER', 'STORE_ADMIN', 'BRANCH_ADMIN', 'BRANCH_MANAGER', 'BRANCH_CASHIER', 'ADMIN')")
    public ResponseEntity<List<InventoryDTO>> getByBranch(@PathVariable Long branchId) {
        return ResponseEntity.ok(inventoryService.getInventoryByBranch(branchId));
    }

}
