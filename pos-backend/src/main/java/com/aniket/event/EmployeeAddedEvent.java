package com.aniket.event;

import com.aniket.domain.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeAddedEvent {
    private Long employeeId;
    private String employeeName;
    private String employeeEmail;
    private UserRole role;
    private Long branchId;
    private String branchName;
    private LocalDateTime createdAt;
}
