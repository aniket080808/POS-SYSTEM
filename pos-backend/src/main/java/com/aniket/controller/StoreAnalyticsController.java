package com.aniket.controller;

import com.aniket.payload.StoreAnalysis.*;
import com.aniket.service.StoreAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/store/analytics")
@RequiredArgsConstructor
public class StoreAnalyticsController {

    private final StoreAnalyticsService storeAnalyticsService;

    // ✨ Store Overview (KPI Summary)
    @GetMapping("/{storeAdminId}/overview")
    public StoreOverviewDTO getStoreOverview(@PathVariable Long storeAdminId) {
        return storeAnalyticsService.getStoreOverview(storeAdminId);
    }

    // 📊 Sales Trends by Time (daily/weekly/monthly)
    @GetMapping("/{storeAdminId}/sales-trends")
    public TimeSeriesDataDTO getSalesTrends(@PathVariable Long storeAdminId,
                                            @RequestParam String period) {
        return storeAnalyticsService.getSalesTrends(storeAdminId, period); // implement logic if needed
    }

    // 📅 Monthly Sales Chart (line)
    @GetMapping("/{storeAdminId}/sales/monthly")
    public List<TimeSeriesPointDTO> getMonthlySales(@PathVariable Long storeAdminId) {
        return storeAnalyticsService.getMonthlySalesGraph(storeAdminId);
    }

    // 🗓️ Daily Sales Chart (line)
    @GetMapping("/{storeAdminId}/sales/daily")
    public List<TimeSeriesPointDTO> getDailySales(@PathVariable Long storeAdminId) {
        return storeAnalyticsService.getDailySalesGraph(storeAdminId);
    }

    // 📚 Sales by Product Category (pie/bar)
    @GetMapping("/{storeAdminId}/sales/category")
    public List<CategorySalesDTO> getSalesByCategory(@PathVariable Long storeAdminId) {
        return storeAnalyticsService.getSalesByCategory(storeAdminId);
    }

    // 💳 Sales by Payment Method (pie)
    @GetMapping("/{storeAdminId}/sales/payment-method")
    public List<PaymentInsightDTO> getSalesByPaymentMethod(@PathVariable Long storeAdminId) {
        return storeAnalyticsService.getSalesByPaymentMethod(storeAdminId);
    }

    // 📍 Sales by Branch (bar)
    @GetMapping("/{storeAdminId}/sales/branch")
    public List<BranchSalesDTO> getSalesByBranch(@PathVariable Long storeAdminId) {
        return storeAnalyticsService.getSalesByBranch(storeAdminId);
    }

    // 💵 Payment Breakdown (Cash, UPI, Card)
    @GetMapping("/{storeAdminId}/payments")
    public List<PaymentInsightDTO> getPaymentBreakdown(@PathVariable Long storeAdminId) {
        return storeAnalyticsService.getPaymentBreakdown(storeAdminId);
    }

    // 🏘️ Branch Performance
    @GetMapping("/{storeAdminId}/branch-performance")
    public BranchPerformanceDTO getBranchPerformance(@PathVariable Long storeAdminId) {
        return storeAnalyticsService.getBranchPerformance(storeAdminId);
    }

    // 🆕 Recent Sales (for dashboard card)
    @GetMapping("/{storeAdminId}/sales/recent")
    public List<RecentSaleDTO> getRecentSales(@PathVariable Long storeAdminId,
                                               @RequestParam(defaultValue = "5") int limit) {
        return storeAnalyticsService.getRecentSales(storeAdminId, limit);
    }

    // ⚠️ Alerts and Health Monitoring
    @GetMapping("/{storeAdminId}/alerts")
    public StoreAlertDTO getStoreAlerts(@PathVariable Long storeAdminId) {
        return storeAnalyticsService.getStoreAlerts(storeAdminId);
    }
}
