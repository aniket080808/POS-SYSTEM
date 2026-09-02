package com.aniket.modal;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "held_orders", indexes = {
    @Index(name = "idx_held_orders_branch_id", columnList = "branch_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HeldOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long branchId;

    private Long storeId;

    private Long cashierId;

    private String cashierName;


    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    private String note;

    private Double subtotal;

    private Double tax;

    private Double discountAmount;

    private Double totalAmount;

    private String referenceTag;

    @Builder.Default
    @OneToMany(mappedBy = "heldOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HeldOrderItem> items = new ArrayList<>();

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public void addItem(HeldOrderItem item) {
        items.add(item);
        item.setHeldOrder(this);
    }
}
