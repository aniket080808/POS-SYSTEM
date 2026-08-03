package com.aniket.controller;

import com.aniket.exception.AccessDeniedException;
import com.aniket.exception.UserException;
import com.aniket.modal.Store;
import com.aniket.modal.User;
import com.aniket.payload.StoreAnalysis.*;
import com.aniket.service.StoreAnalyticsService;
import com.aniket.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/store/analytics")
@RequiredArgsConstructor
public class StoreAnalyticsController {

    private final StoreAnalyticsService storeAnalyticsService;
    private final UserService userService;

    private void verifyStoreAdminAccess(Long storeAdminId) {
        try {
            User currentUser = userService.getCurrentUser();
            Store userStore = currentUser.getStore();
            if (userStore == null || userStore.getStoreAdmin() == null
                    || !userStore.getStoreAdmin().getId().equals(storeAdminId)) {
                throw new AccessDeniedException("You are not authorized to access this store's analytics.");
            }
        } catch (UserException e) {
            throw new AccessDeniedException("You are not authorized to access this store's analytics.", e);
        }
    }

    // ✨ Store Overview (KPI Summary)
    @GetMapping("/{storeAdminId}/overview")
    public StoreOverviewDTO getStoreOverview(@PathVariable Long storeAdminId) {
        verifyStoreAdminAccess(storeAdminId);
        return storeAnalyticsService.getStoreOverview(storeAdminId);
    }

    // 📊 Sales Trends by Time (daily/weekly/monthly)
    @GetMapping("/{storeAdminId}/sales-trends")
    public TimeSeriesDataDTO getSalesTrends(@PathVariable Long storeAdminId,
                                            @RequestParam String period) {
        verifyStoreAdminAccess(storeAdminId);
        return storeAnalyticsService.getSalesTrends(storeAdminId, period); // implement logic if needed
    }

    // 📅 Monthly Sales Chart (line)
    @GetMapping("/{storeAdminId}/sales/monthly")
    public List<TimeSeriesPointDTO> getMonthlySales(@PathVariable Long storeAdminId) {
        verifyStoreAdminAccess(storeAdminId);
        return storeAnalyticsService.getMonthlySalesGraph(storeAdminId);
    }

    // 🗓️ Daily Sales Chart (line)
    @GetMapping("/{storeAdminId}/sales/daily")
    public List<TimeSeriesPointDTO> getDailySales(@PathVariable Long storeAdminId) {
        verifyStoreAdminAccess(storeAdminId);
        return storeAnalyticsService.getDailySalesGraph(storeAdminId);
    }

    // 📚 Sales by Product Category (pie/bar)
    @GetMapping("/{storeAdminId}/sales/category")
    public List<CategorySalesDTO> getSalesByCategory(@PathVariable Long storeAdminId) {
        verifyStoreAdminAccess(storeAdminId);
        return storeAnalyticsService.getSalesByCategory(storeAdminId);
    }

    // 💳 Sales by Payment Method (pie)
    @GetMapping("/{storeAdminId}/sales/payment-method")
    public List<PaymentInsightDTO> getSalesByPaymentMethod(@PathVariable Long storeAdminId) {
        verifyStoreAdminAccess(storeAdminId);
        return storeAnalyticsService.getSalesByPaymentMethod(storeAdminId);
    }

    // 📍 Sales by Branch (bar)
    @GetMapping("/{storeAdminId}/sales/branch")
    public List<BranchSalesDTO> getSalesByBranch(@PathVariable Long storeAdminId) {
        verifyStoreAdminAccess(storeAdminId);
        return storeAnalyticsService.getSalesByBranch(storeAdminId);
    }

    // 💵 Payment Breakdown (Cash, UPI, Card)
    @GetMapping("/{storeAdminId}/payments")
    public List<PaymentInsightDTO> getPaymentBreakdown(@PathVariable Long storeAdminId) {
        verifyStoreAdminAccess(storeAdminId);
        return storeAnalyticsService.getPaymentBreakdown(storeAdminId);
    }

    // 🏘️ Branch Performance
    @GetMapping("/{storeAdminId}/branch-performance")
    public BranchPerformanceDTO getBranchPerformance(@PathVariable Long storeAdminId) {
        verifyStoreAdminAccess(storeAdminId);
        return storeAnalyticsService.getBranchPerformance(storeAdminId);
    }

    // 🆕 Recent Sales (for dashboard card)
    @GetMapping("/{storeAdminId}/sales/recent")
    public List<RecentSaleDTO> getRecentSales(@PathVariable Long storeAdminId,
                                               @RequestParam(defaultValue = "5") int limit) {
        verifyStoreAdminAccess(storeAdminId);
        return storeAnalyticsService.getRecentSales(storeAdminId, limit);
    }

    // ⚠️ Alerts and Health Monitoring
    @GetMapping("/{storeAdminId}/alerts")
    public StoreAlertDTO getStoreAlerts(@PathVariable Long storeAdminId) {
        verifyStoreAdminAccess(storeAdminId);
        return storeAnalyticsService.getStoreAlerts(storeAdminId);
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
