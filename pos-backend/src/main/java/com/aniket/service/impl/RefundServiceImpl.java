package com.aniket.service.impl;

import com.aniket.domain.OrderStatus;
import com.aniket.exception.AccessDeniedException;
import com.aniket.exception.ResourceNotFoundException;
import com.aniket.exception.UserException;
import com.aniket.mapper.RefundMapper;
import com.aniket.modal.Branch;
import com.aniket.modal.Order;
import com.aniket.modal.Refund;
import com.aniket.modal.User;
import com.aniket.payload.dto.RefundDTO;
import com.aniket.repository.BranchRepository;
import com.aniket.repository.OrderRepository;
import com.aniket.repository.RefundRepository;
import com.aniket.service.RefundService;
import com.aniket.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RefundServiceImpl implements RefundService {

    private final RefundRepository refundRepository;
    private final OrderRepository orderRepository;
    private final UserService userService;
    private final BranchRepository branchRepository;
    private final com.aniket.repository.BranchInventoryRepository branchInventoryRepository;
    private final com.aniket.repository.InventoryRepository inventoryRepository;
    private final com.aniket.repository.ShiftReportRepository shiftReportRepository;
    private final com.aniket.util.SecurityUtil securityUtil;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public Refund createRefund(RefundDTO refundDTO) throws UserException, ResourceNotFoundException {
        User currentCashier = userService.getCurrentUser();

        Order order = orderRepository.findById(refundDTO.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        Branch branch = null;
        if (refundDTO.getBranchId() != null) {
            branch = branchRepository.findById(refundDTO.getBranchId()).orElse(null);
        }
        if (branch == null && currentCashier.getBranch() != null) {
            branch = currentCashier.getBranch();
        }
        if (branch == null && order.getBranch() != null) {
            branch = order.getBranch();
        }
        if (branch == null) {
            throw new ResourceNotFoundException("Branch not found");
        }

        securityUtil.checkAuthority(branch);
        final Branch targetBranch = branch;

        if (order.getStatus() == OrderStatus.REFUNDED) {
            throw new RuntimeException("Order #" + order.getId() + " has already been refunded.");
        }

        double totalRefundAmount = 0.0;
        List<com.aniket.payload.dto.RefundItemDTO> returnItems = refundDTO.getItems();

        if (returnItems != null && !returnItems.isEmpty()) {
            // Sort items by productId ASC to maintain consistent lock ordering and avoid deadlocks
            returnItems.sort(java.util.Comparator.comparing(
                    item -> item.getProductId() != null ? item.getProductId() : 0L
            ));

            for (com.aniket.payload.dto.RefundItemDTO returnItem : returnItems) {
                if (returnItem.getQuantity() == null || returnItem.getQuantity() <= 0) {
                    continue;
                }

                // Find matching OrderItem
                com.aniket.modal.OrderItem orderItem = null;
                if (returnItem.getOrderItemId() != null) {
                    orderItem = order.getItems().stream()
                            .filter(oi -> oi.getId() != null && oi.getId().equals(returnItem.getOrderItemId()))
                            .findFirst().orElse(null);
                }
                if (orderItem == null && returnItem.getProductId() != null) {
                    orderItem = order.getItems().stream()
                            .filter(oi -> oi.getProduct() != null && oi.getProduct().getId().equals(returnItem.getProductId()))
                            .findFirst().orElse(null);
                }

                if (orderItem == null) {
                    continue;
                }

                int returnQty = Math.min(returnItem.getQuantity(), orderItem.getQuantity() != null ? orderItem.getQuantity() : 0);
                if (returnQty <= 0) {
                    continue;
                }

                double unitPrice = returnItem.getPrice() != null ? returnItem.getPrice() :
                        (orderItem.getPrice() != null ? orderItem.getPrice() :
                                (orderItem.getProduct() != null && orderItem.getProduct().getMrp() != null ?
                                        orderItem.getProduct().getMrp() : 0.0));

                double itemRefundVal = unitPrice * returnQty;
                totalRefundAmount += itemRefundVal;

                com.aniket.modal.Product product = orderItem.getProduct();
                if (product != null) {
                    // 1. Lock BranchInventory (Store level)
                    if (targetBranch.getStore() != null) {
                        com.aniket.modal.BranchInventory storeInventory = branchInventoryRepository
                                .findByStoreIdAndProductIdWithLock(targetBranch.getStore().getId(), product.getId())
                                .orElse(null);
                        if (storeInventory != null) {
                            int currentStock = storeInventory.getStock() != null ? storeInventory.getStock() : 0;
                            storeInventory.setStock(currentStock + returnQty);
                            branchInventoryRepository.save(storeInventory);
                        }
                    }

                    // 2. Lock Inventory (Branch level)
                    com.aniket.modal.Inventory branchInventory = inventoryRepository
                            .findByBranchIdAndProductIdWithLock(targetBranch.getId(), product.getId())
                            .orElseGet(() -> {
                                com.aniket.modal.Inventory newInv = com.aniket.modal.Inventory.builder()
                                        .branch(targetBranch)
                                        .product(product)
                                        .quantity(0)
                                        .lastUpdated(LocalDateTime.now())
                                        .build();
                                return inventoryRepository.save(newInv);
                            });

                    int currentBranchStock = branchInventory.getQuantity() != null ? branchInventory.getQuantity() : 0;
                    branchInventory.setQuantity(currentBranchStock + returnQty);
                    branchInventory.setLastUpdated(LocalDateTime.now());
                    inventoryRepository.save(branchInventory);
                }

                // Deduct returned quantity from orderItem
                orderItem.setQuantity((orderItem.getQuantity() != null ? orderItem.getQuantity() : 0) - returnQty);
            }

            // Check if order has any remaining items
            int remainingItemQty = order.getItems().stream()
                    .mapToInt(oi -> oi.getQuantity() != null ? oi.getQuantity() : 0)
                    .sum();

            if (remainingItemQty <= 0) {
                order.setStatus(OrderStatus.REFUNDED);
            } else {
                // Partial refund: update remaining payable totals
                double newTotal = Math.max(0.0, (order.getTotalAmount() != null ? order.getTotalAmount() : 0.0) - totalRefundAmount);
                double newSubtotal = order.getSubtotal() != null ?
                        Math.max(0.0, order.getSubtotal() - totalRefundAmount) : newTotal;
                order.setTotalAmount(newTotal);
                order.setSubtotal(newSubtotal);
            }
            orderRepository.save(order);
        } else {
            // Full order return fallback
            if (order.getItems() != null) {
                List<com.aniket.modal.OrderItem> sortedItems = order.getItems().stream()
                        .filter(item -> item.getProduct() != null)
                        .sorted(java.util.Comparator.comparing(item -> item.getProduct().getId(), java.util.Comparator.nullsLast(Long::compareTo)))
                        .collect(Collectors.toList());

                for (com.aniket.modal.OrderItem item : sortedItems) {
                    com.aniket.modal.Product product = item.getProduct();
                    int returnQty = item.getQuantity() != null ? item.getQuantity() : 1;

                    // 1. Lock BranchInventory (Store level)
                    if (targetBranch.getStore() != null) {
                        com.aniket.modal.BranchInventory storeInventory = branchInventoryRepository
                                .findByStoreIdAndProductIdWithLock(targetBranch.getStore().getId(), product.getId())
                                .orElse(null);
                        if (storeInventory != null) {
                            int currentStock = storeInventory.getStock() != null ? storeInventory.getStock() : 0;
                            storeInventory.setStock(currentStock + returnQty);
                            branchInventoryRepository.save(storeInventory);
                        }
                    }

                    // 2. Lock Inventory (Branch level)
                    com.aniket.modal.Inventory branchInventory = inventoryRepository
                            .findByBranchIdAndProductIdWithLock(targetBranch.getId(), product.getId())
                            .orElseGet(() -> {
                                com.aniket.modal.Inventory newInv = com.aniket.modal.Inventory.builder()
                                        .branch(targetBranch)
                                        .product(product)
                                        .quantity(0)
                                        .lastUpdated(LocalDateTime.now())
                                        .build();
                                return inventoryRepository.save(newInv);
                            });

                    int currentBranchStock = branchInventory.getQuantity() != null ? branchInventory.getQuantity() : 0;
                    branchInventory.setQuantity(currentBranchStock + returnQty);
                    branchInventory.setLastUpdated(LocalDateTime.now());
                    inventoryRepository.save(branchInventory);

                    item.setQuantity(0);
                }
            }
            totalRefundAmount = order.getTotalAmount() != null ? order.getTotalAmount() : 0.0;
            order.setStatus(OrderStatus.REFUNDED);
            orderRepository.save(order);
        }

        Refund refund = new Refund();
        refund.setOrder(order);
        refund.setCashier(currentCashier);
        refund.setReason(refundDTO.getReason());
        refund.setAmount(totalRefundAmount > 0 ? totalRefundAmount : (order.getTotalAmount() != null ? order.getTotalAmount() : 0.0));
        refund.setPaymentType(refundDTO.getPaymentType() != null ? refundDTO.getPaymentType() : order.getPaymentType());
        refund.setCreatedAt(LocalDateTime.now());
        refund.setBranch(branch);

        Refund savedRefund = refundRepository.save(refund);

        // 🔔 Publish RefundCreatedEvent
        eventPublisher.publishEvent(com.aniket.event.RefundCreatedEvent.builder()
                .refundId(savedRefund.getId())
                .orderId(order.getId())
                .branchId(branch.getId())
                .branchName(branch.getName())
                .cashierId(currentCashier.getId())
                .cashierName(currentCashier.getFullName())
                .amount(savedRefund.getAmount())
                .reason(savedRefund.getReason())
                .createdAt(savedRefund.getCreatedAt())
                .build());

        return savedRefund;
    }

    @Override
    public List<Refund> getAllRefunds() {
        try {
            User currentUser = userService.getCurrentUser();
            if (currentUser.getRole() == com.aniket.domain.UserRole.ROLE_ADMIN) {
                return refundRepository.findAll();
            }
            if (currentUser.getRole() == com.aniket.domain.UserRole.ROLE_STORE_ADMIN ||
                currentUser.getRole() == com.aniket.domain.UserRole.ROLE_STORE_MANAGER) {
                if (currentUser.getStore() != null) {
                    return refundRepository.findByBranch_Store_Id(currentUser.getStore().getId());
                }
                return List.of();
            }
            if (currentUser.getBranch() != null) {
                return refundRepository.findByBranchId(currentUser.getBranch().getId());
            }
            return List.of();
        } catch (UserException e) {
            throw new AccessDeniedException("User authentication required to fetch refunds: " + e.getMessage());
        }
    }

    @Override
    public List<Refund> getRefundsByCashier(Long cashierId) {
        try {
            User current = userService.getCurrentUser();
            if (current.getRole() != com.aniket.domain.UserRole.ROLE_ADMIN) {
                if (current.getRole() == com.aniket.domain.UserRole.ROLE_BRANCH_CASHIER && !current.getId().equals(cashierId)) {
                    throw new AccessDeniedException("Cashiers can only view their own refunds.");
                }
            }
            return refundRepository.findByCashierId(cashierId);
        } catch (UserException e) {
            throw new AccessDeniedException("Authentication error: " + e.getMessage());
        }
    }

    @Override
    public List<Refund> getRefundsByShiftReport(Long shiftReportId) {
        com.aniket.modal.ShiftReport shiftReport = shiftReportRepository.findById(shiftReportId)
                .orElseThrow(() -> new EntityNotFoundException("Shift report not found with id: " + shiftReportId));
        if (shiftReport.getBranch() != null) {
            try {
                securityUtil.checkAuthority(shiftReport.getBranch());
            } catch (UserException e) {
                throw new AccessDeniedException("Access denied to shift refunds: " + e.getMessage());
            }
        }
        return refundRepository.findByShiftReportId(shiftReportId);
    }

    @Override
    public List<Refund> getRefundsByCashierAndDateRange(Long cashierId, LocalDateTime from, LocalDateTime to) {
        try {
            User current = userService.getCurrentUser();
            if (current.getRole() != com.aniket.domain.UserRole.ROLE_ADMIN) {
                if (current.getRole() == com.aniket.domain.UserRole.ROLE_BRANCH_CASHIER && !current.getId().equals(cashierId)) {
                    throw new AccessDeniedException("Cashiers can only view their own refunds.");
                }
            }
            return refundRepository.findByCashierIdAndCreatedAtBetween(cashierId, from, to);
        } catch (UserException e) {
            throw new AccessDeniedException("Authentication error: " + e.getMessage());
        }
    }

    @Override
    public List<Refund> getRefundsByBranch(Long branchId) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new EntityNotFoundException("Branch not found with ID: " + branchId));
        try {
            securityUtil.checkAuthority(branch);
        } catch (UserException e) {
            throw new AccessDeniedException("Access denied to branch refunds: " + e.getMessage());
        }
        return refundRepository.findByBranchId(branchId);
    }

    @Override
    public Refund getRefundById(Long id) throws ResourceNotFoundException {
        Refund refund = refundRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Refund not found"));
        try {
            if (refund.getBranch() != null) {
                securityUtil.checkAuthority(refund.getBranch());
            }
        } catch (UserException e) {
            throw new AccessDeniedException("Access denied to refund: " + e.getMessage());
        }
        return refund;
    }

    @Override
    public void deleteRefund(Long refundId) throws ResourceNotFoundException {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new ResourceNotFoundException("Refund not found"));
        try {
            if (refund.getBranch() != null) {
                securityUtil.checkAuthority(refund.getBranch());
            }
        } catch (UserException e) {
            throw new AccessDeniedException("Access denied to delete refund: " + e.getMessage());
        }
        refundRepository.delete(refund);
    }


}
