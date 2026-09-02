package com.aniket.util;

import com.aniket.domain.UserRole;
import com.aniket.exception.UserException;
import com.aniket.modal.*;
import com.aniket.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import com.aniket.exception.AccessDeniedException;

@Component
@RequiredArgsConstructor
public class SecurityUtil {

    private final UserService userService;

    public void checkAuthority(Store store) throws AccessDeniedException, UserException {
        User user = userService.getCurrentUser();
        if (user.getRole() == UserRole.ROLE_ADMIN) {
            return;
        }
        if (user.getRole() != UserRole.ROLE_STORE_MANAGER 
                && user.getRole() != UserRole.ROLE_STORE_ADMIN
                && user.getRole() != UserRole.ROLE_BRANCH_ADMIN
                && user.getRole() != UserRole.ROLE_BRANCH_MANAGER
                && user.getRole() != UserRole.ROLE_BRANCH_CASHIER) {
            throw new AccessDeniedException("You do not have permission to perform this action.");
        }

        Long userStoreId = user.getStore() != null ? user.getStore().getId()
                : (user.getBranch() != null && user.getBranch().getStore() != null ? user.getBranch().getStore().getId() : null);

        if (userStoreId == null || !userStoreId.equals(store.getId())) {
            throw new AccessDeniedException("You are not authorized to access this store.");
        }
    }

    public void checkAuthority(BranchInventory branchInventory) throws AccessDeniedException,
            UserException {
        checkAuthority(branchInventory.getStore());
    }

    public void checkAuthority(Branch branch) throws AccessDeniedException,
            UserException {
        if (branch == null) {
            throw new AccessDeniedException("Branch cannot be null.");
        }
        User user = userService.getCurrentUser();
        if (user.getRole() == UserRole.ROLE_ADMIN) {
            return;
        }
        if (user.getRole() == UserRole.ROLE_STORE_ADMIN || user.getRole() == UserRole.ROLE_STORE_MANAGER) {
            checkAuthority(branch.getStore());
            return;
        }
        if (user.getRole() == UserRole.ROLE_BRANCH_ADMIN || user.getRole() == UserRole.ROLE_BRANCH_MANAGER || user.getRole() == UserRole.ROLE_BRANCH_CASHIER) {
            Long userBranchId = user.getBranch() != null ? user.getBranch().getId() : null;
            if (userBranchId == null || !userBranchId.equals(branch.getId())) {
                throw new AccessDeniedException("You are not authorized to access this branch.");
            }
            return;
        }
        throw new AccessDeniedException("You do not have permission to access this branch.");
    }

    public void checkAuthority(Inventory inventory) throws AccessDeniedException, UserException {
        if (inventory == null || inventory.getBranch() == null) {
            throw new AccessDeniedException("Inventory branch cannot be null.");
        }
        checkAuthority(inventory.getBranch());
    }
}
