package com.aniket.service;

import com.aniket.domain.PaymentType;
import com.aniket.domain.UserRole;
import com.aniket.modal.*;
import com.aniket.payload.dto.OrderDTO;
import com.aniket.payload.dto.OrderItemDTO;
import com.aniket.repository.*;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

@SpringBootTest
public class OrderServiceImplConcurrencyTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private BranchInventoryRepository branchInventoryRepository;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private UserRepository userRepository;

    private Long testStoreId;
    private Long testProductId;
    private Long testCashierId;

    @BeforeEach
    public void setupData() {
        // Create test store admin
        User admin = new User();
        admin.setEmail("testadmin_" + System.currentTimeMillis() + "@test.com");
        admin.setPassword("password");
        admin.setFullName("Test Store Admin");
        admin.setRole(UserRole.ROLE_STORE_ADMIN);
        admin.setVerified(true);
        admin = userRepository.save(admin);

        // Create test store
        Store store = storeRepository.save(Store.builder()
                .brand("Test Brand")
                .storeAdmin(admin)
                .acceptedPaymentMethods("CASH,CARD,UPI")
                .build());
        testStoreId = store.getId();

        // Create test branch
        Branch branch = branchRepository.save(Branch.builder()
                .name("Test Branch")
                .store(store)
                .address("123 Test St")
                .isActive(true)
                .build());

        // Create test cashier assigned to branch
        User cashier = new User();
        cashier.setEmail("testcashier_" + System.currentTimeMillis() + "@test.com");
        cashier.setPassword("password");
        cashier.setFullName("Test Cashier");
        cashier.setRole(UserRole.ROLE_BRANCH_CASHIER);
        cashier.setBranch(branch);
        cashier.setVerified(true);
        cashier = userRepository.save(cashier);
        testCashierId = cashier.getId();

        // Create test product
        Product product = productRepository.save(Product.builder()
                .name("Concurrency Test Product")
                .mrp(100.0)
                .sku("SKU-CONCURRENCY-" + System.currentTimeMillis())
                .build());
        testProductId = product.getId();

        // Initialize branch inventory stock = 1
        branchInventoryRepository.save(BranchInventory.builder()
                .store(store)
                .product(product)
                .stock(1)
                .sellingPrice(100.0)
                .isActive(true)
                .build());

        // Set security context to cashier
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(cashier.getEmail(), null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_BRANCH_CASHIER")))
        );
    }

    @Test
    public void testConcurrentOrdersPreventsNegativeStock() throws InterruptedException {
        int numberOfThreads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(numberOfThreads);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        for (int i = 0; i < numberOfThreads; i++) {
            executor.submit(() -> {
                try {
                    // Set security context for worker thread
                    User cashier = userRepository.findById(testCashierId).orElseThrow();
                    SecurityContextHolder.getContext().setAuthentication(
                            new UsernamePasswordAuthenticationToken(cashier.getEmail(), null,
                                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_BRANCH_CASHIER")))
                    );

                    // Wait for start signal so both threads execute at exact same instant
                    startLatch.await();

                    OrderDTO dto = OrderDTO.builder()
                            .paymentType(PaymentType.CASH)
                            .items(List.of(OrderItemDTO.builder()
                                    .productId(testProductId)
                                    .quantity(1)
                                    .price(100.0)
                                    .build()))
                            .build();

                    orderService.createOrder(dto);
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    failureCount.incrementAndGet();
                    System.out.println("❌ Concurrent order rejected as expected: " + e.getMessage());
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        // Release start latch to fire both requests simultaneously
        startLatch.countDown();
        doneLatch.await(10, TimeUnit.SECONDS);
        executor.shutdown();

        // Check inventory stock in database after concurrent execution
        BranchInventory finalInventory = branchInventoryRepository
                .findByStoreIdAndProductId(testStoreId, testProductId).orElseThrow();

        System.out.println("==================================================");
        System.out.println("=== ACTUAL CONCURRENCY TEST EXECUTION RESULTS ===");
        System.out.println("Successful orders count: " + successCount.get());
        System.out.println("Rejected orders count  : " + failureCount.get());
        System.out.println("Final DB stock level   : " + finalInventory.getStock());
        System.out.println("==================================================");

        // Assertions: Exactly 1 order succeeds, 1 order fails, stock is 0 (NOT negative!)
        Assertions.assertEquals(1, successCount.get(), "Exactly 1 concurrent order should succeed");
        Assertions.assertEquals(1, failureCount.get(), "Exactly 1 concurrent order should be rejected");
        Assertions.assertEquals(0, finalInventory.getStock(), "Stock in DB must be exactly 0, never negative");
    }
}
