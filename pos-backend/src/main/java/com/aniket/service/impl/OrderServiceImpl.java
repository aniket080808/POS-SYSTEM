package com.aniket.service.impl;


import com.aniket.domain.OrderStatus;
import com.aniket.domain.PaymentType;
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
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final BranchInventoryRepository branchInventoryRepository;
    private final BranchRepository branchRepository;
    private final UserService userService;

    @Override
    public OrderDTO createOrder(OrderDTO dto) throws UserException {
        User cashier = userService.getCurrentUser();

        Branch branch=cashier.getBranch();

        if(branch==null){
            throw new UserException("cashier's branch is null");
        }

        Order order = Order.builder()
                .branch(branch)
                .cashier(cashier)
                .customer(dto.getCustomer())
                .paymentType(dto.getPaymentType())
                .build();

        List<OrderItem> orderItems = dto.getItems().stream().map(itemDto -> {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new EntityNotFoundException("Product not found"));

            // Get selling price from branch_inventory for the cashier's branch store
            BranchInventory inventory = branchInventoryRepository
                    .findByStoreIdAndProductId(branch.getStore().getId(), product.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Product not found in this branch's inventory"));

            return OrderItem.builder()
                    .product(product)
                    .quantity(itemDto.getQuantity())
                    .price(inventory.getSellingPrice() * itemDto.getQuantity())
                    .order(order)

                    .build();
        }).toList();

        double total = orderItems.stream().mapToDouble(OrderItem::getPrice).sum();
        order.setTotalAmount(total);
        order.setItems(orderItems);

        return OrderMapper.toDto(orderRepository.save(order));
    }

    @Override
    public OrderDTO getOrderById(Long id) {
        return orderRepository.findById(id)
                .map(OrderMapper::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));
    }



    @Override
    public List<OrderDTO> getOrdersByBranch(Long branchId,
                                            Long customerId,
                                            Long cashierId,
                                            PaymentType paymentType,
                                            OrderStatus status) {
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
//                .filter(order -> status() == null ||
//                        order.getStatus() == status)

                // ✅ Map to DTO
                .map(OrderMapper::toDto)

                // ✅ Sort by createdAt (latest first)
                .sorted((o1, o2) -> o2.getCreatedAt().compareTo(o1.getCreatedAt()))

                .collect(Collectors.toList());
//        return orderRepository.findByBranchId(branchId).stream()
//                .map(OrderMapper::toDto)
//                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDTO> getOrdersByCashier(Long cashierId) {
        return orderRepository.findByCashierId(cashierId).stream()
                .map(OrderMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteOrder(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new EntityNotFoundException("Order not found");
        }
        orderRepository.deleteById(id);
    }

    @Override
    public List<OrderDTO> getTodayOrdersByBranch(Long branchId) {
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
        List<Order> orders = orderRepository.findByCustomerId(customerId);

        return orders.stream()
                .map(OrderMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDTO> getTop5RecentOrdersByBranchId(Long branchId) {
        branchRepository.findById(branchId)
                .orElseThrow(() -> new EntityNotFoundException("Branch not found with ID: " + branchId));

        List<Order> orders = orderRepository.findTop5ByBranchIdOrderByCreatedAtDesc(branchId);
        return orders.stream()
                .map(OrderMapper::toDto)
                .collect(Collectors.toList());
    }

}
