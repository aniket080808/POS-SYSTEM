package com.aniket.modal;

import com.aniket.domain.StoreStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "stores", indexes = {
    @Index(name = "idx_store_admin_id", columnList = "store_admin_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Store {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false)
    @NotBlank(message = "brand name is required")
    private String brand;

    @OneToOne(optional = false)
    @JoinColumn(name = "store_admin_id", referencedColumnName = "id", nullable = false, unique = true)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private User storeAdmin;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String storeType;

    @Enumerated(EnumType.STRING)
    private StoreStatus status;

    @Column(columnDefinition = "TEXT")
    private String registrationRejectionReason;

    // Contact Information
    @Builder.Default
    @Embedded
    private StoreContact contact = new StoreContact();

    // Business Documents
    private String gstNumber;
    private String panNumber;

    // Store Business Settings
    private String currency;

    private Double taxRate;

    private String timezone;

    private String dateFormat;

    @Column(columnDefinition = "TEXT")
    private String receiptFooter;

    // Comma-separated list of accepted payment methods (e.g., "cash,upi,card")
    private String acceptedPaymentMethods;

    // Payment Gateway Configuration
    private String upiId;
    private String merchantName;

    // Custom Super Admin Quota Overrides (null means use subscription plan limits)
    private Integer customMaxBranches;
    private Integer customMaxUsers;
    private Integer customMaxProducts;

    @PrePersist
    protected void onCreate() {
        createdAt = updatedAt = LocalDateTime.now();
        if (status == null) {
            status = StoreStatus.PENDING;
        }
        if (currency == null) currency = "INR";
        if (timezone == null) timezone = "Asia/Kolkata";
        if (dateFormat == null) dateFormat = "MM/DD/YYYY";
        if (acceptedPaymentMethods == null) acceptedPaymentMethods = "cash,upi,card";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}