package com.aniket.service;

import com.aniket.payload.dto.HeldOrderDTO;
import java.util.List;

public interface HeldOrderService {
    HeldOrderDTO saveHeldOrder(HeldOrderDTO dto);
    List<HeldOrderDTO> getHeldOrdersByBranch(Long branchId);
    List<HeldOrderDTO> getHeldOrdersByCashier(Long cashierId);
    void deleteHeldOrder(Long id);
}

