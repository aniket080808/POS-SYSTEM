package com.aniket.payload.AdminAnalysis;


import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryDTO {
    private Long totalStores;
    private Long activeStores;
    private Long blockedStores;
    private Long pendingStores;
}
