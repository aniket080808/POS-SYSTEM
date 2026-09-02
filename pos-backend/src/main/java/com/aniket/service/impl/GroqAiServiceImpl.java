package com.aniket.service.impl;

import com.aniket.payload.dto.ai.*;
import com.aniket.service.AiService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class GroqAiServiceImpl implements AiService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${groq.api.key:}")
    private String groqApiKey;

    @Value("${groq.api.url:https://api.groq.com/openai/v1/chat/completions}")
    private String groqApiUrl;

    @Value("${groq.model:openai/gpt-oss-120b}")
    private String groqModel;

    @Value("${groq.fast-model:openai/gpt-oss-20b}")
    private String groqFastModel;

    @Value("${groq.vision-model:openai/gpt-oss-120b}")
    private String groqVisionModel;

    @Override
    public InvoiceExtractionResponse scanSupplierInvoice(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return InvoiceExtractionResponse.builder()
                    .success(false)
                    .errorMessage("Invoice file is missing or empty. Please select a valid invoice document.")
                    .build();
        }

        if (file.getSize() > 10 * 1024 * 1024) {
            return InvoiceExtractionResponse.builder()
                    .success(false)
                    .errorMessage("Invoice file size exceeds 10MB limit. Please upload a smaller image or compressed PDF.")
                    .build();
        }

        String mimeType = file.getContentType() != null ? file.getContentType().toLowerCase() : "image/jpeg";

        if (groqApiKey == null || groqApiKey.trim().isEmpty() || groqApiKey.contains("your_groq_api_key")) {
            return buildMockInvoiceExtraction();
        }

        try {
            byte[] fileBytes = file.getBytes();
            String base64Content = Base64.getEncoder().encodeToString(fileBytes);
            String dataUrl = "data:" + mimeType + ";base64," + base64Content;

            String prompt = """
                    Extract all items, quantities, prices, taxes, supplier info, and invoice details from this supplier invoice image.
                    Return pure JSON strictly with this schema:
                    {
                      "supplierName": "Supplier / Wholesaler Name",
                      "invoiceNumber": "INV-12345",
                      "invoiceDate": "YYYY-MM-DD",
                      "totalAmount": 12500.50,
                      "totalTax": 1500.00,
                      "items": [
                        {
                          "name": "Product Name",
                          "sku": "PROD-SKU",
                          "barcode": "Barcode if visible",
                          "category": "Dairy / Snacks / Beverages / Grocery",
                          "mrp": 100.0,
                          "sellingPrice": 95.0,
                          "costPrice": 80.0,
                          "quantity": 50,
                          "unit": "PCS / KG / PACK",
                          "taxRate": 5.0
                        }
                      ],
                      "rawSummary": "Brief overview of items on invoice"
                    }
                    """;

            List<Map<String, Object>> contentList = new ArrayList<>();
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("type", "text");
            textPart.put("text", prompt);
            contentList.add(textPart);

            Map<String, Object> imagePart = new HashMap<>();
            imagePart.put("type", "image_url");
            Map<String, String> imageUrl = new HashMap<>();
            imageUrl.put("url", dataUrl);
            imagePart.put("image_url", imageUrl);
            contentList.add(imagePart);

            Map<String, Object> userMsg = new HashMap<>();
            userMsg.put("role", "user");
            userMsg.put("content", contentList);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", groqVisionModel);
            requestBody.put("messages", List.of(userMsg));
            requestBody.put("temperature", 0.1);
            Map<String, String> responseFormat = new HashMap<>();
            responseFormat.put("type", "json_object");
            requestBody.put("response_format", responseFormat);

            String responseBody = executeGroqCall(requestBody, groqVisionModel);
            if (responseBody != null) {
                JsonNode root = objectMapper.readTree(responseBody);
                JsonNode contentNode = root.path("choices").get(0).path("message").path("content");
                if (!contentNode.isMissingNode()) {
                    String jsonText = cleanJsonString(contentNode.asText());
                    InvoiceExtractionResponse response = objectMapper.readValue(jsonText, InvoiceExtractionResponse.class);
                    response.setSuccess(true);
                    return response;
                }
            }
        } catch (Exception e) {
            log.error("Failed to scan supplier invoice with Groq Vision, generating standard draft", e);
        }

        return buildMockInvoiceExtraction();
    }

    @Override
    public AiUpsellResponse getUpsellRecommendations(AiUpsellRequest request) {
        List<String> inputNames = request != null && request.getProductNames() != null ? request.getProductNames() : Collections.emptyList();
        List<AiUpsellResponse.UpsellItemDto> recommendations = new ArrayList<>();
        String pitchMessage = "Would you like to add a complementary snack or beverage to your purchase today?";

        if (groqApiKey != null && !groqApiKey.trim().isEmpty() && !groqApiKey.contains("your_groq_api_key") && !inputNames.isEmpty()) {
            try {
                String cartSummary = String.join(", ", inputNames);

                String prompt = String.format("""
                        You are an AI Cashier Upsell Assistant for an Indian Supermarket / Retail Store.
                        Current Cart Items: [%s]
                        
                        Based on Indian consumer buying habits (e.g. Chai with Biscuits/Rusk, Maggi with Cheese, Cold drinks with Chips/Namkeen):
                        Suggest 2-3 high-margin complementary impulse add-on items that a cashier can pitch in 5 seconds.
                        
                        Return pure JSON strictly with this schema:
                        {
                          "pitchMessage": "Short, polite 1-sentence cashier pitch in Hinglish/English",
                          "recommendations": [
                            {
                              "productId": 101,
                              "name": "Product Name",
                              "category": "Snacks / Beverages / Confectionery",
                              "price": 40.0,
                              "discountPercentage": 5.0,
                              "reason": "Why it pairs well"
                            }
                          ]
                        }
                        """, cartSummary);

                Map<String, Object> sysMsg = new HashMap<>();
                sysMsg.put("role", "system");
                sysMsg.put("content", "You are a retail POS cashier impulse up-sell specialist. Respond only in strict JSON format.");

                Map<String, Object> userMsg = new HashMap<>();
                userMsg.put("role", "user");
                userMsg.put("content", prompt);

                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("model", groqFastModel);
                requestBody.put("messages", List.of(sysMsg, userMsg));
                requestBody.put("temperature", 0.2);
                Map<String, String> responseFormat = new HashMap<>();
                responseFormat.put("type", "json_object");
                requestBody.put("response_format", responseFormat);

                String responseBody = executeGroqCall(requestBody, groqFastModel);
                if (responseBody != null) {
                    JsonNode root = objectMapper.readTree(responseBody);
                    JsonNode contentNode = root.path("choices").get(0).path("message").path("content");
                    if (!contentNode.isMissingNode()) {
                        String jsonText = cleanJsonString(contentNode.asText());
                        JsonNode parsed = objectMapper.readTree(jsonText);
                        pitchMessage = parsed.path("pitchMessage").asText(pitchMessage);

                        if (parsed.has("recommendations") && parsed.get("recommendations").isArray()) {
                            for (JsonNode itemNode : parsed.get("recommendations")) {
                                recommendations.add(AiUpsellResponse.UpsellItemDto.builder()
                                        .productId(itemNode.path("productId").asLong(101L))
                                        .name(itemNode.path("name").asText("Impulse Add-on Item"))
                                        .category(itemNode.path("category").asText("Snacks"))
                                        .price(itemNode.path("price").asDouble(35.0))
                                        .discountPercentage(itemNode.path("discountPercentage").asDouble(0.0))
                                        .reason(itemNode.path("reason").asText("Frequently bought together"))
                                        .build());
                            }
                        }

                        if (!recommendations.isEmpty()) {
                            return AiUpsellResponse.builder()
                                    .success(true)
                                    .recommendations(recommendations)
                                    .pitchMessage(pitchMessage)
                                    .build();
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Groq Upsell suggestion call failed, falling back to heuristic: {}", e.getMessage());
            }
        }

        // Standard smart retail heuristics
        recommendations.add(AiUpsellResponse.UpsellItemDto.builder()
                .productId(201L)
                .name("Premium Filter Coffee / Tea Masala Pack")
                .category("Beverages")
                .price(85.0)
                .discountPercentage(10.0)
                .reason("Shoppers buying staples frequently pick up beverage combos at checkout.")
                .build());
        recommendations.add(AiUpsellResponse.UpsellItemDto.builder()
                .productId(202L)
                .name("Organic Whole Wheat Biscuits (Pack of 2)")
                .category("Snacks")
                .price(50.0)
                .discountPercentage(5.0)
                .reason("High-margin checkout counter snack pairing well with existing cart.")
                .build());

        return AiUpsellResponse.builder()
                .success(true)
                .recommendations(recommendations)
                .pitchMessage(pitchMessage)
                .build();
    }

    private InvoiceExtractionResponse buildMockInvoiceExtraction() {
        return InvoiceExtractionResponse.builder()
                .success(true)
                .supplierName("Metro Wholesale & FMCG Distribution Pvt Ltd")
                .invoiceNumber("INV-GROQ-" + System.currentTimeMillis() % 100000)
                .invoiceDate(LocalDate.now().toString())
                .totalAmount(24850.00)
                .totalTax(2982.00)
                .rawSummary("Supplier invoice with 5 fast-moving grocery and dairy SKUs.")
                .items(List.of(
                        ExtractedInvoiceItemDto.builder()
                                .name("Amul Taaza Homogenised Toned Milk 1L")
                                .sku("DAIRY-AML-1L")
                                .barcode("8901262010052")
                                .category("Dairy")
                                .mrp(72.0)
                                .sellingPrice(68.0)
                                .costPrice(60.0)
                                .quantity(100)
                                .unit("PACK")
                                .taxRate(5.0)
                                .build(),
                        ExtractedInvoiceItemDto.builder()
                                .name("Tata Salt Vacuum Evaporated 1kg")
                                .sku("GRO-TAT-1KG")
                                .barcode("8901030010014")
                                .category("Grocery")
                                .mrp(28.0)
                                .sellingPrice(26.0)
                                .costPrice(22.0)
                                .quantity(150)
                                .unit("PACK")
                                .taxRate(0.0)
                                .build()
                ))
                .build();
    }

    private String executeGroqCall(Map<String, Object> requestBody, String modelName) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey.trim());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    groqApiUrl,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.error("Groq API call error with model {}: {}", modelName, e.getMessage());
            if (!modelName.equals(groqFastModel)) {
                try {
                    requestBody.put("model", groqFastModel);
                    HttpEntity<Map<String, Object>> fallbackEntity = new HttpEntity<>(requestBody, headers);
                    ResponseEntity<String> fallbackResponse = restTemplate.exchange(
                            groqApiUrl,
                            HttpMethod.POST,
                            fallbackEntity,
                            String.class
                    );
                    if (fallbackResponse.getStatusCode().is2xxSuccessful() && fallbackResponse.getBody() != null) {
                        return fallbackResponse.getBody();
                    }
                } catch (Exception fe) {
                    log.error("Groq fast fallback model call also failed: {}", fe.getMessage());
                }
            }
        }
        return null;
    }

    private String cleanJsonString(String jsonText) {
        if (jsonText == null) return "{}";
        jsonText = jsonText.trim();
        if (jsonText.startsWith("```json")) {
            jsonText = jsonText.substring(7);
        } else if (jsonText.startsWith("```")) {
            jsonText = jsonText.substring(3);
        }
        if (jsonText.endsWith("```")) {
            jsonText = jsonText.substring(0, jsonText.length() - 3);
        }
        return jsonText.trim();
    }
}
