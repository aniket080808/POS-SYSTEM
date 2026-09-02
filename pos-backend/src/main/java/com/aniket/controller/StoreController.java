package com.aniket.controller;


import com.aniket.domain.StoreStatus;
import com.aniket.exception.ResourceNotFoundException;
import com.aniket.exception.UserException;
import com.aniket.mapper.StoreMapper;
import com.aniket.modal.Store;
import com.aniket.modal.User;
import com.aniket.payload.dto.StoreDTO;
import com.aniket.payload.dto.StoreSubscriptionDetailDTO;
import com.aniket.payload.dto.UserDTO;
import com.aniket.payload.response.ApiResponse;
import com.aniket.service.StoreService;
import com.aniket.service.StoreSubscriptionService;
import com.aniket.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.method.P;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stores")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;
    private final UserService userService;
    private final StoreSubscriptionService storeSubscriptionService;

    // 🔹 Create Store
    @PostMapping
    @PreAuthorize("hasRole('STORE_ADMIN')")
    public ResponseEntity<StoreDTO> createStore(@Valid @RequestBody StoreDTO storeDto,
                                                @RequestHeader("Authorization") String jwt) throws UserException {
        User user = userService.getUserFromJwtToken(jwt);
        return ResponseEntity.ok(storeService.createStore(storeDto, user));
    }

    // 🔹 Get Store by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STORE_ADMIN', 'STORE_MANAGER', 'BRANCH_ADMIN', 'BRANCH_MANAGER', 'BRANCH_CASHIER', 'ADMIN')")
    public ResponseEntity<StoreDTO> getStoreById(@PathVariable Long id) throws ResourceNotFoundException {
        return ResponseEntity.ok(storeService.getStoreById(id));
    }



    // 🔹 Update Store
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STORE_ADMIN', 'STORE_MANAGER', 'ADMIN')")
    public ResponseEntity<StoreDTO> updateStore(
            @PathVariable Long id,
            @RequestBody StoreDTO storeDto)
            throws ResourceNotFoundException,
            UserException {
        return ResponseEntity.ok(storeService.updateStore(id, storeDto));
    }

    // 🔹 Super Admin: Update any store by ID (resolves store by path param, not owner JWT)
    @PutMapping("/super-admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StoreDTO> updateStoreAsSuperAdmin(
            @PathVariable Long id,
            @RequestBody StoreDTO storeDto)
            throws ResourceNotFoundException,
            UserException {
        return ResponseEntity.ok(storeService.updateStoreAsSuperAdmin(id, storeDto));
    }

    // 🔹 Delete Store (Self-scoped for Store Admin)
    @DeleteMapping()
    @PreAuthorize("hasRole('STORE_ADMIN')")
    public ResponseEntity<ApiResponse> deleteStore()
            throws ResourceNotFoundException, UserException {
        storeService.deleteStore();
        return ResponseEntity.ok(new ApiResponse("store deleted successfully"));
    }

    // 🔹 Delete Store by ID (Role-aware: Super Admin can delete any, Store Admin can only delete own store)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STORE_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse> deleteStoreById(@PathVariable Long id)
            throws ResourceNotFoundException, UserException {
        storeService.deleteStore(id);
        return ResponseEntity.ok(new ApiResponse("store deleted successfully"));
    }



    // ✅ Get Stores by Admin User ID
    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('STORE_ADMIN', 'STORE_MANAGER', 'BRANCH_MANAGER', 'BRANCH_ADMIN', 'BRANCH_CASHIER', 'ADMIN')")
    public ResponseEntity<StoreDTO> getStoresByAdminId() throws UserException {
        Store store=storeService.getStoreByAdminId();
        return ResponseEntity.ok(StoreMapper.toDto(store));
    }

    @GetMapping("/employee")
    @PreAuthorize("hasAnyRole('STORE_MANAGER', 'BRANCH_MANAGER', 'BRANCH_ADMIN', 'BRANCH_CASHIER', 'ADMIN')")
    public ResponseEntity<StoreDTO> getStoresByEmployee() throws UserException {
        StoreDTO store=storeService.getStoreByEmployee();
        return ResponseEntity.ok(store);
    }

    @GetMapping("/{storeId}/employee/list")
    @PreAuthorize("hasAnyRole('STORE_MANAGER', 'STORE_ADMIN', 'ADMIN')")
    public ResponseEntity<List<UserDTO>> getStoreEmployeeList(
            @PathVariable Long storeId) throws UserException {
        List<UserDTO> users=storeService.getEmployeesByStore(storeId);
        return ResponseEntity.ok(users);
    }

    @PostMapping("/add/employee")
    @PreAuthorize("hasAnyRole('STORE_MANAGER', 'STORE_ADMIN', 'ADMIN')")
    public ResponseEntity<UserDTO> addEmployee(
            @RequestBody UserDTO userDTO) throws UserException {
        UserDTO user=storeService.addEmployee(null, userDTO);
        return ResponseEntity.ok(user);
    }

//    super admin action

    // 🔹 Get All Stores (without pagination)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<StoreDTO>> getAllStores(
            @RequestParam(required = false)StoreStatus status
    ) {
        return ResponseEntity.ok(storeService.getAllStores(status));
    }

    // 🔹 Super Admin: Search stores with pagination, status filter, and search term
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<StoreDTO>> searchStores(
            @RequestParam(required = false) StoreStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sort
    ) {
        var pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return ResponseEntity.ok(storeService.searchStores(status, search, pageable));
    }

    /**
     * Approve or decline a store request
     * @param storeId the store ID
     * @param action the action to perform (APPROVE or DECLINE)
     * @return updated StoreDTO
     */
    @PutMapping("/{storeId}/moderate")
    @PreAuthorize("hasRole('ADMIN')")
    public StoreDTO moderateStore(
            @PathVariable Long storeId,
            @RequestParam StoreStatus action
    ) throws ResourceNotFoundException {
        return storeService.moderateStore(storeId, action);
    }

    // 🔹 Get Store Subscription Details (for super-admin store detail panel)
    @GetMapping("/{storeId}/subscription")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StoreSubscriptionDetailDTO> getStoreSubscription(
            @PathVariable Long storeId
    ) {
        return ResponseEntity.ok(storeSubscriptionService.getDetailByStoreId(storeId));
    }
}
