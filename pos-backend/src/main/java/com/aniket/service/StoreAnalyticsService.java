package com.aniket.service;

import com.aniket.payload.StoreAnalysis.*;
import com.aniket.payload.dto.StoreUsageDTO;

import java.util.List;


    public interface StoreAnalyticsService {

        // ✨ 1. Store-Level Summary: Overview of the entire store
        // 🏢 Total branches, sales, orders, employees, customers, refunds, products, and top branch
        StoreOverviewDTO getStoreOverview(Long storeAdminId);

        // 📊 2. Time-Based Analytics: Trends over time
        // 📆 Get revenue trends (Daily, Weekly, Monthly) for line charts
        TimeSeriesDataDTO getSalesTrends(Long storeAdminId, String period);

        // 📅 Monthly sales trend for the store (line chart)
        List<TimeSeriesPointDTO> getMonthlySalesGraph(Long storeAdminId);

        // 🗓️ Daily sales trend for the store (line chart)
        List<TimeSeriesPointDTO> getDailySalesGraph(Long storeAdminId);

        // 📚 Sales grouped by product category (bar/pie chart)
        List<CategorySalesDTO> getSalesByCategory(Long storeAdminId);

        // 💳 Sales grouped by payment method (pie chart)
        List<PaymentInsightDTO> getSalesByPaymentMethod(Long storeAdminId);

        // 📍 Sales per branch (bar chart)
        List<BranchSalesDTO> getSalesByBranch(Long storeAdminId);

        // 💵 3. Payment Insights: Breakdown of transactions
        // 💵 Total amounts grouped by payment methods (Cash, UPI, Card)
        List<PaymentInsightDTO> getPaymentBreakdown(Long storeAdminId);


        // 🏘️ 6. Branch Performance: Location-wise data
        // 📊 Compare branches on revenue, order volume, growth, and recent additions
        BranchPerformanceDTO getBranchPerformance(Long storeAdminId);

        // 🆕 Recent Sales (for dashboard card)
        List<RecentSaleDTO> getRecentSales(Long storeAdminId, int limit);

        // ⚠️ 7. Alerts & Health Monitoring: Important notifications
        // ⚠️ Alerts for low stock, no sales, refund spikes, and inactive employees
        StoreAlertDTO getStoreAlerts(Long storeAdminId);

        com.aniket.payload.dto.AlertDismissalDTO dismissAlert(Long storeAdminId, com.aniket.payload.dto.AlertDismissalDTO dto);

        // 🛡️ Super Admin: Get store plan usage for a specific store by storeId
        StoreUsageDTO getStoreUsageForAdmin(Long storeId);
    }


