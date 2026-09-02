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
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@SpringBootTest
public class OrderServiceImplTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private BranchInventoryRepository branchInventoryRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    private Long testStoreId;
    private Long testBranchId;
    private Long testProductId;
    private Long testCashierId;
    private Customer testCustomer;

    @BeforeEach
    public void setup() {
        User admin = new User();
        admin.setEmail("admin_order_test_" + System.currentTimeMillis() + "@test.com");
        admin.setPassword("password");
        admin.setFullName("Store Admin");
        admin.setRole(UserRole.ROLE_STORE_ADMIN);
        admin.setVerified(true);
        admin = userRepository.save(admin);

        Store store = storeRepository.save(Store.builder()
                .brand("Test Store")
                .storeAdmin(admin)
                .acceptedPaymentMethods("CASH,CARD,UPI,SPLIT")
                .build());
        testStoreId = store.getId();

        Branch branch = branchRepository.save(Branch.builder()
                .name("Main Branch")
                .store(store)
                .address("Test Address")
                .isActive(true)
                .build());
        testBranchId = branch.getId();

        User cashier = new User();
        cashier.setEmail("cashier_order_test_" + System.currentTimeMillis() + "@test.com");
        cashier.setPassword("password");
        cashier.setFullName("Gayatri Meshram");
        cashier.setRole(UserRole.ROLE_BRANCH_CASHIER);
        cashier.setBranch(branch);
        cashier.setVerified(true);
        cashier = userRepository.save(cashier);
        testCashierId = cashier.getId();

        Customer customer = new Customer();
        customer.setFullName("Gayatri Meshram");
        customer.setEmail("gayatri@test.com");
        customer.setPhone("9876543210");
        customer.setLoyaltyPoints(1096);
        customer.setStoreCredit(0.0);
        customer.setStore(store);
        customer.setCreatedAt(LocalDateTime.now());
        customer.setUpdatedAt(LocalDateTime.now());
        testCustomer = customerRepository.save(customer);

        Product product = productRepository.save(Product.builder()
                .name("Test Product")
                .mrp(500.0)
                .sku("SKU-ORDER-" + System.currentTimeMillis())
                .build());
        testProductId = product.getId();

        branchInventoryRepository.save(BranchInventory.builder()
                .store(store)
                .product(product)
                .stock(50)
                .sellingPrice(450.0)
                .isActive(true)
                .build());

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(cashier.getEmail(), null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_BRANCH_CASHIER")))
        );
    }

    @Test
    public void testCreateOrderWithSplitPaymentAndCustomer() throws Exception {
        OrderDTO dto = OrderDTO.builder()
                .branchId(testBranchId)
                .cashierId(testCashierId)
                .cashierName("Gayatri Meshram")
                .customer(testCustomer)
                .items(List.of(OrderItemDTO.builder()
                        .productId(testProductId)
                        .quantity(2)
                        .price(450.0)
                        .build()))
                .paymentType(PaymentType.SPLIT)
                .cashAmount(850.0)
                .upiAmount(50.0)
                .cardAmount(0.0)
                .loyaltyAmount(0.0)
                .storeCreditAmount(0.0)
                .loyaltyPointsRedeemed(0)
                .offlineId("OFF-" + System.currentTimeMillis())
                .isOfflineSynced(false)
                .build();

        OrderDTO created = orderService.createOrder(dto);
        Assertions.assertNotNull(created);
        Assertions.assertNotNull(created.getId());
        Assertions.assertEquals(900.0, created.getTotalAmount());
    }
}
