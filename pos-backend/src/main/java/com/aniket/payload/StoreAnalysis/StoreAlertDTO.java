package com.aniket.payload.StoreAnalysis;

import com.aniket.payload.dto.BranchDTO;
import com.aniket.payload.dto.ProductDTO;
import com.aniket.payload.dto.RefundDTO;
import com.aniket.payload.dto.UserDTO;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class StoreAlertDTO {
    private List<ProductDTO> lowStockAlerts;
    private List<BranchDTO> noSalesToday;
    private List<RefundDTO> refundSpikeAlerts;
    private List<UserDTO> inactiveCashiers;
}

