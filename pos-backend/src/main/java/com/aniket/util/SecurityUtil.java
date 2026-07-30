package com.aniket.util;

import com.aniket.domain.UserRole;
import com.aniket.exception.UserException;
import com.aniket.modal.*;
import com.aniket.repository.UserRepository;
import com.aniket.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.nio.file.AccessDeniedException;

@Component
@RequiredArgsConstructor
public class SecurityUtil {


    private final UserService userService;



    public void checkAuthority(Store store) throws AccessDeniedException,
            UserException {
        User user = userService.getCurrentUser();
        if (user.getRole() != UserRole.ROLE_STORE_MANAGER) {
            throw new AccessDeniedException("Only store manager can perform this action.");
        }
        if (user.getStore() == null || !user.getStore().getId().equals(store.getId())) {
            throw new AccessDeniedException("You are not authorized to manage this store.");
        }
    }

    public void checkAuthority(BranchInventory branchInventory) throws AccessDeniedException,
            UserException {
        checkAuthority(branchInventory.getStore());
    }

    public void checkAuthority(Branch branch) throws AccessDeniedException,
            UserException {
        checkAuthority(branch.getStore());
    }

    public void checkAuthority(Inventory inventory) throws AccessDeniedException, UserException {
        checkAuthority(inventory.getBranch()); // inventory -> branch -> store
    }
}
