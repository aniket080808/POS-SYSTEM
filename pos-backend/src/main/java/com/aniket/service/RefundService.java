package com.aniket.service;

import com.aniket.exception.ResourceNotFoundException;
import com.aniket.exception.UserException;
import com.aniket.modal.Refund;
import com.aniket.payload.dto.RefundDTO;

import java.time.LocalDateTime;
import java.util.List;

public interface RefundService {

    /**
     * 🔁 Create a refund for an order.
     */
    Refund createRefund(RefundDTO refundDTO) throws UserException, ResourceNotFoundException;

    /**
     * 📋 Get all refunds (admin use).
     */
    List<Refund> getAllRefunds();

    /**
     * 👤 Get all refunds processed by a specific cashier.
     */
    List<Refund> getRefundsByCashier(Long cashierId);

    /**
     * 🧾 Get refunds for a specific shift.
     */
    List<Refund> getRefundsByShiftReport(Long shiftReportId);

    /**
     * 📆 Get refunds by cashier in a date range.
     */
    List<Refund> getRefundsByCashierAndDateRange(Long cashierId,
                                                 LocalDateTime from,
                                                 LocalDateTime to
    );

    /**
     * 🏬 Get all refunds processed in a specific branch.
     */
    List<Refund> getRefundsByBranch(Long branchId);

    /**
     * 🔍 Get refund by ID.
     */
    Refund getRefundById(Long id) throws ResourceNotFoundException;

    /**
     * ❌ Delete a refund (if needed).
     */
    void deleteRefund(Long refundId) throws ResourceNotFoundException;
}
