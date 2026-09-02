package com.aniket.service;

import com.aniket.exception.ResourceNotFoundException;
import com.aniket.exception.UserException;
import com.aniket.modal.BranchSetting;

public interface BranchSettingService {

    BranchSetting getSettingsByBranchId(Long branchId) throws ResourceNotFoundException, UserException;

    BranchSetting saveOrUpdateSettings(Long branchId, BranchSetting settings) throws ResourceNotFoundException, UserException;
}
