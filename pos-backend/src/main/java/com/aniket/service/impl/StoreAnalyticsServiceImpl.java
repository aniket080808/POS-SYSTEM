package com.aniket.service.impl;

import com.aniket.domain.UserRole;
import com.aniket.modal.Order;
import com.aniket.payload.StoreAnalysis.*;
import com.aniket.repository.*;
import com.aniket.service.StoreAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StoreAnalyticsServiceImpl implements StoreAnalyticsService {

    private final BranchRepository branchRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final BranchInventoryRepository branchInventoryRepository;
    private final RefundRepository refundRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;

    @org.springframework.beans.factory.annotation.Value("${app.alerts.inactive-cashier-days:7}")
    private int inactiveCashierDays;

    @org.springframework.beans.factory.annotation.Value("${app.alerts.low-stock-threshold:10}")
    private int lowStockThreshold;

    @org.springframework.beans.factory.annotation.Value("${app.alerts.refund-high-value-threshold:5000}")
    private double refundHighValueThreshold;

    @org.springframework.beans.factory.annotation.Value("${app.alerts.refund-frequency-threshold:3}")
    private int refundFrequencyThreshold;

    @org.springframework.beans.factory.annotation.Value("${app.alerts.refund-spike-percentage:200}")
    private double refundSpikePercentage;

    @org.springframework.beans.factory.annotation.Value("${app.alerts.refund-baseline-days:7}")
    private int refundBaselineDays;

    @org.springframework.beans.factory.annotation.Value("${app.alerts.refund-min-baseline-days:2}")
    private int refundMinBaselineDays;

    @Override
    public StoreOverviewDTO getStoreOverview(Long storeAdminId) {
        // Use Asia/Kolkata timezone for all date boundaries (same as Alerts page)
        java.time.ZoneId zoneId = java.time.ZoneId.of("Asia/Kolkata");
        LocalDateTime nowInIst = LocalDateTime.now(zoneId);
        LocalDateTime startOfToday = nowInIst.toLocalDate().atStartOfDay();
        LocalDateTime startOfYesterday = startOfToday.minusDays(1);
        LocalDateTime endOfYesterday = startOfToday;

        // This week: Monday to today (or Sunday to today depending on week definition)
        // Using last 7 days as "this week" for the Sales Management page
        LocalDateTime startOfThisWeek = startOfToday.minusDays(6); // last 7 days including today
        LocalDateTime startOfLastWeek = startOfToday.minusDays(13); // the 7 days before this week
        LocalDateTime endOfLastWeek = startOfToday.minusDays(7);

        // Dashboard fields (all-time totals, no status filter - keep existing behavior)
        List<UserRole> roles = new ArrayList<>();
        roles.add(UserRole.ROLE_STORE_MANAGER);
        roles.add(UserRole.ROLE_CUSTOMER);
        roles.add(UserRole.ROLE_BRANCH_CASHIER);
        roles.add(UserRole.ROLE_BRANCH_MANAGER);

        // Sales Management fields (COMPLETED orders only)
        int todayOrders = orderRepository.countCompletedOrdersByStoreAdminAndDateRange(storeAdminId, startOfToday, nowInIst);
        int yesterdayOrders = orderRepository.countCompletedOrdersByStoreAdminAndDateRange(storeAdminId, startOfYesterday, endOfYesterday);

        double thisWeekSales = orderRepository.sumCompletedSalesByStoreAdminAndDateRange(storeAdminId, startOfThisWeek, nowInIst);
        double lastWeekSales = orderRepository.sumCompletedSalesByStoreAdminAndDateRange(storeAdminId, startOfLastWeek, endOfLastWeek);

        double averageOrderValue = 0.0;
        int thisWeekOrderCount = orderRepository.countCompletedOrdersByStoreAdminAndDateRange(storeAdminId, startOfThisWeek, nowInIst);
        if (thisWeekOrderCount > 0) {
            averageOrderValue = thisWeekSales / thisWeekOrderCount;
        }

        // Previous period AOV for comparison
        double previousPeriodAverageOrderValue = 0.0;
        int lastWeekOrderCount = orderRepository.countCompletedOrdersByStoreAdminAndDateRange(storeAdminId, startOfLastWeek, endOfLastWeek);
        if (lastWeekOrderCount > 0) {
            previousPeriodAverageOrderValue = lastWeekSales / lastWeekOrderCount;
        }

        // Active cashiers: logged in today (Asia/Kolkata boundaries)
        int activeCashiers = userRepository.countActiveCashiersByStoreAdmin(storeAdminId, startOfToday);

        return StoreOverviewDTO.builder()
                // Dashboard fields
                .totalBranches(branchRepository.countByStoreAdminId(storeAdminId))
                .totalSales(orderRepository.sumTotalSalesByStoreAdmin(storeAdminId).orElse(Double.valueOf(0)))
                .totalOrders(orderRepository.countByStoreAdminId(storeAdminId))
                .totalEmployees(userRepository.countByStoreAdminIdAndRoles(storeAdminId, roles))
                .totalCustomers(customerRepository.countByStoreAdminId(storeAdminId))
                .totalRefunds(refundRepository.countByStoreAdminId(storeAdminId))
                .totalProducts((int) branchInventoryRepository.countByStoreAdminId(storeAdminId))
//                .topBranchName(branchRepository.findTopBranchBySales(storeAdminId))
                // Sales Management fields
                .todayOrders(todayOrders)
                .yesterdayOrders(yesterdayOrders)
                .activeCashiers(activeCashiers)
                .averageOrderValue(averageOrderValue)
                .previousPeriodSales(lastWeekSales)
                .previousPeriodAverageOrderValue(previousPeriodAverageOrderValue)
                .build();
    }

    @Override
    public TimeSeriesDataDTO getSalesTrends(Long storeAdminId, String period) {
    //        // Dummy data, replace with actual queries later
    ////        List<TimeSeriesPointDTO> points = List.of(
    ////                new TimeSeriesPointDTO("Week 1", BigDecimal.valueOf(4000)),
    ////                new TimeSeriesPointDTO("Week 2", BigDecimal.valueOf(6200))
    ////        );
        return null;
    }

    @Override
    public List<TimeSeriesPointDTO> getMonthlySalesGraph(Long storeAdminId) {
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = end.minusDays(365);

        List<Order> orders = orderRepository.findAllByStoreAdminAndCreatedAtBetween(storeAdminId, start, end);

        Map<YearMonth, Double> grouped = orders.stream()
                .collect(Collectors.groupingBy(
                        order -> YearMonth.from(order.getCreatedAt()),  // Group by Year-Month
                        Collectors.summingDouble(order ->
                                order.getTotalAmount() != null ? order.getTotalAmount().doubleValue() : 0.0
                        )
                ));

        return grouped.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> new TimeSeriesPointDTO(
                        entry.getKey().atDay(1), // Convert YearMonth to LocalDate
                        entry.getValue()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public List<TimeSeriesPointDTO> getDailySalesGraph(Long storeAdminId) {
        // Use Asia/Kolkata timezone for consistency with Alerts page
        java.time.ZoneId zoneId = java.time.ZoneId.of("Asia/Kolkata");
        LocalDateTime end = LocalDateTime.now(zoneId);
        LocalDateTime start = end.minusDays(6);
        
        List<Object[]> rawResults = orderRepository.getDailySales(storeAdminId, start, end);
        return rawResults.stream()
                .map(row -> {
                    java.time.LocalDate date = row[0] instanceof java.sql.Date 
                            ? ((java.sql.Date) row[0]).toLocalDate() 
                            : (java.time.LocalDate) row[0];
                    Double totalAmount = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
                    return new TimeSeriesPointDTO(date, totalAmount);
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<CategorySalesDTO> getSalesByCategory(Long storeAdminId) {
        return productRepository.getSalesGroupedByCategory(storeAdminId);
    }

    @Override
    public List<PaymentInsightDTO> getSalesByPaymentMethod(Long storeAdminId) {
        return orderRepository.getSalesByPaymentMethod(storeAdminId);
    }

    @Override
    public List<BranchSalesDTO> getSalesByBranch(Long storeAdminId) {
        return orderRepository.getSalesByBranch(storeAdminId);
    }

    @Override
    public List<PaymentInsightDTO> getPaymentBreakdown(Long storeAdminId) {
        return orderRepository.getSalesByPaymentMethod(storeAdminId);
    }

    @Override
    public BranchPerformanceDTO getBranchPerformance(Long storeAdminId) {
        return BranchPerformanceDTO.builder()
                .branchSales(orderRepository.getSalesByBranch(storeAdminId))
                .newBranchesThisMonth(branchRepository.countNewBranchesThisMonth(storeAdminId))
//                .topBranch(branchRepository.findTopBranchBySales(storeAdminId))
                .build();
    }

    @Override
    public List<RecentSaleDTO> getRecentSales(Long storeAdminId, int limit) {
        return orderRepository.findRecentSalesByStoreAdmin(storeAdminId, PageRequest.of(0, limit));
    }

    @Override
    public StoreAlertDTO getStoreAlerts(Long storeAdminId) {
        // 1. Inactive Cashiers (configurable threshold, default 7 days)
        java.time.ZoneId zoneId = java.time.ZoneId.of("Asia/Kolkata");
        LocalDateTime cutoffDate = LocalDateTime.now(zoneId).minusDays(inactiveCashierDays);
        List<com.aniket.payload.dto.UserDTO> inactiveCashiers =
                userRepository.findInactiveCashiers(storeAdminId, cutoffDate);

        // 2. Low Stock Alerts (configurable threshold, default 10 units)
        List<com.aniket.payload.dto.ProductDTO> lowStockAlerts =
                productRepository.findLowStockProducts(storeAdminId, lowStockThreshold);

        // 3. No Sale Today — only flag branches open today with no COMPLETED orders
        LocalDateTime startOfToday = LocalDateTime.now(zoneId).toLocalDate().atStartOfDay();
        String dayOfWeek = LocalDateTime.now(zoneId).getDayOfWeek().name(); // MONDAY, TUESDAY, etc.
        List<com.aniket.payload.dto.BranchDTO> noSalesToday =
                branchRepository.findBranchesWithNoSalesToday(storeAdminId, startOfToday, dayOfWeek);

        // 4. Refund Spike — 3-rule anomaly detection
        List<com.aniket.payload.dto.RefundDTO> refundSpikeAlerts =
                detectRefundSpikes(storeAdminId, startOfToday);

        return StoreAlertDTO.builder()
                .inactiveCashiers(inactiveCashiers)
                .lowStockAlerts(lowStockAlerts)
                .noSalesToday(noSalesToday)
                .refundSpikeAlerts(refundSpikeAlerts)
                .build();
    }

    private List<com.aniket.payload.dto.RefundDTO> detectRefundSpikes(Long storeAdminId, LocalDateTime startOfToday) {
        List<com.aniket.payload.dto.RefundDTO> todayRefunds =
                refundRepository.findTodayRefunds(storeAdminId, startOfToday);
        if (todayRefunds.isEmpty()) {
            return java.util.Collections.emptyList();
        }

        java.util.Map<Long, java.util.List<com.aniket.payload.dto.RefundDTO>> byCashier =
                todayRefunds.stream()
                        .collect(java.util.stream.Collectors.groupingBy(
                                r -> r.getCashierName() != null ?
                                        (long) r.getCashierName().hashCode() : 0L));

        List<com.aniket.payload.dto.RefundDTO> flagged = new java.util.ArrayList<>();

        // Rule 1: High-value refund
        for (com.aniket.payload.dto.RefundDTO refund : todayRefunds) {
            if (refund.getAmount() != null && refund.getAmount() > refundHighValueThreshold) {
                refund.setSpikeReason("High value: " + refund.getAmount());
                flagged.add(refund);
            }
        }

        // Rule 2: Frequency spike — cashier with >= N refunds today
        java.util.Map<String, Long> cashierCounts = new java.util.HashMap<>();
        for (com.aniket.payload.dto.RefundDTO refund : todayRefunds) {
            String name = refund.getCashierName();
            if (name == null) continue;
            cashierCounts.merge(name, 1L, Long::sum);
        }
        java.util.Set<String> frequentCashiers = new java.util.HashSet<>();
        for (java.util.Map.Entry<String, Long> entry : cashierCounts.entrySet()) {
            if (entry.getValue() >= refundFrequencyThreshold) {
                frequentCashiers.add(entry.getKey());
            }
        }
        for (com.aniket.payload.dto.RefundDTO refund : todayRefunds) {
            String name = refund.getCashierName();
            if (name != null && frequentCashiers.contains(name)) {
                long count = cashierCounts.get(name);
                refund.setSpikeReason(count + " refunds today by cashier");
                if (!flagged.contains(refund)) {
                    flagged.add(refund);
                }
            }
        }

        // Rule 3: Daily total spike (> X% of 7-day rolling average baseline)
        if (todayRefunds.size() >= 1) {
            LocalDateTime baselineStart = startOfToday.minusDays(refundBaselineDays);
            LocalDateTime baselineEnd = startOfToday;
            List<com.aniket.payload.dto.RefundDTO> baselineRefunds =
                    refundRepository.findRefundsBetween(storeAdminId, baselineStart, baselineEnd);

            java.util.Map<Integer, Double> dailyTotals = new java.util.HashMap<>();
            java.time.ZoneId zoneId = java.time.ZoneId.of("Asia/Kolkata");
            for (com.aniket.payload.dto.RefundDTO r : baselineRefunds) {
                if (r.getCreatedAt() == null) continue;
                int dayOfYear = r.getCreatedAt().atZone(zoneId).getDayOfYear();
                dailyTotals.merge(dayOfYear, r.getAmount() != null ? r.getAmount() : 0.0, Double::sum);
            }

            int uniqueDays = dailyTotals.size();
            if (uniqueDays >= refundMinBaselineDays) {
                double avg = dailyTotals.values().stream().mapToDouble(d -> d).average().orElse(0.0);
                double todayTotal = todayRefunds.stream()
                        .mapToDouble(r -> r.getAmount() != null ? r.getAmount() : 0.0)
                        .sum();
                double threshold = avg * (refundSpikePercentage / 100.0);
                if (avg > 0 && todayTotal > threshold) {
                    for (com.aniket.payload.dto.RefundDTO refund : todayRefunds) {
                        String reason = "Daily total " + String.format("%.0f", todayTotal) +
                                " exceeds " + refundSpikePercentage + "% of " + String.format("%.0f", avg) + " avg";
                        // Only set if not already flagged by rule 1 or 2
                        if (refund.getSpikeReason() == null) {
                            refund.setSpikeReason(reason);
                        }
                        if (!flagged.contains(refund)) {
                            flagged.add(refund);
                        }
                    }
                }
            }
        }

        return flagged;
    }
}
