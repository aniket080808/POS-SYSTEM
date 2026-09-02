package com.aniket.payload.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceExtractionResponse {
    private boolean success;
    private String supplierName;
    private String invoiceNumber;
    private String invoiceDate;
    private Double totalAmount;
    private Double totalTax;
    private List<ExtractedInvoiceItemDto> items;
    private String rawSummary;
    private String errorMessage;
}
