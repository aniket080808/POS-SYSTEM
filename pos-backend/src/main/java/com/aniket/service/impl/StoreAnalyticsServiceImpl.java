package com.aniket.service.impl;

import com.aniket.domain.UserRole;
import com.aniket.exception.AccessDeniedException;
import com.aniket.exception.FeatureNotEnabledException;
import com.aniket.exception.UserException;
import com.aniket.modal.Order;
import com.aniket.modal.Store;
import com.aniket.modal.StoreSubscription;
import com.aniket.modal.Subscription;
import com.aniket.modal.SubscriptionPlan;
import com.aniket.modal.User;
import com.aniket.payload.StoreAnalysis.*;
import com.aniket.payload.dto.StoreUsageDTO;
import com.aniket.repository.*;
import com.aniket.service.StoreAnalyticsService;
import com.aniket.service.StoreSubscriptionService;
import com.aniket.service.UserService;
import jakarta.persistence.EntityNotFoundException;
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
    private final StoreRepository storeRepository;
    private final StoreSubscriptionRepository storeSubscriptionRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final StoreSubscriptionService storeSubscriptionService;
    private final UserService userService;

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
        roles.add(UserRole.ROLE_STORE_ADMIN);
        roles.add(UserRole.ROLE_STORE_MANAGER);
        roles.add(UserRole.ROLE_BRANCH_ADMIN);
        roles.add(UserRole.ROLE_BRANCH_MANAGER);
        roles.add(UserRole.ROLE_BRANCH_CASHIER);

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
        int yesterdayActiveCashiers = userRepository.countActiveCashiersBetweenByStoreAdmin(storeAdminId, startOfYesterday, endOfYesterday);

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
                .yesterdayActiveCashiers(yesterdayActiveCashiers)
                .averageOrderValue(averageOrderValue)
                .previousPeriodSales(lastWeekSales)
                .previousPeriodAverageOrderValue(previousPeriodAverageOrderValue)
                .build();
    }

    @Override
    public TimeSeriesDataDTO getSalesTrends(Long storeAdminId, String period) {
        java.time.ZoneId zoneId = java.time.ZoneId.of("Asia/Kolkata");
        LocalDateTime nowInIst = LocalDateTime.now(zoneId);
        int days = "weekly".equalsIgnoreCase(period) ? 7 : 30;
        LocalDateTime start = nowInIst.minusDays(days - 1).toLocalDate().atStartOfDay();
        LocalDateTime end = nowInIst;

        List<Object[]> rawResults = orderRepository.getDailySales(storeAdminId, start, end);
        java.util.Map<java.time.LocalDate, Double> salesMap = new java.util.HashMap<>();
        for (Object[] row : rawResults) {
            java.time.LocalDate date = row[0] instanceof java.sql.Date
                    ? ((java.sql.Date) row[0]).toLocalDate()
                    : (java.time.LocalDate) row[0];
            Double totalAmount = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
            salesMap.put(date, totalAmount);
        }

        List<TimeSeriesPointDTO> points = new java.util.ArrayList<>();
        java.time.LocalDate startDate = start.toLocalDate();
        java.time.LocalDate endDate = nowInIst.toLocalDate();
        for (java.time.LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            points.add(new TimeSeriesPointDTO(date, salesMap.getOrDefault(date, 0.0)));
        }
        return TimeSeriesDataDTO.builder()
                .points(points)
                .period(period.toUpperCase())
                .build();
    }

    private void checkAdvancedReportsEnabled() {
        try {
            User user = userService.getCurrentUser();
            Store store = user.getStore() != null
                    ? user.getStore()
                    : storeRepository.findByStoreAdminId(user.getId());
            if (store == null) return;

            StoreSubscription storeSub = storeSubscriptionService.getOrCreateForStore(store);
            if (storeSub.getCurrentPlan() != null &&
                !Boolean.TRUE.equals(storeSub.getCurrentPlan().getEnableAdvancedReports())) {
                throw new FeatureNotEnabledException(
                    "Advanced reports are not available on your current plan. Please upgrade to access detailed analytics.");
            }
        } catch (UserException e) {
            return;
        }
    }

    @Override
    public List<TimeSeriesPointDTO> getMonthlySalesGraph(Long storeAdminId) {
        checkAdvancedReportsEnabled();
        java.time.ZoneId zoneId = java.time.ZoneId.of("Asia/Kolkata");
        YearMonth currentMonth = YearMonth.now(zoneId);
        YearMonth startMonth = currentMonth.minusMonths(11); // 12-month rolling window

        LocalDateTime start = startMonth.atDay(1).atStartOfDay();
        LocalDateTime end = currentMonth.atEndOfMonth().atTime(23, 59, 59);

        List<Order> orders = orderRepository.findAllByStoreAdminAndCreatedAtBetween(storeAdminId, start, end);

        Map<YearMonth, Double> grouped = orders.stream()
                .filter(o -> o.getStatus() == com.aniket.domain.OrderStatus.COMPLETED)
                .collect(Collectors.groupingBy(
                        order -> YearMonth.from(order.getCreatedAt().atZone(zoneId)),
                        Collectors.summingDouble(order ->
                                order.getTotalAmount() != null ? order.getTotalAmount().doubleValue() : 0.0
                        )
                ));

        List<TimeSeriesPointDTO> result = new ArrayList<>();
        for (YearMonth ym = startMonth; !ym.isAfter(currentMonth); ym = ym.plusMonths(1)) {
            result.add(new TimeSeriesPointDTO(
                    ym.atDay(1),
                    grouped.getOrDefault(ym, 0.0)
            ));
        }
        return result;
    }

    @Override
    public List<TimeSeriesPointDTO> getDailySalesGraph(Long storeAdminId) {
        // Use Asia/Kolkata timezone for consistency with Alerts page
        java.time.ZoneId zoneId = java.time.ZoneId.of("Asia/Kolkata");
        LocalDateTime nowInIst = LocalDateTime.now(zoneId);
        LocalDateTime start = nowInIst.minusDays(6).toLocalDate().atStartOfDay();
        LocalDateTime end = nowInIst;
        
        List<Object[]> rawResults = orderRepository.getDailySales(storeAdminId, start, end);
        java.util.Map<java.time.LocalDate, Double> salesMap = new java.util.HashMap<>();
        for (Object[] row : rawResults) {
            java.time.LocalDate date = row[0] instanceof java.sql.Date 
                    ? ((java.sql.Date) row[0]).toLocalDate() 
                    : (java.time.LocalDate) row[0];
            Double totalAmount = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
            salesMap.put(date, totalAmount);
        }

        List<TimeSeriesPointDTO> points = new java.util.ArrayList<>();
        java.time.LocalDate startDate = start.toLocalDate();
        java.time.LocalDate endDate = nowInIst.toLocalDate();
        for (java.time.LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            points.add(new TimeSeriesPointDTO(date, salesMap.getOrDefault(date, 0.0)));
        }
        return points;
    }

    @Override
    public List<CategorySalesDTO> getSalesByCategory(Long storeAdminId) {
        checkAdvancedReportsEnabled();
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

    @Override
    public StoreUsageDTO getStoreUsageForAdmin(Long storeId) {
        // Super Admin guard — only ROLE_ADMIN can call this with an arbitrary storeId
        User currentUser;
        try {
            currentUser = userService.getCurrentUser();
        } catch (UserException e) {
            throw new AccessDeniedException("You are not authorized to view store usage.", e);
        }

        if (currentUser.getRole() != com.aniket.domain.UserRole.ROLE_ADMIN) {
            throw new AccessDeniedException("You are not authorized to view store usage.");
        }

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new EntityNotFoundException("Store not found with ID: " + storeId));

        // Read-only lookup: do NOT use getOrCreateForStore (it writes). Use getByStoreId.
        StoreSubscription storeSub = storeSubscriptionService.getByStoreId(storeId);
        SubscriptionPlan currentPlan = (storeSub != null) ? storeSub.getCurrentPlan() : null;

        // Reuse existing aggregation logic, scoped via the store's storeAdmin
        Long storeAdminId = store.getStoreAdmin().getId();
        List<UserRole> roles = new ArrayList<>();
        roles.add(UserRole.ROLE_STORE_ADMIN);
        roles.add(UserRole.ROLE_STORE_MANAGER);
        roles.add(UserRole.ROLE_BRANCH_ADMIN);
        roles.add(UserRole.ROLE_BRANCH_MANAGER);
        roles.add(UserRole.ROLE_BRANCH_CASHIER);

        Integer totalBranches = branchRepository.countByStoreAdminId(storeAdminId);
        Integer totalProducts = (int) branchInventoryRepository.countByStoreAdminId(storeAdminId);
        Integer totalEmployees = userRepository.countByStoreAdminIdAndRoles(storeAdminId, roles);

        StoreUsageDTO.StoreUsageDTOBuilder builder = StoreUsageDTO.builder()
                .storeId(store.getId())
                .totalBranchesUsed(totalBranches)
                .totalProductsUsed(totalProducts)
                .totalEmployeesUsed(totalEmployees);

        if (currentPlan != null) {
            builder.planId(currentPlan.getId())
                    .planName(currentPlan.getName())
                    .planPrice(currentPlan.getPrice())
                    .billingCycle(currentPlan.getBillingCycle())
                    .maxProducts(currentPlan.getMaxProducts())
                    .maxBranches(currentPlan.getMaxBranches())
                    .maxUsers(currentPlan.getMaxUsers());
        }

        if (storeSub != null) {
            builder.subscriptionStatus(storeSub.getStatus());
        }

        // Find latest ACTIVE/TRIAL subscription for start/end dates
        List<Subscription> subs = subscriptionRepository.findByStore(store);
        Subscription latestActiveSub = subs.stream()
                .filter(s -> s.getStatus() == com.aniket.domain.SubscriptionStatus.ACTIVE
                        || s.getStatus() == com.aniket.domain.SubscriptionStatus.TRIAL)
                .max(java.util.Comparator.comparing(Subscription::getStartDate))
                .orElse(null);

        if (latestActiveSub != null) {
            builder.status(latestActiveSub.getStatus())
                    .startDate(latestActiveSub.getStartDate())
                    .endDate(latestActiveSub.getEndDate());
        }

        return builder.build();
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
