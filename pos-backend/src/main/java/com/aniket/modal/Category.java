package com.aniket.modal;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categories", indexes = {
    @Index(name = "idx_category_store_id", columnList = "store_id"),
    @Index(name = "idx_category_name", columnList = "name")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    private Store store;
}
