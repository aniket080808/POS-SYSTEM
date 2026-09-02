package com.aniket.service.impl;


import com.aniket.domain.OrderStatus;
import com.aniket.domain.PaymentType;
import com.aniket.domain.UserRole;
import com.aniket.exception.AccessDeniedException;
import com.aniket.exception.UserException;
import com.aniket.mapper.OrderMapper;
import com.aniket.modal.*;
import com.aniket.payload.dto.OrderDTO;
import com.aniket.repository.*;

import com.aniket.service.OrderService;
import com.aniket.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@lombok.extern.slf4j.Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final BranchInventoryRepository branchInventoryRepository;
    private final com.aniket.repository.InventoryRepository inventoryRepository;
    private final BranchRepository branchRepository;
    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final CustomerRepository customerRepository;
    private final UserService userService;
    private final com.aniket.util.SecurityUtil securityUtil;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    @org.springframework.beans.factory.annotation.Value("${app.alerts.low-stock-threshold:10}")
    private int lowStockThreshold;


    @Override
    @org.springframework.transaction.annotation.Transactional
    public OrderDTO createOrder(OrderDTO dto) throws UserException {
        User cashier = userService.getCurrentUser();

        Branch branch=cashier.getBranch();

        if(branch==null){
            throw new UserException("cashier's branch is null");
        }

        // ✅ Validate payment method against store's acceptedPaymentMethods
        Store store = branch.getStore();
        if (store != null && dto.getPaymentType() != null && dto.getPaymentType() != PaymentType.SPLIT) {
            String acceptedStr = store.getAcceptedPaymentMethods();
            // If null/empty, treat as all methods accepted (matches frontend fallback)
            if (acceptedStr != null && !acceptedStr.trim().isEmpty()) {
                List<String> acceptedMethods = Arrays.stream(acceptedStr.split(","))
                        .map(String::trim)
                        .map(String::toUpperCase)
                        .collect(Collectors.toList());
                String requestedMethod = dto.getPaymentType().name().toUpperCase();
                if (!acceptedMethods.contains(requestedMethod)) {
                    throw new UserException(
                        "Payment method '" + dto.getPaymentType() + "' is not accepted by this store. " +
                        "Accepted methods: " + String.join(", ", acceptedMethods)
                    );
                }
            }
        }


        Order order = Order.builder()
                .branch(branch)
                .cashier(cashier)
                .paymentType(dto.getPaymentType())
                .status(dto.getStatus() != null ? dto.getStatus() : OrderStatus.COMPLETED)
                .build();

        // Sort order items by productId ascending to ensure deterministic lock acquisition order across concurrent transactions and eliminate DB deadlocks
        List<com.aniket.payload.dto.OrderItemDTO> sortedItems = dto.getItems().stream()
                .sorted(java.util.Comparator.comparing(com.aniket.payload.dto.OrderItemDTO::getProductId, java.util.Comparator.nullsLast(Long::compareTo)))
                .collect(Collectors.toList());

        List<BranchInventory> updatedInventories = new java.util.ArrayList<>();

        List<OrderItem> orderItems = sortedItems.stream().map(itemDto -> {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new EntityNotFoundException("Product not found"));

            // 1. Lock BranchInventory (Store level) with PESSIMISTIC_WRITE lock
            BranchInventory storeInventory = branchInventoryRepository
                    .findByStoreIdAndProductIdWithLock(branch.getStore().getId(), product.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Product not found in this branch's inventory"));

            // 2. Lock Inventory (Branch level) with PESSIMISTIC_WRITE lock (auto-create if missing)
            com.aniket.modal.Inventory branchInventory = inventoryRepository
                    .findByBranchIdAndProductIdWithLock(branch.getId(), product.getId())
                    .orElseGet(() -> {
                        com.aniket.modal.Inventory newInv = com.aniket.modal.Inventory.builder()
                                .branch(branch)
                                .product(product)
                                .quantity(storeInventory.getStock() != null ? storeInventory.getStock() : 0)
                                .lastUpdated(java.time.LocalDateTime.now())
                                .build();
                        return inventoryRepository.save(newInv);
                    });

            int requestedQty = itemDto.getQuantity() != null ? itemDto.getQuantity() : 1;
            int currentStoreStock = storeInventory.getStock() != null ? storeInventory.getStock() : 0;
            int currentBranchStock = branchInventory.getQuantity() != null ? branchInventory.getQuantity() : 0;

            if (currentStoreStock < requestedQty || currentBranchStock < requestedQty) {
                int available = Math.min(currentStoreStock, currentBranchStock);
                throw new com.aniket.exception.InsufficientStockException("Insufficient stock for product '" + product.getName() + 
                    "'. Available: " + available + ", requested: " + requestedQty);
            }

            storeInventory.setStock(currentStoreStock - requestedQty);
            BranchInventory savedStoreInv = branchInventoryRepository.save(storeInventory);
            updatedInventories.add(savedStoreInv);

            branchInventory.setQuantity(currentBranchStock - requestedQty);
            branchInventory.setLastUpdated(java.time.LocalDateTime.now());
            inventoryRepository.save(branchInventory);

            return OrderItem.builder()
                    .product(product)
                    .quantity(requestedQty)
                    .price(storeInventory.getSellingPrice() * requestedQty)
                    .order(order)
                    .build();
        }).toList();

        double subtotal = orderItems.stream().mapToDouble(OrderItem::getPrice).sum();
        double discount = 0.0;
        if (dto.getDiscount() != null && dto.getDiscount() > 0) {
            discount = Math.min(dto.getDiscount(), subtotal);
        }
        double tax = dto.getTax() != null && dto.getTax() >= 0 ? dto.getTax() : 0.0;
        double finalTotal = Math.max(0.0, subtotal - discount + tax);

        order.setSubtotal(subtotal);
        order.setDiscount(discount);
        order.setTax(tax);
        order.setTotalAmount(finalTotal);
        order.setItems(orderItems);
        if (dto.getOfflineId() != null && !dto.getOfflineId().trim().isEmpty()) {
            order.setOfflineId(dto.getOfflineId().trim());
        } else {
            order.setOfflineId(null);
        }
        order.setIsOfflineSynced(dto.getIsOfflineSynced() != null ? dto.getIsOfflineSynced() : false);
        order.setCashAmount(dto.getCashAmount());
        order.setUpiAmount(dto.getUpiAmount());
        order.setCardAmount(dto.getCardAmount());
        order.setLoyaltyAmount(dto.getLoyaltyAmount());
        order.setStoreCreditAmount(dto.getStoreCreditAmount());
        order.setLoyaltyPointsRedeemed(dto.getLoyaltyPointsRedeemed());

        // Calculate Tiered Loyalty Points Earned
        int earnedLoyaltyPoints = 0;
        if (dto.getCustomer() != null && dto.getCustomer().getId() != null && finalTotal > 0) {
            earnedLoyaltyPoints = calculateEarnedLoyaltyPoints(finalTotal);
        }
        order.setLoyaltyPointsEarned(earnedLoyaltyPoints);

        // Update Customer Loyalty ledger if customer present
        if (dto.getCustomer() != null && dto.getCustomer().getId() != null) {
            final int pointsEarned = earnedLoyaltyPoints;
            customerRepository.findById(dto.getCustomer().getId()).ifPresent(cust -> {
                int currentPoints = cust.getLoyaltyPoints() != null ? cust.getLoyaltyPoints() : 0;
                int redeemed = dto.getLoyaltyPointsRedeemed() != null ? Math.min(currentPoints, dto.getLoyaltyPointsRedeemed()) : 0;
                
                // Net updated points = (current - redeemed) + earned
                int updatedPoints = Math.max(0, currentPoints - redeemed) + pointsEarned;
                cust.setLoyaltyPoints(updatedPoints);

                // Auto-upgrade loyalty tier based on active points balance
                if (updatedPoints >= 1000) {
                    cust.setLoyaltyStatus("Platinum");
                } else if (updatedPoints >= 500) {
                    cust.setLoyaltyStatus("Gold");
                } else if (updatedPoints >= 200) {
                    cust.setLoyaltyStatus("Silver");
                } else {
                    cust.setLoyaltyStatus("Bronze");
                }

                // Store Credit deduction if applicable
                if (dto.getStoreCreditAmount() != null && dto.getStoreCreditAmount() > 0) {
                    double currentCredit = cust.getStoreCredit() != null ? cust.getStoreCredit() : 0.0;
                    cust.setStoreCredit(Math.max(0.0, currentCredit - dto.getStoreCreditAmount()));
                }

                if (cust.getCreatedAt() == null) {
                    cust.setCreatedAt(java.time.LocalDateTime.now());
                }
                cust.setUpdatedAt(java.time.LocalDateTime.now());

                Customer savedCust = customerRepository.save(cust);
                order.setCustomer(savedCust);
            });
        }


        Order savedOrder = orderRepository.save(order);

        // 🔔 Publish BranchOrderCreatedEvent for async notifications
        eventPublisher.publishEvent(com.aniket.event.BranchOrderCreatedEvent.builder()
                .orderId(savedOrder.getId())
                .branchId(branch.getId())
                .branchName(branch.getName())
                .cashierId(cashier.getId())
                .cashierName(cashier.getFullName())
                .totalAmount(savedOrder.getTotalAmount())
                .itemCount(orderItems.size())
                .createdAt(savedOrder.getCreatedAt() != null ? savedOrder.getCreatedAt() : java.time.LocalDateTime.now())
                .build());

        // 🔔 Check and publish LowStockAlertEvent for any items below threshold
        for (BranchInventory inv : updatedInventories) {
            if (inv.getStock() != null && inv.getStock() <= lowStockThreshold) {
                eventPublisher.publishEvent(com.aniket.event.LowStockAlertEvent.builder()
                        .branchId(branch.getId())
                        .branchName(branch.getName())
                        .productId(inv.getProduct() != null ? inv.getProduct().getId() : null)
                        .productName(inv.getProduct() != null ? inv.getProduct().getName() : "Item")
                        .currentStock(inv.getStock())
                        .threshold(lowStockThreshold)
                        .alertTime(java.time.LocalDateTime.now())
                        .build());
            }
        }

        return OrderMapper.toDto(savedOrder);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public List<OrderDTO> bulkSyncOfflineOrders(List<OrderDTO> dtos) throws UserException {
        if (dtos == null || dtos.isEmpty()) {
            return java.util.Collections.emptyList();
        }

        List<OrderDTO> syncedOrders = new java.util.ArrayList<>();
        for (OrderDTO dto : dtos) {
            try {
                // If order with offlineId already exists, skip to prevent double billing
                if (dto.getOfflineId() != null && !dto.getOfflineId().trim().isEmpty()) {
                    java.util.Optional<Order> existing = orderRepository.findByOfflineId(dto.getOfflineId().trim());
                    if (existing.isPresent()) {
                        syncedOrders.add(OrderMapper.toDto(existing.get()));
                        continue;
                    }
                }
                dto.setIsOfflineSynced(true);
                OrderDTO created = createOrder(dto);
                syncedOrders.add(created);
            } catch (Exception e) {
                log.error("Failed to sync offline order with offlineId {}: {}", dto.getOfflineId(), e.getMessage());
            }
        }
        return syncedOrders;
    }


    @Override
    public OrderDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));
        try {
            if (order.getBranch() != null) {
                securityUtil.checkAuthority(order.getBranch());
            }
        } catch (UserException e) {
            throw new AccessDeniedException("Access denied to order: " + e.getMessage());
        }
        return OrderMapper.toDto(order);
    }

    @Override
    public List<OrderDTO> getOrdersByBranch(Long branchId,
                                            Long customerId,
                                            Long cashierId,
                                            PaymentType paymentType,
                                            OrderStatus status) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new EntityNotFoundException("Branch not found with ID: " + branchId));
        try {
            securityUtil.checkAuthority(branch);
        } catch (UserException e) {
            throw new AccessDeniedException("Access denied to branch orders: " + e.getMessage());
        }

        return orderRepository.findByBranchId(branchId).stream()

                // ✅ Filter by Customer ID (if provided)
                .filter(order -> customerId == null ||
                        (order.getCustomer() != null &&
                                order.getCustomer().getId().equals(customerId)))

                // ✅ Filter by Cashier ID (if provided)
                .filter(order -> cashierId==null ||
                        (order.getCashier() != null &&
                                order.getCashier().getId().equals(cashierId)))

                // ✅ Filter by Payment Type (if provided)
                .filter(order -> paymentType == null ||
                        order.getPaymentType() == paymentType)

                // ✅ Filter by Status (if provided)
                .filter(order -> status == null || order.getStatus() == status || (status == OrderStatus.COMPLETED && order.getStatus() == null))

                // ✅ Map to DTO
                .map(OrderMapper::toDto)

                // ✅ Sort by createdAt (latest first)
                .sorted((o1, o2) -> o2.getCreatedAt().compareTo(o1.getCreatedAt()))

                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDTO> getOrdersByCashier(Long cashierId) {
        User targetCashier = userRepository.findById(cashierId)
                .orElseThrow(() -> new EntityNotFoundException("Cashier not found with ID: " + cashierId));
        try {
            User currentUser = userService.getCurrentUser();
            if (currentUser.getRole() != UserRole.ROLE_ADMIN && !currentUser.getId().equals(cashierId)) {
                if (targetCashier.getBranch() != null) {
                    securityUtil.checkAuthority(targetCashier.getBranch());
                } else if (targetCashier.getStore() != null) {
                    securityUtil.checkAuthority(targetCashier.getStore());
                }
            }
        } catch (UserException e) {
            throw new AccessDeniedException("Access denied to cashier orders: " + e.getMessage());
        }

        return orderRepository.findByCashierId(cashierId).stream()
                .map(OrderMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with ID: " + id));

        User currentUser;
        try {
            currentUser = userService.getCurrentUser();
        } catch (UserException e) {
            throw new AccessDeniedException("You are not authorized to delete this order.", e);
        }

        if (currentUser.getRole() != UserRole.ROLE_ADMIN) {
            Store userStore = currentUser.getStore();
            if (userStore == null) {
                userStore = storeRepository.findByStoreAdminId(currentUser.getId());
            }
            if (userStore == null && currentUser.getBranch() != null) {
                userStore = currentUser.getBranch().getStore();
            }
            if (userStore == null || order.getBranch() == null || order.getBranch().getStore() == null
                    || !userStore.getId().equals(order.getBranch().getStore().getId())) {
                throw new AccessDeniedException("You are not authorized to delete an order belonging to another store.");
            }
        }

        orderRepository.delete(order);
    }

    @Override
    public List<OrderDTO> getTodayOrdersByBranch(Long branchId) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new EntityNotFoundException("Branch not found with ID: " + branchId));
        try {
            securityUtil.checkAuthority(branch);
        } catch (UserException e) {
            throw new AccessDeniedException("Access denied to branch orders: " + e.getMessage());
        }

        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay();

        return orderRepository.findByBranchIdAndCreatedAtBetween(branchId, start, end)
                .stream()
                .map(OrderMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDTO> getOrdersByCustomerId(Long customerId) {
        User currentUser;
        try {
            currentUser = userService.getCurrentUser();
        } catch (UserException e) {
            throw new AccessDeniedException("Access denied: " + e.getMessage());
        }

        List<Order> orders = orderRepository.findByCustomerId(customerId);

        if (currentUser.getRole() == UserRole.ROLE_ADMIN) {
            return orders.stream().map(OrderMapper::toDto).collect(Collectors.toList());
        }

        Long userStoreId = currentUser.getStore() != null ? currentUser.getStore().getId()
                : (currentUser.getBranch() != null && currentUser.getBranch().getStore() != null ? currentUser.getBranch().getStore().getId() : null);

        Long userBranchId = currentUser.getBranch() != null ? currentUser.getBranch().getId() : null;

        return orders.stream()
                .filter(o -> {
                    if (o.getBranch() == null) return false;
                    if (currentUser.getRole() == UserRole.ROLE_BRANCH_ADMIN || currentUser.getRole() == UserRole.ROLE_BRANCH_MANAGER || currentUser.getRole() == UserRole.ROLE_BRANCH_CASHIER) {
                        return userBranchId != null && userBranchId.equals(o.getBranch().getId());
                    }
                    return userStoreId != null && o.getBranch().getStore() != null && userStoreId.equals(o.getBranch().getStore().getId());
                })
                .map(OrderMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDTO> getTop5RecentOrdersByBranchId(Long branchId) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new EntityNotFoundException("Branch not found with ID: " + branchId));
        try {
            securityUtil.checkAuthority(branch);
        } catch (UserException e) {
            throw new AccessDeniedException("Access denied to branch orders: " + e.getMessage());
        }

        List<Order> orders = orderRepository.findTop5ByBranchIdOrderByCreatedAtDesc(branchId);
        return orders.stream()
                .map(OrderMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public org.springframework.data.domain.Page<OrderDTO> getOrdersPaginated(
            Long storeAdminId,
            Long branchId,
            Long customerId,
            Long cashierId,
            PaymentType paymentType,
            OrderStatus status,
            LocalDateTime startDate,
            LocalDateTime endDate,
            org.springframework.data.domain.Pageable pageable
    ) {
        User currentUser;
        try {
            currentUser = userService.getCurrentUser();
        } catch (UserException e) {
            throw new AccessDeniedException("Unauthorized to access orders.", e);
        }

        Long resolvedStoreId = null;
        if (currentUser.getRole() == UserRole.ROLE_ADMIN) {
            if (storeAdminId != null) {
                User user = userRepository.findById(storeAdminId).orElse(null);
                if (user != null && user.getStore() != null) {
                    resolvedStoreId = user.getStore().getId();
                } else {
                    Store st = storeRepository.findByStoreAdminId(storeAdminId);
                    if (st != null) {
                        resolvedStoreId = st.getId();
                    } else if (storeRepository.existsById(storeAdminId)) {
                        resolvedStoreId = storeAdminId;
                    }
                }
            }
        } else {
            Store userStore = currentUser.getStore();
            if (userStore == null && currentUser.getBranch() != null) {
                userStore = currentUser.getBranch().getStore();
            }
            if (userStore == null) {
                userStore = storeRepository.findByStoreAdminId(currentUser.getId());
            }
            if (userStore == null) {
                throw new AccessDeniedException("You are not authorized to view orders.");
            }
            resolvedStoreId = userStore.getId();
        }

        final Long targetStoreId = resolvedStoreId;

        org.springframework.data.jpa.domain.Specification<Order> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();

            if (targetStoreId != null) {
                predicates.add(cb.equal(root.get("branch").get("store").get("id"), targetStoreId));
            }
            if (branchId != null) {
                predicates.add(cb.equal(root.get("branch").get("id"), branchId));
            }
            if (customerId != null) {
                predicates.add(cb.equal(root.get("customer").get("id"), customerId));
            }
            if (cashierId != null) {
                predicates.add(cb.equal(root.get("cashier").get("id"), cashierId));
            }
            if (paymentType != null) {
                predicates.add(cb.equal(root.get("paymentType"), paymentType));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startDate));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), endDate));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        org.springframework.data.domain.Page<Order> orderPage = orderRepository.findAll(spec, pageable);
        return orderPage.map(OrderMapper::toDto);
    }

    private int calculateEarnedLoyaltyPoints(double amount) {
        if (amount <= 0) return 0;
        if (amount >= 50000) {
            return 200 + (int) ((amount - 50000) / 250);
        } else if (amount >= 25000) {
            return 100;
        } else if (amount >= 10000) {
            return 75;
        } else if (amount >= 5000) {
            return 50;
        } else if (amount >= 2000) {
            return 25;
        } else if (amount >= 500) {
            return 10;
        } else {
            return Math.max(1, (int) (amount / 50.0));
        }
    }
}

