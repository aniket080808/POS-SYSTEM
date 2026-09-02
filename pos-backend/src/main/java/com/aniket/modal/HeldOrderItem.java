package com.aniket.modal;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "held_order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HeldOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "held_order_id", nullable = false)
    @JsonIgnore
    private HeldOrder heldOrder;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private String productName;

    private String sku;

    private Double price;

    private Double sellingPrice;

    private Integer quantity;

    private String image;
}
