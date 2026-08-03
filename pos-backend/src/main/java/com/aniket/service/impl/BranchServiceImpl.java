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
        Store store = storeRepository.findByStoreAdminId(user.getId());

        enforcePlanLimit(store, "maxBranches", store.getStoreAdmin().getId(), "branches");

        User manager = null;
        if (branchDto.getManager() != null && !branchDto.getManager().isBlank()) {
            manager = userRepository.findByFullNameOrEmail(branchDto.getManager());
            if (manager == null) {
                throw new ResourceNotFoundException("Manager not found with name: " + branchDto.getManager());
            }
        }

        Branch branch = BranchMapper.toEntity(branchDto, store);
        branch.setManager(manager);
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
        return BranchMapper.toDto(branch);
    }

    @Override
    public List<BranchDTO> getAllBranchesByStoreId(Long storeId) throws UserException {
        User currentUser=userService.getCurrentUser();
        Store store=storeRepository.findById(storeId).orElseThrow(
                () -> new EntityNotFoundException("Store not found")
        );

        // Check if current user is allowed
        boolean isStoreManager = currentUser.getRole() == UserRole.ROLE_STORE_MANAGER &&
                currentUser.getStore() != null &&
                currentUser.getStore().getId().equals(storeId);

        boolean isStoreAdmin = currentUser.getRole() == UserRole.ROLE_STORE_ADMIN &&
                store.getStoreAdmin() != null &&
                store.getStoreAdmin().getId().equals(currentUser.getId());

        if (!isStoreManager && !isStoreAdmin) {
            throw new UserException("You are not authorized to access this store's branches");
        }

        return branchRepository.findByStoreIdAndIsActiveTrue(store.getId()).stream()
                .map(BranchMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public BranchDTO updateBranch(Long id, BranchDTO branchDto, User user) throws Exception {

        Store store = storeRepository.findByStoreAdminId(user.getId());

        Branch existing = branchRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Branch not found"));

        if (store == null || !store.getId().equals(existing.getStore().getId())) {
            throw new AccessDeniedException("You are not authorized to manage this branch.");
        }

        existing.setName(branchDto.getName());
        existing.setAddress(branchDto.getAddress());
        existing.setEmail(branchDto.getEmail());
        existing.setPhone(branchDto.getPhone());
        existing.setCloseTime(branchDto.getCloseTime());
        existing.setOpenTime(branchDto.getOpenTime());
        existing.setWorkingDays(branchDto.getWorkingDays());

        if (branchDto.getManager() != null && !branchDto.getManager().isBlank()) {
            User manager = userRepository.findByFullNameOrEmail(branchDto.getManager());
            if (manager == null) {
                throw new ResourceNotFoundException("Manager not found with name: " + branchDto.getManager());
            }
            existing.setManager(manager);
        } else {
            existing.setManager(null);
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
        Store store = storeRepository.findByStoreAdminId(currentUser.getId());

        if (store == null || !store.getId().equals(existing.getStore().getId())) {
            throw new AccessDeniedException("You are not authorized to manage this branch.");
        }

        existing.setIsActive(false);
        branchRepository.save(existing);
    }
}
