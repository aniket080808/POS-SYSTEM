package com.aniket.service.impl;


import com.aniket.domain.UserRole;
import com.aniket.exception.AccessDeniedException;
import com.aniket.exception.ResourceNotFoundException;
import com.aniket.exception.UserException;
import com.aniket.mapper.BranchMapper;
import com.aniket.mapper.UserMapper;
import com.aniket.modal.Branch;
import com.aniket.modal.Store;
import com.aniket.modal.User;
import com.aniket.payload.dto.BranchDTO;
import com.aniket.payload.dto.UserDTO;
import com.aniket.repository.BranchInventoryRepository;
import com.aniket.repository.BranchRepository;
import com.aniket.repository.StoreRepository;
import com.aniket.repository.UserRepository;
import com.aniket.service.BranchService;
import com.aniket.service.StoreSubscriptionService;
import com.aniket.service.UserService;
import com.aniket.exception.PlanLimitExceededException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BranchServiceImpl implements BranchService {

    private final BranchRepository branchRepository;
    private final StoreRepository storeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;
    private final StoreSubscriptionService storeSubscriptionService;
    private final BranchInventoryRepository branchInventoryRepository;

    @Override
    public BranchDTO createBranch(BranchDTO branchDto, User user) throws Exception {
        Store store = user.getStore() != null ? user.getStore() : storeRepository.findByStoreAdminId(user.getId());
        if (store == null && user.getBranch() != null) {
            store = user.getBranch().getStore();
        }
        if (store == null && user.getRole() == com.aniket.domain.UserRole.ROLE_ADMIN && branchDto.getStoreId() != null) {
            store = storeRepository.findById(branchDto.getStoreId()).orElse(null);
        }
        if (store == null) {
            throw new ResourceNotFoundException("Store not found for current user");
        }
        if (user.getRole() != com.aniket.domain.UserRole.ROLE_ADMIN && branchDto.getStoreId() != null && !store.getId().equals(branchDto.getStoreId())) {
            throw new com.aniket.exception.AccessDeniedException("You are not authorized to create a branch for another store.");
        }

        Long adminId = store.getStoreAdmin() != null ? store.getStoreAdmin().getId() : user.getId();
        enforcePlanLimit(store, "maxBranches", adminId, "branches");

        User manager = null;
        if (branchDto.getManager() != null && !branchDto.getManager().isBlank()) {
            manager = userRepository.findByFullNameOrEmail(branchDto.getManager());
            if (manager == null) {
                throw new ResourceNotFoundException("Manager not found with name: " + branchDto.getManager());
            }
        }

        Branch branch = BranchMapper.toEntity(branchDto, store);
        branch.setManager(manager);
        if (branch.getIsActive() == null) {
            branch.setIsActive(true);
        }
        return BranchMapper.toDto(branchRepository.save(branch));
    }

    private void enforcePlanLimit(Store store, String limitField, Long storeAdminId, String resourceName) throws PlanLimitExceededException {
        if (store == null) return; // no store linked — let it pass (controllers enforce scoping)

        var storeSub = storeSubscriptionService.getOrCreateForStore(store);
        var plan = storeSub.getCurrentPlan();
        if (plan == null) return; // no active plan — no limit (first-store bootstrap / free)

        Integer limit = switch (limitField) {
            case "maxBranches" -> plan.getMaxBranches();
            case "maxUsers" -> plan.getMaxUsers();
            case "maxProducts" -> plan.getMaxProducts();
            default -> null;
        };

        if (limit == null || limit <= 0) return; // unlimited or not set

        int current = switch (limitField) {
            case "maxBranches" -> branchRepository.countByStoreAdminId(storeAdminId);
            case "maxUsers" -> userRepository.findAllEmployeesByStoreId(store.getId()).size();
            case "maxProducts" -> (int) branchInventoryRepository.countByStoreId(store.getId());
            default -> 0;
        };

        if (current >= limit) {
            throw new PlanLimitExceededException(
                "Your plan allows a maximum of " + limit + " " + resourceName + ".");
        }
    }

    @Override
    public BranchDTO getBranchById(Long id) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Branch not found"));
        User currentUser;
        try {
            currentUser = userService.getCurrentUser();
        } catch (UserException e) {
            throw new AccessDeniedException("You are not authorized to view this branch.", e);
        }

        if (currentUser.getRole() != UserRole.ROLE_ADMIN) {
            Store userStore = currentUser.getStore();
            if (userStore == null) {
                userStore = storeRepository.findByStoreAdminId(currentUser.getId());
            }
            if (userStore == null && currentUser.getBranch() != null) {
                userStore = currentUser.getBranch().getStore();
            }
            if (userStore == null || !userStore.getId().equals(branch.getStore().getId())) {
                throw new AccessDeniedException("You are not authorized to access this branch.");
            }
        }
        return BranchMapper.toDto(branch);
    }

    @Override
    public List<BranchDTO> getAllBranchesByStoreId(Long storeId) throws UserException {
        User currentUser=userService.getCurrentUser();
        Store store=storeRepository.findById(storeId).orElseThrow(
                () -> new EntityNotFoundException("Store not found")
        );

        // Check if current user is allowed
        if (currentUser.getRole() == UserRole.ROLE_ADMIN) {
            return branchRepository.findByStoreIdAndIsActiveTrue(store.getId()).stream()
                    .map(BranchMapper::toDto)
                    .collect(Collectors.toList());
        }

        Long userStoreId = currentUser.getStore() != null ? currentUser.getStore().getId()
                : (currentUser.getBranch() != null && currentUser.getBranch().getStore() != null ? currentUser.getBranch().getStore().getId() : null);

        if (userStoreId == null && store.getStoreAdmin() != null && store.getStoreAdmin().getId().equals(currentUser.getId())) {
            userStoreId = store.getId();
        }

        if (userStoreId == null || !userStoreId.equals(storeId)) {
            throw new UserException("You are not authorized to access this store's branches");
        }

        return branchRepository.findByStoreIdAndIsActiveTrue(store.getId()).stream()
                .map(BranchMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public BranchDTO updateBranch(Long id, BranchDTO branchDto, User user) throws Exception {

        Store store = user.getStore();
        if (store == null) {
            store = storeRepository.findByStoreAdminId(user.getId());
        }

        Branch existing = branchRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Branch not found"));

        if (store == null || !store.getId().equals(existing.getStore().getId())) {
            throw new AccessDeniedException("You are not authorized to manage this branch.");
        }

        // Patch-style: only update fields that were actually sent (non-null)
        if (branchDto.getName() != null) existing.setName(branchDto.getName());
        if (branchDto.getAddress() != null) existing.setAddress(branchDto.getAddress());
        if (branchDto.getEmail() != null) existing.setEmail(branchDto.getEmail());
        if (branchDto.getPhone() != null) existing.setPhone(branchDto.getPhone());
        if (branchDto.getCloseTime() != null) existing.setCloseTime(branchDto.getCloseTime());
        if (branchDto.getOpenTime() != null) existing.setOpenTime(branchDto.getOpenTime());
        if (branchDto.getWorkingDays() != null) existing.setWorkingDays(branchDto.getWorkingDays());

        // Only update manager if explicitly provided; never silently null it out
        if (branchDto.getManager() != null && !branchDto.getManager().isBlank()) {
            User manager = userRepository.findByFullNameOrEmail(branchDto.getManager());
            if (manager == null) {
                throw new ResourceNotFoundException("Manager not found with name: " + branchDto.getManager());
            }
            existing.setManager(manager);
        }

        return BranchMapper.toDto(branchRepository.save(existing));
    }

    @Override
    public void deleteBranch(Long id) {
        Branch existing = branchRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Branch not found"));

        User currentUser;
        try {
            currentUser = userService.getCurrentUser();
        } catch (UserException e) {
            throw new AccessDeniedException("You are not authorized to manage this branch.", e);
        }
        Store store = currentUser.getStore();
        if (store == null) {
            store = storeRepository.findByStoreAdminId(currentUser.getId());
        }

        if (store == null || !store.getId().equals(existing.getStore().getId())) {
            throw new AccessDeniedException("You are not authorized to manage this branch.");
        }

        existing.setIsActive(false);
        branchRepository.save(existing);
    }
}
