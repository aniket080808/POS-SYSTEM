package com.aniket.payload.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreSettingsDTO {
    private Long id;
    private Long storeId;

    // Notification Settings
    private boolean emailNotifications;
    private boolean lowStockAlerts;
    private boolean salesReports;
    private boolean employeeActivity;

    // Security Settings
    private boolean twoFactorAuth;
    private boolean ipRestriction;
    private int passwordExpiry;
    private int sessionTimeout;
}