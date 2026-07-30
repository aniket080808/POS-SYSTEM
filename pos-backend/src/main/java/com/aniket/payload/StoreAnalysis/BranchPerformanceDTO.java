package com.aniket.payload.StoreAnalysis;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class BranchPerformanceDTO {
    private List<BranchSalesDTO> branchSales;
    private Integer newBranchesThisMonth;
    private String topBranch;
}

