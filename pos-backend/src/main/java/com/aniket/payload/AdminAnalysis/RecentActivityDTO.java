package com.aniket.payload.AdminAnalysis;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecentActivityDTO {
    private Long id;
    private String action;
    private String description;
    private String entityType;
    private Long entityId;
    private String performedBy;
    private String status;
    private LocalDateTime createdAt;
}