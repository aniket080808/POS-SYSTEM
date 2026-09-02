package com.aniket.controller;

import com.aniket.modal.User;
import com.aniket.payload.dto.HeldOrderDTO;
import com.aniket.service.HeldOrderService;
import com.aniket.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/cashier/held-orders")
@RequiredArgsConstructor
public class HeldOrderController {

    private final HeldOrderService heldOrderService;
    private final UserService userService;

    @PostMapping
    @PreAuthorize("hasAnyRole('BRANCH_CASHIER', 'BRANCH_MANAGER', 'BRANCH_ADMIN', 'STORE_ADMIN')")
    public ResponseEntity<HeldOrderDTO> parkOrder(@RequestBody HeldOrderDTO dto) throws Exception {
        User user = userService.getCurrentUser();
        if (dto.getCashierId() == null && user != null) {
            dto.setCashierId(user.getId());
            dto.setCashierName(user.getFullName());
        }
        if (dto.getBranchId() == null && user != null && user.getBranch() != null) {
            dto.setBranchId(user.getBranch().getId());
        }
        HeldOrderDTO saved = heldOrderService.saveHeldOrder(dto);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('BRANCH_CASHIER', 'BRANCH_MANAGER', 'BRANCH_ADMIN', 'STORE_ADMIN')")
    public ResponseEntity<List<HeldOrderDTO>> getHeldOrders(@RequestParam(value = "branchId", required = false) Long branchId) throws Exception {
        User user = userService.getCurrentUser();
        Long effectiveBranchId = branchId != null ? branchId : (user != null && user.getBranch() != null ? user.getBranch().getId() : null);
        if (effectiveBranchId != null) {
            return ResponseEntity.ok(heldOrderService.getHeldOrdersByBranch(effectiveBranchId));
        }
        if (user != null) {
            return ResponseEntity.ok(heldOrderService.getHeldOrdersByCashier(user.getId()));
        }
        return ResponseEntity.ok(java.util.Collections.emptyList());
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('BRANCH_CASHIER', 'BRANCH_MANAGER', 'BRANCH_ADMIN', 'STORE_ADMIN')")
    public ResponseEntity<Void> deleteHeldOrder(@PathVariable Long id) {
        heldOrderService.deleteHeldOrder(id);
        return ResponseEntity.noContent().build();
    }
}
