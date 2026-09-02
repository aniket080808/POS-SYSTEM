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
public class AiUpsellRequest {
    private List<Long> productIds;
    private List<String> productNames;
    private Long branchId;
}
