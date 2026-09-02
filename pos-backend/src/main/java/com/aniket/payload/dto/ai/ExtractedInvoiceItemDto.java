package com.aniket.payload.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExtractedInvoiceItemDto {
    private String name;
    private String sku;
    private String barcode;
    private String category;
    private Double mrp;
    private Double sellingPrice;
    private Double costPrice;
    private Integer quantity;
    private String unit; // e.g. PCS, KG, PACK
    private String batchNumber;
    private String expiryDate; // YYYY-MM-DD
    private String manufacturingDate; // YYYY-MM-DD
    private Double taxRate; // e.g. 5.0, 12.0, 18.0
    private String hsnCode;
    private String description;
}
