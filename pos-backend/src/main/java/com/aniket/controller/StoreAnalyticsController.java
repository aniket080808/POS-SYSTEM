package com.aniket.controller;

import com.aniket.exception.AccessDeniedException;
import com.aniket.exception.UserException;
import com.aniket.modal.Store;
import com.aniket.modal.User;
import com.aniket.payload.StoreAnalysis.*;
import com.aniket.service.StoreAnalyticsService;
import com.aniket.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/store/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('STORE_ADMIN', 'STORE_MANAGER', 'ADMIN')")
public class StoreAnalyticsController {

    private final StoreAnalyticsService storeAnalyticsService;
    private final UserService userService;
    private final com.aniket.repository.StoreRepository storeRepository;

    private Long verifyStoreAdminAccess(Long storeAdminId) {
        try {
            User currentUser = userService.getCurrentUser();

            // 👑 Super Admin can access any store's analytics
            if (currentUser.getRole() == com.aniket.domain.UserRole.ROLE_ADMIN) {
                org.springframework.web.context.request.RequestAttributes attribs =
                        org.springframework.web.context.request.RequestContextHolder.getRequestAttributes();
                if (attribs instanceof org.springframework.web.context.request.ServletRequestAttributes servletAttribs) {
                    String impId = servletAttribs.getRequest().getHeader("X-Impersonate-Store-Id");
                    if (impId != null && !impId.trim().isEmpty()) {
                        try {
                            Long storeId = Long.parseLong(impId.trim());
                            Store store = storeRepository.findById(storeId).orElse(null);
                            if (store != null && store.getStoreAdmin() != null) {
                                return store.getStoreAdmin().getId();
                            }
                        } catch (NumberFormatException ignored) {}
                    }
                }
                return storeAdminId;
            }

            Store userStore = currentUser.getStore();

            if (userStore == null) {
                // If branch user, get store via branch
                if (currentUser.getBranch() != null) {
                    userStore = currentUser.getBranch().getStore();
                }
            }

            if (userStore == null) {
                // If store admin whose user entity has lazy/unlinked store, find via repo
                userStore = storeRepository.findByStoreAdminId(currentUser.getId());
            }

            if (userStore == null || userStore.getStoreAdmin() == null) {
                throw new AccessDeniedException("You are not authorized to access this store's analytics.");
            }

            Long actualStoreAdminId = userStore.getStoreAdmin().getId();
            boolean isStoreAdmin = actualStoreAdminId.equals(storeAdminId);
            boolean isStoreEmployee = currentUser.getId().equals(storeAdminId);

            // 🛡️ IDOR Guard: non-super admin callers can only query their own store's admin ID or their own user ID
            if (!isStoreAdmin && !isStoreEmployee) {
                throw new AccessDeniedException("You are not authorized to access another store's analytics.");
            }

            // Always return the actual store admin's ID to ensure repository queries resolve the correct store data
            return actualStoreAdminId;
        } catch (UserException e) {
            throw new AccessDeniedException("You are not authorized to access this store's analytics.", e);
        }
    }

    // ✨ Store Overview (KPI Summary)
    @GetMapping("/{storeAdminId}/overview")
    public StoreOverviewDTO getStoreOverview(@PathVariable Long storeAdminId) {
        Long adminId = verifyStoreAdminAccess(storeAdminId);
        return storeAnalyticsService.getStoreOverview(adminId);
    }

    // 📊 Sales Trends by Time (daily/weekly/monthly)
    @GetMapping("/{storeAdminId}/sales-trends")
    public TimeSeriesDataDTO getSalesTrends(@PathVariable Long storeAdminId,
                                            @RequestParam String period) {
        Long adminId = verifyStoreAdminAccess(storeAdminId);
        return storeAnalyticsService.getSalesTrends(adminId, period);
    }

    // 📅 Monthly Sales Chart (line)
    @GetMapping("/{storeAdminId}/sales/monthly")
    public List<TimeSeriesPointDTO> getMonthlySales(@PathVariable Long storeAdminId) {
        Long adminId = verifyStoreAdminAccess(storeAdminId);
        return storeAnalyticsService.getMonthlySalesGraph(adminId);
    }

    // 🗓️ Daily Sales Chart (line)
    @GetMapping("/{storeAdminId}/sales/daily")
    public List<TimeSeriesPointDTO> getDailySales(@PathVariable Long storeAdminId) {
        Long adminId = verifyStoreAdminAccess(storeAdminId);
        return storeAnalyticsService.getDailySalesGraph(adminId);
    }

    // 📚 Sales by Product Category (pie/bar)
    @GetMapping("/{storeAdminId}/sales/category")
    public List<CategorySalesDTO> getSalesByCategory(@PathVariable Long storeAdminId) {
        Long adminId = verifyStoreAdminAccess(storeAdminId);
        return storeAnalyticsService.getSalesByCategory(adminId);
    }

    // 💳 Sales by Payment Method (pie)
    @GetMapping("/{storeAdminId}/sales/payment-method")
    public List<PaymentInsightDTO> getSalesByPaymentMethod(@PathVariable Long storeAdminId) {
        Long adminId = verifyStoreAdminAccess(storeAdminId);
        return storeAnalyticsService.getSalesByPaymentMethod(adminId);
    }

    // 📍 Sales by Branch (bar)
    @GetMapping("/{storeAdminId}/sales/branch")
    public List<BranchSalesDTO> getSalesByBranch(@PathVariable Long storeAdminId) {
        Long adminId = verifyStoreAdminAccess(storeAdminId);
        return storeAnalyticsService.getSalesByBranch(adminId);
    }

    // 💵 Payment Breakdown (Cash, UPI, Card)
    @GetMapping("/{storeAdminId}/payments")
    public List<PaymentInsightDTO> getPaymentBreakdown(@PathVariable Long storeAdminId) {
        Long adminId = verifyStoreAdminAccess(storeAdminId);
        return storeAnalyticsService.getPaymentBreakdown(adminId);
    }

    // 🏘️ Branch Performance
    @GetMapping("/{storeAdminId}/branch-performance")
    public BranchPerformanceDTO getBranchPerformance(@PathVariable Long storeAdminId) {
        Long adminId = verifyStoreAdminAccess(storeAdminId);
        return storeAnalyticsService.getBranchPerformance(adminId);
    }

    // 🆕 Recent Sales (for dashboard card)
    @GetMapping("/{storeAdminId}/sales/recent")
    public List<RecentSaleDTO> getRecentSales(@PathVariable Long storeAdminId,
                                               @RequestParam(defaultValue = "5") int limit) {
        Long adminId = verifyStoreAdminAccess(storeAdminId);
        return storeAnalyticsService.getRecentSales(adminId, limit);
    }

    // ⚠️ Alerts and Health Monitoring
    @GetMapping("/{storeAdminId}/alerts")
    public StoreAlertDTO getStoreAlerts(@PathVariable Long storeAdminId) {
        Long adminId = verifyStoreAdminAccess(storeAdminId);
        return storeAnalyticsService.getStoreAlerts(adminId);
    }

    @PostMapping("/{storeAdminId}/alerts/dismiss")
    public com.aniket.payload.dto.AlertDismissalDTO dismissAlert(@PathVariable Long storeAdminId,
                                                                 @RequestBody com.aniket.payload.dto.AlertDismissalDTO dto) {
        Long adminId = verifyStoreAdminAccess(storeAdminId);
        return storeAnalyticsService.dismissAlert(adminId, dto);
    }

    // 🔒 Super Admin only endpoints below
    @RestController
    @RequestMapping("/api/super-admin/stores")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @RequiredArgsConstructor
    public class SuperAdminStoreAnalyticsController {

        private final StoreAnalyticsService storeAnalyticsService;

        /**
         * 🛡️ Get store plan usage (limits + actual counts) for Super Admin
         */
        @GetMapping("/{storeId}/usage")
        public com.aniket.payload.dto.StoreUsageDTO getStoreUsageForAdmin(@PathVariable Long storeId) {
            return storeAnalyticsService.getStoreUsageForAdmin(storeId);
        }
    }
}
