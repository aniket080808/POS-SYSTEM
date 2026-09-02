package com.aniket.service.impl;


import com.aniket.exception.UserException;
import com.aniket.mapper.InventoryMapper;
import com.aniket.modal.Branch;
import com.aniket.modal.Inventory;
import com.aniket.modal.Product;
import com.aniket.payload.dto.InventoryDTO;
import com.aniket.repository.BranchRepository;
import com.aniket.repository.InventoryRepository;
import com.aniket.repository.ProductRepository;
import com.aniket.util.SecurityUtil;
import com.aniket.service.InventoryService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.aniket.exception.AccessDeniedException;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final com.aniket.repository.BranchInventoryRepository branchInventoryRepository;
    private final BranchRepository branchRepository;
    private final ProductRepository productRepository;
    private final SecurityUtil securityUtil;

    @Override
    @org.springframework.transaction.annotation.Transactional
    public InventoryDTO createInventory(InventoryDTO dto) throws AccessDeniedException, UserException {
        Branch branch = branchRepository.findById(dto.getBranchId())
                .orElseThrow(() -> new EntityNotFoundException("Branch not found"));
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));

        securityUtil.checkAuthority(branch);

        // 1. Lock/update BranchInventory (Store level)
        if (branch.getStore() != null) {
            com.aniket.modal.BranchInventory storeInventory = branchInventoryRepository
                    .findByStoreIdAndProductIdWithLock(branch.getStore().getId(), product.getId())
                    .orElse(null);
            if (storeInventory != null) {
                storeInventory.setStock(dto.getQuantity() != null ? dto.getQuantity() : 0);
                branchInventoryRepository.save(storeInventory);
            }
        }

        // 2. Lock/update or create Inventory (Branch level)
        Inventory inventory = inventoryRepository
                .findByBranchIdAndProductIdWithLock(branch.getId(), product.getId())
                .orElse(null);

        if (inventory != null) {
            inventory.setQuantity(dto.getQuantity() != null ? dto.getQuantity() : 0);
        } else {
            inventory = InventoryMapper.toEntity(dto, branch, product);
        }

        return InventoryMapper.toDto(inventoryRepository.save(inventory));
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public InventoryDTO updateInventory(Long id, InventoryDTO dto) throws AccessDeniedException, UserException {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Inventory not found"));

        securityUtil.checkAuthority(inventory);

        Integer newQty = (dto != null && dto.getQuantity() != null) ? dto.getQuantity() : 0;

        // 1. Lock/update BranchInventory (Store level)
        if (inventory.getBranch() != null && inventory.getBranch().getStore() != null && inventory.getProduct() != null) {
            com.aniket.modal.BranchInventory storeInventory = branchInventoryRepository
                    .findByStoreIdAndProductIdWithLock(inventory.getBranch().getStore().getId(), inventory.getProduct().getId())
                    .orElse(null);
            if (storeInventory != null) {
                storeInventory.setStock(newQty);
                branchInventoryRepository.save(storeInventory);
            }
        }

        // 2. Update Inventory (Branch level)
        inventory.setQuantity(newQty);
        return InventoryMapper.toDto(inventoryRepository.save(inventory));
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deleteInventory(Long id) throws AccessDeniedException, UserException {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Inventory not found"));

        securityUtil.checkAuthority(inventory);

        inventoryRepository.delete(inventory);
    }

    @Override
    public InventoryDTO getInventoryById(Long id) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Inventory not found"));
        try {
            securityUtil.checkAuthority(inventory);
        } catch (UserException e) {
            throw new AccessDeniedException("Access denied to inventory: " + e.getMessage());
        }

        return InventoryMapper.toDto(inventory);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public List<InventoryDTO> getInventoryByBranch(Long branchId) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new EntityNotFoundException("Branch not found"));
        try {
            securityUtil.checkAuthority(branch);
        } catch (UserException e) {
            throw new AccessDeniedException("Access denied to branch inventory: " + e.getMessage());
        }

        List<Inventory> existing = inventoryRepository.findByBranchId(branchId);

        // Auto-seed/sync missing products from the store's branch_inventory
        if (branch.getStore() != null) {
            List<com.aniket.modal.BranchInventory> storeInventories = branchInventoryRepository.findByStoreId(branch.getStore().getId());
            java.util.Set<Long> existingProductIds = existing.stream()
                    .filter(i -> i.getProduct() != null)
                    .map(i -> i.getProduct().getId())
                    .collect(Collectors.toSet());

            List<Inventory> toCreate = new java.util.ArrayList<>();
            for (com.aniket.modal.BranchInventory bi : storeInventories) {
                if (bi.getProduct() != null && !existingProductIds.contains(bi.getProduct().getId())) {
                    Inventory inv = Inventory.builder()
                            .branch(branch)
                            .product(bi.getProduct())
                            .quantity(bi.getStock() != null ? bi.getStock() : 0)
                            .lastUpdated(java.time.LocalDateTime.now())
                            .build();
                    toCreate.add(inv);
                }
            }
            if (!toCreate.isEmpty()) {
                inventoryRepository.saveAll(toCreate);
                existing = inventoryRepository.findByBranchId(branchId);
            }
        }

        return existing
                .stream()
                .map(InventoryMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public InventoryDTO getInventoryByProductId(Long productId) {
        Inventory inventory = inventoryRepository.findByProductId(productId);
        if (inventory != null) {
            try {
                securityUtil.checkAuthority(inventory);
            } catch (UserException e) {
                throw new AccessDeniedException("Access denied to product inventory: " + e.getMessage());
            }
        }
        return InventoryMapper.toDto(inventory);
    }
}

