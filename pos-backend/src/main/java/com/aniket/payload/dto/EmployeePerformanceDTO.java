package com.aniket.payload.dto;

import com.aniket.domain.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeePerformanceDTO {

    private Long employeeId;
    private String fullName;
    private String email;
    private String phone;
    private UserRole role;
    private Long branchId;
    private String branchName;
    private Boolean enabled;

    // Sales & Order metrics (primarily for Cashier)
    private Long totalOrders;
    private Double totalSales;
    private Double avgOrderValue;

    // Shift metrics
    private Long totalShifts;
    private String currentShiftStatus; // "ACTIVE", "CLOSED", "NONE"

    // Operational metadata
    private LocalDateTime assignedSince;
    private LocalDateTime lastLogin;
    private LocalDateTime lastActivity;
}
