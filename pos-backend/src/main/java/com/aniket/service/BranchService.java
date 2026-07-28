package com.aniket.service;


import com.aniket.exception.ResourceNotFoundException;
import com.aniket.exception.UserException;
import com.aniket.modal.User;
import com.aniket.payload.dto.BranchDTO;
import com.aniket.payload.dto.UserDTO;

import java.util.List;

public interface BranchService {
    BranchDTO createBranch(BranchDTO branchDto, User user);
    BranchDTO getBranchById(Long id);
    List<BranchDTO> getAllBranchesByStoreId(Long storeId) throws UserException;
    BranchDTO updateBranch(Long id, BranchDTO branchDto, User user) throws Exception;

    void deleteBranch(Long id);
}

