package com.aniket.service;

import com.aniket.domain.UserRole;
import com.aniket.modal.Order;
import com.aniket.modal.ShiftReport;
import com.aniket.modal.User;
import com.aniket.payload.dto.BranchDashboardOverviewDTO;
import com.aniket.payload.dto.CashierPerformanceDTO;
import com.aniket.repository.OrderRepository;
import com.aniket.repository.ShiftReportRepository;
import com.aniket.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class ReassignCashierOrdersTest {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ShiftReportRepository shiftReportRepository;

    @Autowired
    private BranchAnalyticsService branchAnalyticsService;

    @Test
    @DisplayName("Reassign orders #1-7 to Cashier Rakesh Kamble and audit timestamp consistency")
    void reassignOrdersAndAudit() {
        User cashier = userRepository.findByEmail("rakeshkamble1345@gmail.com");
        assertNotNull(cashier, "Cashier Rakesh Kamble must exist");
        assertEquals(UserRole.ROLE_BRANCH_CASHIER, cashier.getRole());

        // 1. Reassign orders 1..7 to cashier if not already assigned
        for (long orderId = 1; orderId <= 7; orderId++) {
            orderRepository.findById(orderId).ifPresent(order -> {
                if (order.getCashier() == null || !order.getCashier().getId().equals(cashier.getId())) {
                    System.out.println("Reassigning Order #" + order.getId() + " from Cashier " + 
                            (order.getCashier() != null ? order.getCashier().getFullName() : "null") + 
                            " to " + cashier.getFullName());
                    order.setCashier(cashier);
                    orderRepository.save(order);
                }
            });
        }

        // 2. Audit all orders for Branch 1
        Long branchId = cashier.getBranch().getId();
        List<Order> orders = orderRepository.findByBranchId(branchId);
        System.out.println("\n=== AUDIT: ALL ORDERS FOR BRANCH ID=" + branchId + " ===");
        
        List<ShiftReport> shifts = shiftReportRepository.findByCashier(cashier);
        System.out.println("Found " + shifts.size() + " shift reports for Rakesh Kamble:");
        for (ShiftReport s : shifts) {
            System.out.println("  Shift #" + s.getId() + ": Start=" + s.getShiftStart() + ", End=" + s.getShiftEnd());
        }

        for (Order o : orders) {
            System.out.println(String.format("  Order #%d | CreatedAt: %s | Amount: ₹%.2f | Cashier: %s (%s, %s)",
                    o.getId(), o.getCreatedAt(), o.getTotalAmount(),
                    o.getCashier() != null ? o.getCashier().getFullName() : "N/A",
                    o.getCashier() != null ? o.getCashier().getEmail() : "N/A",
                    o.getCashier() != null ? o.getCashier().getRole() : "N/A"));
        }

        // 3. Verify Branch Overview
        BranchDashboardOverviewDTO overview = branchAnalyticsService.getBranchOverview(branchId);
        System.out.println("\n=== VERIFY BRANCH OVERVIEW ===");
        System.out.println("Active Cashiers: " + overview.getActiveCashiers());
        System.out.println("Today's Sales: ₹" + overview.getTotalSales());
        System.out.println("Today's Orders: " + overview.getOrdersToday());

        // If shift is closed (shiftEnd is not null), activeCashiers should be 0
        int openShifts = shiftReportRepository.countByBranchIdAndShiftEndIsNull(branchId);
        assertEquals(openShifts, overview.getActiveCashiers(), "Active cashiers must equal count of open shifts strictly for ROLE_BRANCH_CASHIER");

        // 4. Verify Top Cashiers
        List<CashierPerformanceDTO> topCashiers = branchAnalyticsService.getTopCashierPerformanceByOrders(branchId);
        System.out.println("\n=== VERIFY TOP CASHIERS ===");
        for (CashierPerformanceDTO cp : topCashiers) {
            System.out.println("  Cashier ID: " + cp.getCashierId() + ", Name: " + cp.getCashierName() + ", Revenue: ₹" + cp.getTotalRevenue());
        }

        // All top cashiers must be ROLE_BRANCH_CASHIER
        for (CashierPerformanceDTO cp : topCashiers) {
            User u = userRepository.findById(cp.getCashierId()).orElse(null);
            assertNotNull(u);
            assertEquals(UserRole.ROLE_BRANCH_CASHIER, u.getRole(), "Top Cashier entry must have role ROLE_BRANCH_CASHIER");
        }

        assertFalse(topCashiers.isEmpty(), "Top cashiers should contain Rakesh Kamble");
        assertEquals(1, topCashiers.size(), "Only 1 cashier (Rakesh Kamble) should appear in top cashiers");
        assertEquals("Rakesh Kamble", topCashiers.get(0).getCashierName());
    }
}
