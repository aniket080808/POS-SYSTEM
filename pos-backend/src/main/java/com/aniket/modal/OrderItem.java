package com.aniket.modal;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "order_items", indexes = {
    @Index(name = "idx_order_item_order_id", columnList = "order_id"),
    @Index(name = "idx_order_item_product_id", columnList = "product_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer quantity;

    private Double price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = true)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.SET_NULL)
    private Product product;

    @ManyToOne
    private Order order;
}
