package com.aniket.payload.StoreAnalysis;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
public class TimeSeriesPointDTO {
    private LocalDate date;
    private Double totalAmount;

    public TimeSeriesPointDTO(LocalDate date, Double totalAmount) {
        this.date = date;
        this.totalAmount = totalAmount;
    }

    public TimeSeriesPointDTO(LocalDateTime date, Double totalAmount) {
        this.date = date != null ? date.toLocalDate() : null;
        this.totalAmount = totalAmount;
    }
}
