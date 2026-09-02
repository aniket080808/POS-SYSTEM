package com.aniket.controller;

import com.aniket.modal.PaymentSummary;
import com.aniket.modal.User;
import com.aniket.payload.dto.*;
import com.aniket.modal.Branch;
import com.aniket.repository.BranchRepository;
import com.aniket.service.BranchAnalyticsService;
import com.aniket.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/branch-analytics")
@RequiredArgsConstructor
public class BranchAnalyticsController {

    private final BranchAnalyticsService branchAnalyticsService;
    private final UserService userService;
    private final BranchRepository branchRepository;

    // ✅ Allow BRANCH_MANAGER, BRANCH_ADMIN, STORE_ADMIN, STORE_MANAGER, and Super ADMIN
    private static final String ALLOWED_ROLES = "hasAnyRole('BRANCH_MANAGER', 'BRANCH_ADMIN', 'STORE_ADMIN', 'STORE_MANAGER', 'ADMIN')";

    /**
     * Verify the caller owns the requested branchId, or belongs to the same store.
     * Prevents IDOR — a manager of branch A cannot query branch B's data.
     */
    private void verifyBranchAccess(User caller, Long branchId) {
        if (caller == null) {
            throw new com.aniket.exception.AccessDeniedException("Authentication required.");
        }
        // Super Admin (ROLE_ADMIN) has global access across all tenants and branches
        if (caller.getRole() == com.aniket.domain.UserRole.ROLE_ADMIN) {
            return;
        }
        // Branch-level users must own the exact branch
        if (caller.getBranch() != null) {
            if (!caller.getBranch().getId().equals(branchId)) {
                throw new com.aniket.exception.AccessDeniedException(
                        "You are not authorized to access analytics for this branch.");
            }
            return;
        }
        // Store-level users (STORE_ADMIN/STORE_MANAGER) can access any branch in their store
        if (caller.getStore() != null) {
            Branch branch = branchRepository.findById(branchId).orElse(null);
            if (branch == null || branch.getStore() == null ||
                    !branch.getStore().getId().equals(caller.getStore().getId())) {
                throw new com.aniket.exception.AccessDeniedException(
                        "You are not authorized to access analytics for this branch.");
            }
            return;
        }
        // Fallback: If user is the storeAdmin entity of the store that owns this branch
        Branch branch = branchRepository.findById(branchId).orElse(null);
        if (branch != null && branch.getStore() != null && branch.getStore().getStoreAdmin() != null &&
                branch.getStore().getStoreAdmin().getId().equals(caller.getId())) {
            return;
        }
        throw new com.aniket.exception.AccessDeniedException(
                "You are not authorized to access analytics for this branch.");
    }

    /**
     * Get daily sales chart data (last n days)
     */
    @GetMapping("/daily-sales")
    @PreAuthorize(ALLOWED_ROLES)
    public ResponseEntity<List<DailySalesDTO>> getDailySalesChart(
            @RequestParam Long branchId,
            @RequestParam(defaultValue = "7") int days,
            @RequestHeader("Authorization") String jwt
    ) throws Exception {
        User caller = userService.getUserFromJwtToken(jwt);
        verifyBranchAccess(caller, branchId);
        return ResponseEntity.ok(branchAnalyticsService.getDailySalesChart(branchId, days));
    }

    /**
     * Get top 5 products by quantity (with % contribution)
     */
    @GetMapping("/top-products")
    @PreAuthorize(ALLOWED_ROLES)
    public ResponseEntity<List<ProductPerformanceDTO>> getTopProductsByQuantity(
            @RequestParam Long branchId,
            @RequestHeader("Authorization") String jwt
    ) throws Exception {
        User caller = userService.getUserFromJwtToken(jwt);
        verifyBranchAccess(caller, branchId);
        return ResponseEntity.ok(branchAnalyticsService.getTopProductsByQuantityWithPercentage(branchId));
    }

    /**
     * Get top 5 cashiers by revenue
     */
    @GetMapping("/top-cashiers")
    @PreAuthorize(ALLOWED_ROLES)
    public ResponseEntity<List<CashierPerformanceDTO>> getTopCashiersByRevenue(
            @RequestParam Long branchId,
            @RequestHeader("Authorization") String jwt
    ) throws Exception {
        User caller = userService.getUserFromJwtToken(jwt);
        verifyBranchAccess(caller, branchId);
        return ResponseEntity.ok(branchAnalyticsService.getTopCashierPerformanceByOrders(branchId));
    }

    /**
     * Get category-wise sales breakdown
     */
    @GetMapping("/category-sales")
    @PreAuthorize(ALLOWED_ROLES)
    public ResponseEntity<List<CategorySalesDTO>> getCategoryWiseSalesBreakdown(
            @RequestParam Long branchId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestHeader("Authorization") String jwt
    ) throws Exception {
        User caller = userService.getUserFromJwtToken(jwt);
        verifyBranchAccess(caller, branchId);
        return ResponseEntity.ok(branchAnalyticsService.getCategoryWiseSalesBreakdown(branchId, date));
    }

    @GetMapping("/today-overview")
    @PreAuthorize(ALLOWED_ROLES)
    public ResponseEntity<BranchDashboardOverviewDTO> getTodayOverview(
            @RequestParam Long branchId,
            @RequestHeader("Authorization") String jwt
    ) throws Exception {
        User caller = userService.getUserFromJwtToken(jwt);
        verifyBranchAccess(caller, branchId);
        return ResponseEntity.ok(branchAnalyticsService.getBranchOverview(branchId));
    }


    @GetMapping("/payment-breakdown")
    @PreAuthorize(ALLOWED_ROLES)
    public ResponseEntity<List<PaymentSummary>> getPaymentBreakdown(
            @RequestParam Long branchId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestHeader("Authorization") String jwt
    ) throws Exception {
        User caller = userService.getUserFromJwtToken(jwt);
        verifyBranchAccess(caller, branchId);
        return ResponseEntity.ok(
                branchAnalyticsService.getPaymentMethodBreakdown(branchId, date)
        );
    }

}
