package com.aniket.payload.StoreAnalysis;


import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class StoreOverviewDTO {
    // Existing fields (used by Dashboard page)
    private Integer totalBranches;
    private Double totalSales;
    private Integer totalOrders;
    private Integer totalEmployees;
    private Integer totalCustomers;
    private Integer totalRefunds;
    private Integer totalProducts;
    private String topBranchName;

    // Sales Management page specific fields
    private Integer todayOrders;
    private Integer yesterdayOrders;
    private Integer activeCashiers;
    private Double averageOrderValue;
    private Double previousPeriodSales;
    private Double previousPeriodAverageOrderValue;
}


