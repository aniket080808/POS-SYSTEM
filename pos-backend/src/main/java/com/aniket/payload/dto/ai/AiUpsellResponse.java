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
public class AiUpsellResponse {
    private boolean success;
    private List<UpsellItemDto> recommendations;
    private String pitchMessage; // Short cashier phrase e.g. "Add Jam at 10% off with this Bread!"

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpsellItemDto {
        private Long productId;
        private String name;
        private String category;
        private Double price;
        private String reason;
        private Double discountPercentage;
    }
}
