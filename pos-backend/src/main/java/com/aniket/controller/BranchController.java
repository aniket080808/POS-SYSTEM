package com.aniket.controller;
import com.aniket.exception.ResourceNotFoundException;
import com.aniket.exception.UserException;
import com.aniket.modal.User;
import com.aniket.payload.dto.BranchDTO;
import com.aniket.payload.dto.UserDTO;
import com.aniket.service.BranchService;
import com.aniket.service.StoreService;
import com.aniket.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/branches")
@RequiredArgsConstructor
public class BranchController {

    private final BranchService branchService;
    private final UserService userService;


    // 🔹 Create Branch
    @PostMapping
    @PreAuthorize("hasAnyRole('STORE_ADMIN', 'ADMIN')")
    public ResponseEntity<BranchDTO> createBranch(
            @Valid @RequestBody BranchDTO dto,

            @RequestHeader("Authorization") String jwt) throws Exception {
        User user = userService.getUserFromJwtToken(jwt);
        return ResponseEntity.ok(branchService.createBranch(dto,user));
    }

    // 🔹 Get Branch by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STORE_ADMIN', 'STORE_MANAGER', 'BRANCH_ADMIN', 'BRANCH_MANAGER', 'BRANCH_CASHIER', 'ADMIN')")
    public ResponseEntity<BranchDTO> getBranch(@PathVariable Long id) {
        return ResponseEntity.ok(branchService.getBranchById(id));
    }

    // 🔹 Get All Branches (No Pagination)
    @GetMapping("/store/{storeId}")
    @PreAuthorize("hasAnyRole('STORE_ADMIN', 'STORE_MANAGER', 'BRANCH_ADMIN', 'BRANCH_MANAGER', 'BRANCH_CASHIER', 'ADMIN')")
    public ResponseEntity<List<BranchDTO>> getAllBranches(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Long storeId
    ) throws UserException {
        User user=userService.getUserFromJwtToken(jwt);
        return ResponseEntity.ok(branchService.getAllBranchesByStoreId(storeId));
    }

    // 🔹 Update Branch
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STORE_ADMIN', 'BRANCH_ADMIN', 'BRANCH_MANAGER', 'ADMIN')")
    public ResponseEntity<BranchDTO> updateBranch(
            @PathVariable Long id,
            @RequestBody BranchDTO dto,
            @RequestHeader("Authorization") String jwt) throws Exception {
        User user=userService.getUserFromJwtToken(jwt);
        return ResponseEntity.ok(branchService.updateBranch(id, dto, user));
    }

    // 🔹 Delete Branch
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STORE_ADMIN', 'ADMIN')")
    public ResponseEntity<Void> deleteBranch(@PathVariable Long id) {
        branchService.deleteBranch(id);
        return ResponseEntity.noContent().build();
    }


}