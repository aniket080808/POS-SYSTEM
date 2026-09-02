package com.aniket.payload.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class StoreSettingsDTO {
    private Long id;
    private Long storeId;

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
    private boolean twoFactorAuth;
    private boolean ipRestriction;

    @Min(value = 1, message = "Password expiry must be at least 1 day")
    @Max(value = 365, message = "Password expiry cannot exceed 365 days")
    private Integer passwordExpiry;

    @Min(value = 1, message = "Session timeout must be at least 1 minute")
    @Max(value = 1440, message = "Session timeout cannot exceed 1440 minutes")
    private Integer sessionTimeout;
}