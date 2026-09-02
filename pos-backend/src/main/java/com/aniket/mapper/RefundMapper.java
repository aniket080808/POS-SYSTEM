package com.aniket.mapper;


import com.aniket.modal.Refund;
import com.aniket.payload.dto.RefundDTO;

public class RefundMapper {

    public static RefundDTO toDTO(Refund refund) {
        RefundDTO dto = new RefundDTO();
        dto.setId(refund.getId());
        if (refund.getOrder() != null) {
            dto.setOrderId(refund.getOrder().getId());
            if (refund.getOrder().getCustomer() != null) {
                dto.setCustomerName(refund.getOrder().getCustomer().getFullName());
            }
            if (refund.getPaymentType() != null) {
                dto.setPaymentType(refund.getPaymentType());
            } else if (refund.getOrder().getPaymentType() != null) {
                dto.setPaymentType(refund.getOrder().getPaymentType());
            }
        }
        dto.setReason(refund.getReason());
        dto.setAmount(refund.getAmount());
        dto.setCashierName(refund.getCashier() != null ? refund.getCashier().getFullName() : null);
        dto.setBranchId(refund.getBranch() != null ? refund.getBranch().getId() : null);
        dto.setShiftReportId(refund.getShiftReport() != null ? refund.getShiftReport().getId() : null);
        dto.setCreatedAt(refund.getCreatedAt());
        return dto;
    }
}
