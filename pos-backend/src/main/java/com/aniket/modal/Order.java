package com.aniket.modal;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.aniket.domain.OrderStatus;
import com.aniket.domain.PaymentType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders", indexes = {
    @Index(name = "idx_order_created_at", columnList = "createdAt"),
    @Index(name = "idx_order_branch_id", columnList = "branch_id"),
    @Index(name = "idx_order_cashier_id", columnList = "cashier_id"),
    @Index(name = "idx_order_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double totalAmount;

    private Double subtotal;

    private Double discount;

    private Double tax;

    private LocalDateTime createdAt;

    @ManyToOne
    @JsonIgnore
    private Branch branch;

    @ManyToOne
    @JsonIgnore
    private User cashier;

    @ManyToOne
    private Customer customer;

    private PaymentType paymentType;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> items;

    @Builder.Default
    private OrderStatus status = OrderStatus.COMPLETED;

    @Column(unique = true)
    private String offlineId;

    @Builder.Default
    private Boolean isOfflineSynced = false;

    private Double cashAmount;

    private Double upiAmount;

    private Double cardAmount;

    private Double loyaltyAmount;

    private Double storeCreditAmount;

    private Integer loyaltyPointsRedeemed;

    private Integer loyaltyPointsEarned;

    @PrePersist

    public void onCreate() {
        createdAt = LocalDateTime.now();
    }
}


