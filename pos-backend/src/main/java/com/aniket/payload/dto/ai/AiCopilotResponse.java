package com.aniket.payload.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiCopilotResponse {
    private boolean success;
    private String answerMarkdown;
    private String intent; // e.g. SALES_SUMMARY, LOW_STOCK_ALERT, RESTOCK_RECOMMENDATION, GENERAL_QUERY
    private Map<String, Object> dataSnapshot;
    private List<String> suggestedFollowUps;
    private String errorMessage;
}
