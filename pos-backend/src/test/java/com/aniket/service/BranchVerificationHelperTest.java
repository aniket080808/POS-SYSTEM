package com.aniket.service;

import com.aniket.domain.OrderStatus;
import com.aniket.domain.PaymentType;
import com.aniket.domain.UserRole;
import com.aniket.modal.*;
import com.aniket.payload.dto.BranchDashboardOverviewDTO;
import com.aniket.payload.dto.DailySalesDTO;
import com.aniket.payload.dto.ProductPerformanceDTO;
import com.aniket.payload.dto.CashierPerformanceDTO;
import com.aniket.repository.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class BranchVerificationHelperTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private BranchAnalyticsService branchAnalyticsService;

    @Test
    @DisplayName("Inspect and verify branch accounts and generate realistic test orders")
    void seedRealisticTestOrdersForVerification() {
        User branchAdmin = userRepository.findByEmail("marigaming9@gmail.com");
        assertNotNull(branchAdmin, "Branch Admin user marigaming9@gmail.com should exist");
        assertEquals(UserRole.ROLE_BRANCH_ADMIN, branchAdmin.getRole(), "marigaming9@gmail.com should have ROLE_BRANCH_ADMIN");

        User branchManager = userRepository.findByEmail("pravinmeshram0205@gmail.com");
        assertNotNull(branchManager, "Branch Manager user pravinmeshram0205@gmail.com should exist");
        assertEquals(UserRole.ROLE_BRANCH_MANAGER, branchManager.getRole(), "pravinmeshram0205@gmail.com should have ROLE_BRANCH_MANAGER");

        User branchCashier = userRepository.findByEmail("rakeshkamble1345@gmail.com");
        assertNotNull(branchCashier, "Branch Cashier user rakeshkamble1345@gmail.com should exist");
        assertEquals(UserRole.ROLE_BRANCH_CASHIER, branchCashier.getRole(), "rakeshkamble1345@gmail.com should have ROLE_BRANCH_CASHIER");

        Branch branch = branchAdmin.getBranch();
        assertNotNull(branch, "Branch Admin must be assigned to a branch");
        System.out.println("✅ Found Branch: ID=" + branch.getId() + ", Name=" + branch.getName());

        // Find or create customer
        Customer customer = customerRepository.findAll().stream().findFirst().orElseGet(() -> {
            Customer c = new Customer();
            c.setFullName("Rahul Deshmukh");
            c.setEmail("rahul.deshmukh@gmail.com");
            c.setPhone("9876543210");
            return customerRepository.save(c);
        });

        // Find products
        List<Product> products = productRepository.findAll();
        System.out.println("✅ Available Products count: " + products.size());

        if (products.isEmpty()) {
            System.out.println("⚠️ No products found in DB");
            return;
        }

        // Ensure inventory exists for these products at this branch
        for (int i = 0; i < Math.min(products.size(), 5); i++) {
            Product p = products.get(i);
            Inventory inv = inventoryRepository.findByProductId(p.getId());
            if (inv == null) {
                inv = Inventory.builder()
                        .branch(branch)
                        .product(p)
                        .quantity(i == 0 ? 3 : 50) // Product 0 has 3 (low stock <= 5)
                        .lastUpdated(LocalDateTime.now())
                        .build();
                inventoryRepository.save(inv);
            } else if (i == 0) {
                inv.setQuantity(3); // Set 1 low stock item to verify low stock widget
                inventoryRepository.save(inv);
            }
        }

        // Check if test orders already exist for this branch
        List<Order> existingOrders = orderRepository.findByBranchId(branch.getId());
        if (existingOrders.isEmpty()) {
            System.out.println("Creating 7 realistic test orders across today and past 3 days...");

            // Order 1: Today, Cashier: Branch Cashier, Payment: UPI
            createTestOrder(branch, branchCashier, customer, products.get(0), 2, PaymentType.UPI, LocalDateTime.now().minusHours(2));

            // Order 2: Today, Cashier: Branch Cashier, Payment: CASH
            if (products.size() > 1) {
                createTestOrder(branch, branchCashier, customer, products.get(1), 3, PaymentType.CASH, LocalDateTime.now().minusHours(1));
            }

            // Order 3: Today, Cashier: Branch Cashier, Payment: CARD
            if (products.size() > 2) {
                createTestOrder(branch, branchCashier, customer, products.get(2), 1, PaymentType.CARD, LocalDateTime.now().minusMinutes(30));
            }

            // Order 4: Yesterday, Cashier: Branch Cashier, Payment: UPI
            createTestOrder(branch, branchCashier, customer, products.get(0), 1, PaymentType.UPI, LocalDateTime.now().minusDays(1).minusHours(3));

            // Order 5: Yesterday, Cashier: Branch Cashier, Payment: CASH
            if (products.size() > 1) {
                createTestOrder(branch, branchCashier, customer, products.get(1), 2, PaymentType.CASH, LocalDateTime.now().minusDays(1).minusHours(1));
            }

            // Order 6: 2 days ago, Cashier: Branch Cashier, Payment: CARD
            if (products.size() > 2) {
                createTestOrder(branch, branchCashier, customer, products.get(2), 4, PaymentType.CARD, LocalDateTime.now().minusDays(2).minusHours(4));
            }

            // Order 7: 3 days ago, Cashier: Branch Cashier, Payment: UPI
            createTestOrder(branch, branchCashier, customer, products.get(0), 2, PaymentType.UPI, LocalDateTime.now().minusDays(3).minusHours(5));

            System.out.println("✅ Successfully created 7 realistic test orders!");
        } else {
            System.out.println("Orders already exist: " + existingOrders.size());
        }

        // Verify Branch Overview metrics
        BranchDashboardOverviewDTO overview = branchAnalyticsService.getBranchOverview(branch.getId());
        System.out.println("📊 Today's Sales: ₹" + overview.getTotalSales() + ", Growth: " + overview.getSalesGrowth() + "%");
        System.out.println("📊 Orders Today: " + overview.getOrdersToday() + ", Growth: " + overview.getOrderGrowth() + "%");
        System.out.println("📊 Active Cashiers: " + overview.getActiveCashiers());
        System.out.println("📊 Low Stock Items: " + overview.getLowStockItems() + ", Growth: " + overview.getLowStockGrowth() + "%");

        assertNotNull(overview.getTotalSales());
        assertTrue(overview.getTotalSales().doubleValue() > 0, "Today's sales should be > 0");
        assertTrue(overview.getOrdersToday() > 0, "Orders today should be > 0");
        assertEquals(0.0, overview.getLowStockGrowth(), "Low stock growth should be clean 0.0% (not -100%)");

        // Verify daily sales chart
        List<DailySalesDTO> chart = branchAnalyticsService.getDailySalesChart(branch.getId(), 7);
        System.out.println("📈 Daily Sales Chart entries: " + chart.size());
        assertTrue(chart.stream().anyMatch(d -> d.getTotalSales().doubleValue() > 0), "Daily sales chart should have non-zero sales points");

        // Verify product performance
        List<ProductPerformanceDTO> topProducts = branchAnalyticsService.getTopProductsByQuantityWithPercentage(branch.getId());
        System.out.println("📦 Top Products count: " + topProducts.size());
        assertFalse(topProducts.isEmpty(), "Top products should not be empty");

        // Verify cashier performance
        List<CashierPerformanceDTO> topCashiers = branchAnalyticsService.getTopCashierPerformanceByOrders(branch.getId());
        System.out.println("👤 Top Cashiers count: " + topCashiers.size());
        assertFalse(topCashiers.isEmpty(), "Top cashiers should not be empty");
    }

    private void createTestOrder(Branch branch, User cashier, Customer customer, Product product, int quantity, PaymentType paymentType, LocalDateTime createdAt) {
        double itemPrice = product.getMrp() != null ? product.getMrp() : 100.0;
        double totalAmount = itemPrice * quantity;

        Order order = new Order();
        order.setBranch(branch);
        order.setCashier(cashier);
        order.setCustomer(customer);
        order.setPaymentType(paymentType);
        order.setStatus(OrderStatus.COMPLETED);
        order.setTotalAmount(totalAmount);
        order.setCreatedAt(createdAt);

        Order savedOrder = orderRepository.save(order);

        OrderItem item = new OrderItem();
        item.setOrder(savedOrder);
        item.setProduct(product);
        item.setQuantity(quantity);
        item.setPrice(itemPrice);
        orderItemRepository.save(item);
    }
}
