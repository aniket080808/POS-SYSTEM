package com.aniket.controller;

import com.aniket.modal.BranchSetting;
import com.aniket.service.BranchSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/branches/{branchId}/settings")
@RequiredArgsConstructor
public class BranchSettingController {

    private final BranchSettingService branchSettingService;

    @GetMapping
    @PreAuthorize("hasAnyRole('STORE_ADMIN', 'STORE_MANAGER', 'BRANCH_ADMIN', 'BRANCH_MANAGER', 'BRANCH_CASHIER', 'ADMIN')")
    public ResponseEntity<BranchSetting> getSettings(@PathVariable Long branchId) throws Exception {
        return ResponseEntity.ok(branchSettingService.getSettingsByBranchId(branchId));
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('STORE_ADMIN', 'STORE_MANAGER', 'BRANCH_ADMIN', 'BRANCH_MANAGER', 'ADMIN')")
    public ResponseEntity<BranchSetting> updateSettings(
            @PathVariable Long branchId,
            @RequestBody BranchSetting settings
    ) throws Exception {
        return ResponseEntity.ok(branchSettingService.saveOrUpdateSettings(branchId, settings));
    }
}
