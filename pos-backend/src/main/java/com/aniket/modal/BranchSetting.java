package com.aniket.modal;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "branch_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BranchSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", unique = true, nullable = false)
    @JsonIgnoreProperties({"store", "manager", "workingDays", "hibernateLazyInitializer", "handler"})
    private Branch branch;

    @Column(columnDefinition = "TEXT")
    private String printerSettings;

    @Column(columnDefinition = "TEXT")
    private String taxSettings;

    @Column(columnDefinition = "TEXT")
    private String paymentSettings;

    @Column(columnDefinition = "TEXT")
    private String discountSettings;

    @Column(nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
