package com.aniket.service;

import com.aniket.payload.dto.ai.*;
import org.springframework.web.multipart.MultipartFile;

public interface GeminiAiService {
    InvoiceExtractionResponse scanSupplierInvoice(MultipartFile file);
    AiCopilotResponse processCopilotQuery(AiCopilotRequest request);
    AiUpsellResponse getUpsellRecommendations(AiUpsellRequest request);
}
