package com.aniket.service.impl;

import com.aniket.exception.AccessDeniedException;
import com.aniket.exception.ResourceNotFoundException;
import com.aniket.exception.UserException;
import com.aniket.modal.Branch;
import com.aniket.modal.BranchSetting;
import com.aniket.repository.BranchRepository;
import com.aniket.repository.BranchSettingRepository;
import com.aniket.service.BranchSettingService;
import com.aniket.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BranchSettingServiceImpl implements BranchSettingService {

    private final BranchSettingRepository branchSettingRepository;
    private final BranchRepository branchRepository;
    private final SecurityUtil securityUtil;

    @Override
    public BranchSetting getSettingsByBranchId(Long branchId) throws ResourceNotFoundException, UserException {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with id: " + branchId));

        securityUtil.checkAuthority(branch);

        return branchSettingRepository.findByBranchId(branchId)
                .orElseGet(() -> BranchSetting.builder()
                        .branch(branch)
                        .printerSettings("{\"printerName\":\"Epson TM-T88VI\",\"paperSize\":\"80mm\",\"printLogo\":true,\"printCustomerDetails\":true,\"printItemizedTax\":true,\"footerText\":\"Thank you for shopping with us!\"}")
                        .taxSettings("{\"gstEnabled\":true,\"gstPercentage\":18,\"applyGstToAll\":true,\"showTaxBreakdown\":true}")
                        .paymentSettings("{\"acceptCash\":true,\"acceptUPI\":true,\"acceptCard\":true,\"upiId\":\"example@upi\",\"cardTerminalId\":\"TERM12345\"}")
                        .discountSettings("{\"allowDiscount\":true,\"maxDiscountPercentage\":10,\"requireManagerApproval\":true,\"discountReasons\":[\"Damaged Product\",\"Bulk Purchase\",\"Regular Customer\",\"Promotional Offer\"]}")
                        .build()
                );
    }

    @Override
    @Transactional
    public BranchSetting saveOrUpdateSettings(Long branchId, BranchSetting reqSettings) throws ResourceNotFoundException, UserException {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with id: " + branchId));

        securityUtil.checkAuthority(branch);

        BranchSetting setting = branchSettingRepository.findByBranchId(branchId)
                .orElseGet(() -> BranchSetting.builder().branch(branch).build());

        if (reqSettings.getPrinterSettings() != null) {
            setting.setPrinterSettings(reqSettings.getPrinterSettings());
        }
        if (reqSettings.getTaxSettings() != null) {
            setting.setTaxSettings(reqSettings.getTaxSettings());
        }
        if (reqSettings.getPaymentSettings() != null) {
            setting.setPaymentSettings(reqSettings.getPaymentSettings());
        }
        if (reqSettings.getDiscountSettings() != null) {
            setting.setDiscountSettings(reqSettings.getDiscountSettings());
        }

        return branchSettingRepository.save(setting);
    }
}
