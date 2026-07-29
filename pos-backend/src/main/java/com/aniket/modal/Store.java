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

    private String description;

    private String storeType;

    private StoreStatus status;

    private String registrationRejectionReason;

    // Contact Information
    @Embedded
    private StoreContact contact=new StoreContact();

    @PrePersist
    protected void onCreate() {
        createdAt = updatedAt = LocalDateTime.now();
        status=StoreStatus.PENDING;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
