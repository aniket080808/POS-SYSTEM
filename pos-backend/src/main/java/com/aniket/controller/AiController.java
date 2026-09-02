package com.aniket.controller;

import com.aniket.modal.User;
import com.aniket.payload.dto.ProductDTO;
import com.aniket.payload.dto.ai.*;
import com.aniket.service.AiService;
import com.aniket.service.ProductService;
import com.aniket.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;
    private final UserService userService;
    private final ProductService productService;

    @PostMapping(value = "/scan-invoice", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('STORE_ADMIN', 'STORE_MANAGER', 'BRANCH_ADMIN', 'BRANCH_MANAGER', 'ADMIN')")
    public ResponseEntity<InvoiceExtractionResponse> scanInvoice(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(InvoiceExtractionResponse.builder()
                    .success(false)
                    .errorMessage("Uploaded invoice file is empty")
                    .build());
        }
        InvoiceExtractionResponse response = aiService.scanSupplierInvoice(file);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/copilot-query")
    @PreAuthorize("hasAnyRole('STORE_ADMIN', 'STORE_MANAGER', 'BRANCH_ADMIN', 'BRANCH_MANAGER', 'ADMIN', 'BRANCH_CASHIER')")
    public ResponseEntity<AiCopilotResponse> queryCopilot(@Valid @RequestBody AiCopilotRequest request) {
        AiCopilotResponse response = aiService.processCopilotQuery(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/upsell-suggestions")
    @PreAuthorize("hasAnyRole('BRANCH_CASHIER', 'STORE_ADMIN', 'STORE_MANAGER', 'BRANCH_MANAGER')")
    public ResponseEntity<AiUpsellResponse> getUpsellSuggestions(@RequestBody AiUpsellRequest request) {
        AiUpsellResponse response = aiService.getUpsellRecommendations(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/import-extracted-invoice")
    @PreAuthorize("hasAnyRole('STORE_ADMIN', 'STORE_MANAGER', 'ADMIN')")
    public ResponseEntity<?> importExtractedInvoice(@RequestBody List<ExtractedInvoiceItemDto> items) {
        try {
            User currentUser = userService.getCurrentUser();
            List<ProductDTO> dtos = new ArrayList<>();
            for (ExtractedInvoiceItemDto item : items) {
                if (item.getName() == null || item.getName().trim().isEmpty()) {
                    continue;
                }
                String sku = item.getSku() != null && !item.getSku().trim().isEmpty() 
                        ? item.getSku() 
                        : "SKU-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                
                Double mrp = item.getMrp() != null && item.getMrp() > 0 
                        ? item.getMrp() 
                        : (item.getSellingPrice() != null ? item.getSellingPrice() : 10.0);
                
                Double sellingPrice = item.getSellingPrice() != null && item.getSellingPrice() > 0 
                        ? item.getSellingPrice() 
                        : mrp;

                ProductDTO dto = ProductDTO.builder()
                        .name(item.getName().trim())
                        .sku(sku)
                        .category(item.getCategory() != null ? item.getCategory().trim() : "General")
                        .description(item.getDescription() != null ? item.getDescription() : "Imported via AI Invoice Scanner")
                        .mrp(mrp)
                        .sellingPrice(sellingPrice)
                        .stock(item.getQuantity() != null && item.getQuantity() > 0 ? item.getQuantity() : 10)
                        .isActive(true)
                        .build();
                dtos.add(dto);
            }

            List<ProductDTO> created = productService.bulkCreateProducts(dtos, currentUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            log.error("Failed to import AI extracted invoice items", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to import items: " + e.getMessage());
        }
    }
}
