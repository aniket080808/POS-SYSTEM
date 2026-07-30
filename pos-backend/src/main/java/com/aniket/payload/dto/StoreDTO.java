package com.aniket.payload.dto;

import com.aniket.domain.StoreStatus;
import com.aniket.modal.StoreContact;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class StoreDTO {
    private Long id;
    private String brand;
    private Long storeAdminId;
    private UserDTO storeAdmin;
    private String storeType;
    private StoreStatus status;
    private String registrationRejectionReason;
    private String description;
    private StoreContact contact;
    private String gstNumber;
    private String panNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Store Business Settings
    private String currency;
    private Double taxRate;
    private String timezone;
    private String dateFormat;
    private String receiptFooter;
    private String acceptedPaymentMethods;
}