package com.aniket.payload.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResubmitResponse {
    private boolean success;
    private boolean requiresPayment;
    private String message;
    private String paymentUrl;
}
