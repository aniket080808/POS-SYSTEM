package com.aniket.payload.dto;


import com.aniket.domain.OrderStatus;
import com.aniket.domain.PaymentType;
import com.aniket.modal.Customer;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDTO {
    private Long id;
    private Double totalAmount;
    private Double subtotal;
    private Double discount;
    private Double tax;
    private Long branchId;
    private Long cashierId;
    private String cashierName;
    private Customer customer;
    private List<OrderItemDTO> items;
    private LocalDateTime createdAt;
    private PaymentType paymentType;
    private OrderStatus status;
    private String offlineId;
    private Boolean isOfflineSynced;
    private Double cashAmount;
    private Double upiAmount;
    private Double cardAmount;
    private Double loyaltyAmount;
    private Double storeCreditAmount;
    private Integer loyaltyPointsRedeemed;
    private Integer loyaltyPointsEarned;
}


