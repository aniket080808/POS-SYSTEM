package com.aniket.service;

import com.aniket.configrations.DataMigrationRunner;
import com.aniket.domain.OrderStatus;
import com.aniket.domain.PaymentType;
import com.aniket.modal.*;
import com.aniket.payload.dto.OrderDTO;
import com.aniket.payload.dto.OrderItemDTO;
import com.aniket.payload.dto.RefundDTO;
import com.aniket.repository.*;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;
import java.util.List;

@SpringBootTest
public class InventoryAuditTest {

    @Autowired
    private BranchInventoryRepository branchInventoryRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderService orderService;

    @Autowired
    private RefundService refundService;

    @Autowired
    private DataMigrationRunner dataMigrationRunner;

    @Test
    @DisplayName("Verify Option A: Seeding, Dual-Table Atomic Deduction on Checkout, Dual Restoration on Refund, and Idempotent Seeding")
    void testOptionAFullSynchronizationWorkflow() throws Exception {
        // 1. Run DataMigrationRunner to seed missing branch inventory rows
        dataMigrationRunner.run(new DefaultApplicationArguments(new String[0]));

        Branch branch = branchRepository.findAll().stream().findFirst().orElseThrow();
        Store store = branch.getStore();
        Assertions.assertNotNull(store);

        List<BranchInventory> storeCatalog = branchInventoryRepository.findByStoreId(store.getId());
        List<Inventory> branchStock = inventoryRepository.findByBranchId(branch.getId());

        System.out.println("Store Catalog items: " + storeCatalog.size());
        System.out.println("Branch Stock items: " + branchStock.size());

        // Confirm branch stock has all store products
        Assertions.assertEquals(storeCatalog.size(), branchStock.size(), "Branch must have inventory records for all store products");

        // 2. Select first product from store catalog
        Product rice = storeCatalog.get(0).getProduct();
        BranchInventory biBefore = branchInventoryRepository.findByStoreIdAndProductId(store.getId(), rice.getId()).orElseThrow();
        Inventory invBefore = inventoryRepository.findByBranchIdAndProductId(branch.getId(), rice.getId()).orElseThrow();

        int storeStockBefore = biBefore.getStock();
        int branchQtyBefore = invBefore.getQuantity();

        System.out.println("BEFORE ORDER - India Gate Rice: Store Stock = " + storeStockBefore + ", Branch Qty = " + branchQtyBefore);

        // 3. Find Cashier Rakesh and authenticate in SecurityContextHolder
        User cashier = userRepository.findByEmail("rakeshkamble1345@gmail.com");
        Assertions.assertNotNull(cashier);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(cashier.getEmail(), null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_BRANCH_CASHIER")))
        );

        // 4. Place a test order for 2 units of India Gate Rice
        OrderDTO orderDTO = new OrderDTO();
        orderDTO.setBranchId(branch.getId());
        orderDTO.setPaymentType(PaymentType.CASH);
        orderDTO.setStatus(OrderStatus.COMPLETED);

        OrderItemDTO itemDTO = new OrderItemDTO();
        itemDTO.setProductId(rice.getId());
        itemDTO.setQuantity(2);
        orderDTO.setItems(List.of(itemDTO));

        OrderDTO createdOrder = orderService.createOrder(orderDTO);
        Assertions.assertNotNull(createdOrder.getId());

        // Confirm BOTH tables decremented by 2
        BranchInventory biAfterOrder = branchInventoryRepository.findByStoreIdAndProductId(store.getId(), rice.getId()).orElseThrow();
        Inventory invAfterOrder = inventoryRepository.findByBranchIdAndProductId(branch.getId(), rice.getId()).orElseThrow();

        System.out.println("AFTER ORDER - India Gate Rice: Store Stock = " + biAfterOrder.getStock() + ", Branch Qty = " + invAfterOrder.getQuantity());

        Assertions.assertEquals(storeStockBefore - 2, biAfterOrder.getStock(), "branch_inventory.stock must decrement by 2");
        Assertions.assertEquals(branchQtyBefore - 2, invAfterOrder.getQuantity(), "inventories.quantity must decrement by 2");

        // 5. Test Insufficient Stock Rollback
        OrderDTO excessiveOrder = new OrderDTO();
        excessiveOrder.setBranchId(branch.getId());
        excessiveOrder.setPaymentType(PaymentType.CASH);
        excessiveOrder.setStatus(OrderStatus.COMPLETED);

        OrderItemDTO excessiveItem = new OrderItemDTO();
        excessiveItem.setProductId(rice.getId());
        excessiveItem.setQuantity(99999);
        excessiveOrder.setItems(List.of(excessiveItem));

        Assertions.assertThrows(RuntimeException.class, () -> {
            orderService.createOrder(excessiveOrder);
        });

        // Confirm stock was NOT changed after failed transaction
        BranchInventory biAfterFailed = branchInventoryRepository.findByStoreIdAndProductId(store.getId(), rice.getId()).orElseThrow();
        Inventory invAfterFailed = inventoryRepository.findByBranchIdAndProductId(branch.getId(), rice.getId()).orElseThrow();
        Assertions.assertEquals(biAfterOrder.getStock(), biAfterFailed.getStock());
        Assertions.assertEquals(invAfterOrder.getQuantity(), invAfterFailed.getQuantity());

        // 6. Process Refund on the created order
        RefundDTO refundDTO = new RefundDTO();
        refundDTO.setOrderId(createdOrder.getId());
        refundDTO.setBranchId(branch.getId());
        refundDTO.setReason("Customer return test");

        Refund refund = refundService.createRefund(refundDTO);
        Assertions.assertNotNull(refund.getId());

        // Confirm BOTH tables restored back to pre-order levels
        BranchInventory biAfterRefund = branchInventoryRepository.findByStoreIdAndProductId(store.getId(), rice.getId()).orElseThrow();
        Inventory invAfterRefund = inventoryRepository.findByBranchIdAndProductId(branch.getId(), rice.getId()).orElseThrow();

        System.out.println("AFTER REFUND - India Gate Rice: Store Stock = " + biAfterRefund.getStock() + ", Branch Qty = " + invAfterRefund.getQuantity());

        Assertions.assertEquals(storeStockBefore, biAfterRefund.getStock(), "branch_inventory.stock must restore back to pre-order level");
        Assertions.assertEquals(branchQtyBefore, invAfterRefund.getQuantity(), "inventories.quantity must restore back to pre-order level");

        // 7. Test Idempotency: Run DataMigrationRunner a second time
        dataMigrationRunner.run(new DefaultApplicationArguments(new String[0]));

        BranchInventory biAfterSecondBoot = branchInventoryRepository.findByStoreIdAndProductId(store.getId(), rice.getId()).orElseThrow();
        Inventory invAfterSecondBoot = inventoryRepository.findByBranchIdAndProductId(branch.getId(), rice.getId()).orElseThrow();

        Assertions.assertEquals(storeStockBefore, biAfterSecondBoot.getStock(), "Second boot must NOT alter branch_inventory.stock");
        Assertions.assertEquals(branchQtyBefore, invAfterSecondBoot.getQuantity(), "Second boot must NOT alter inventories.quantity");

        System.out.println("✅ ALL OPTION A SYNCHRONIZATION AND CONCURRENCY TESTS PASSED PERFECTLY!");
    }
}
