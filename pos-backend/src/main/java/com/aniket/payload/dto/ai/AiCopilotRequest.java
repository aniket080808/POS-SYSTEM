package com.aniket.payload.dto.ai;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiCopilotRequest {
    @NotBlank(message = "Query cannot be blank")
    private String query;
    private Long storeId;
    private Long branchId;
    private String conversationHistory;
}
