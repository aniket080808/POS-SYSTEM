package com.aniket.modal;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "store_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "store_id", referencedColumnName = "id", nullable = false, unique = true)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private Store store;

    // Notification Settings
    @Builder.Default
    private boolean emailNotifications = true;

    @Builder.Default
    private boolean lowStockAlerts = true;

    @Builder.Default
    private boolean salesReports = true;

    @Builder.Default
    private boolean employeeActivity = true;

    // Security Settings
    @Builder.Default
    private boolean twoFactorAuth = false;

    @Builder.Default
    private boolean ipRestriction = false;

    @Builder.Default
    private int passwordExpiry = 90;

    @Builder.Default
    private int sessionTimeout = 30;
}