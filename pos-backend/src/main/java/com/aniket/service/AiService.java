package com.aniket.service;

import com.aniket.payload.dto.ai.AiUpsellRequest;
import com.aniket.payload.dto.ai.AiUpsellResponse;
import com.aniket.payload.dto.ai.InvoiceExtractionResponse;
import org.springframework.web.multipart.MultipartFile;

public interface AiService {
    InvoiceExtractionResponse scanSupplierInvoice(MultipartFile file);
    AiUpsellResponse getUpsellRecommendations(AiUpsellRequest request);
}
