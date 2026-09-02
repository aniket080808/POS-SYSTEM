package com.aniket.mapper;


import com.aniket.modal.Order;
import com.aniket.modal.OrderItem;
import com.aniket.payload.dto.OrderDTO;
import com.aniket.payload.dto.OrderItemDTO;

import java.util.stream.Collectors;

public class OrderMapper {

    public static OrderDTO toDto(Order order) {
        if (order == null) return null;
        return OrderDTO.builder()
                .id(order.getId())
                .totalAmount(order.getTotalAmount())
                .subtotal(order.getSubtotal())
                .discount(order.getDiscount())
                .tax(order.getTax())
                .branchId(order.getBranch() != null ? order.getBranch().getId() : null)
                .cashierId(order.getCashier() != null ? order.getCashier().getId() : null)
                .cashierName(order.getCashier() != null ? order.getCashier().getFullName() : null)
                .customer(order.getCustomer())
                .createdAt(order.getCreatedAt())
                .paymentType(order.getPaymentType())
                .status(order.getStatus())
                .offlineId(order.getOfflineId())
                .isOfflineSynced(order.getIsOfflineSynced())
                .cashAmount(order.getCashAmount())
                .upiAmount(order.getUpiAmount())
                .cardAmount(order.getCardAmount())
                .loyaltyAmount(order.getLoyaltyAmount())
                .storeCreditAmount(order.getStoreCreditAmount())
                .loyaltyPointsRedeemed(order.getLoyaltyPointsRedeemed())
                .loyaltyPointsEarned(order.getLoyaltyPointsEarned())
                .items(order.getItems() != null ? order.getItems().stream()

                        .map(OrderItemMapper::toDto)
                        .collect(Collectors.toList()) : java.util.Collections.emptyList())
                .build();

    }
}

