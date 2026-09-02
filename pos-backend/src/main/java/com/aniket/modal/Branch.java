package com.aniket.modal;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "branches", indexes = {
    @Index(name = "idx_branch_store_id", columnList = "store_id"),
    @Index(name = "idx_branch_is_active", columnList = "isActive")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Branch {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String address;


    private String phone;

    private String email;

    /**
     * Example: ["MONDAY", "TUESDAY", "WEDNESDAY"]
     */
    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> workingDays;

    private LocalTime openTime;

    private LocalTime closeTime;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "store_id")
    private Store store;

    @OneToOne(cascade = CascadeType.REMOVE)
    @JsonIgnore
    private User manager;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isActive = true;

    @PrePersist
    protected void onCreate() {
        createdAt = updatedAt = LocalDateTime.now();
        if (isActive == null) {
            isActive = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (isActive == null) {
            isActive = true;
        }
    }
}
