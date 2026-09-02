package com.aniket.modal;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "fullName is mandatory")
    private String fullName;

    private String email;

    private String phone;

    @ManyToOne
    @JoinColumn(name = "store_id")
    @JsonIgnoreProperties({"storeAdmin", "contact", "subscription"})
    private Store store;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private Integer loyaltyPoints = 0;

    private String loyaltyStatus = "Bronze";

    @Column(nullable = false, columnDefinition = "double precision default 0.0")
    private Double storeCredit = 0.0;


    @Column(nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;

}
