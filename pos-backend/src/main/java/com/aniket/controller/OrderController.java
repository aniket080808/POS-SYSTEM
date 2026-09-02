package com.aniket.controller;

import com.aniket.domain.OrderStatus;
import com.aniket.domain.PaymentType;
import com.aniket.exception.UserException;
import com.aniket.payload.dto.OrderDTO;
import com.aniket.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.jaxb.SpringDataJaxb;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("hasAnyRole('BRANCH_CASHIER', 'BRANCH_MANAGER', 'BRANCH_ADMIN', 'STORE_MANAGER', 'STORE_ADMIN', 'ADMIN')")
    public ResponseEntity<OrderDTO> createOrder(@RequestBody OrderDTO dto) throws UserException {
        return ResponseEntity.ok(orderService.createOrder(dto));
    }

    @PostMapping("/bulk-sync")
    @PreAuthorize("hasAnyRole('BRANCH_CASHIER', 'BRANCH_MANAGER', 'BRANCH_ADMIN', 'STORE_MANAGER', 'STORE_ADMIN', 'ADMIN')")
    public ResponseEntity<List<OrderDTO>> bulkSync(@RequestBody List<OrderDTO> dtos) throws UserException {
        return ResponseEntity.ok(orderService.bulkSyncOfflineOrders(dtos));
    }


    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('BRANCH_CASHIER', 'BRANCH_MANAGER', 'BRANCH_ADMIN', 'STORE_MANAGER', 'STORE_ADMIN', 'ADMIN')")
    public ResponseEntity<OrderDTO> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }


    @GetMapping("/branch/{branchId}")
    @PreAuthorize("hasAnyRole('BRANCH_CASHIER', 'BRANCH_MANAGER', 'BRANCH_ADMIN', 'STORE_MANAGER', 'STORE_ADMIN', 'ADMIN')")
    public ResponseEntity<List<OrderDTO>> getOrdersByBranch(
            @PathVariable Long branchId,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long cashierId,
            @RequestParam(required = false) PaymentType paymentType,
            @RequestParam(required = false) OrderStatus status) {
        return ResponseEntity.ok(orderService.getOrdersByBranch(
                    branchId,
                    customerId,
                    cashierId,
                    paymentType,
                    status
                )
        );
    }

    @GetMapping("/cashier/{cashierId}")
    @PreAuthorize("hasAnyRole('BRANCH_CASHIER', 'BRANCH_MANAGER', 'BRANCH_ADMIN', 'STORE_MANAGER', 'STORE_ADMIN', 'ADMIN')")
    public ResponseEntity<List<OrderDTO>> getOrdersByCashier(@PathVariable Long cashierId) {
        return ResponseEntity.ok(orderService.getOrdersByCashier(cashierId));
    }

    @GetMapping("/today/branch/{branchId}")
    @PreAuthorize("hasAnyRole('BRANCH_CASHIER', 'BRANCH_MANAGER', 'BRANCH_ADMIN', 'STORE_MANAGER', 'STORE_ADMIN', 'ADMIN')")
    public ResponseEntity<List<OrderDTO>> getTodayOrders(@PathVariable Long branchId) {
        return ResponseEntity.ok(orderService.getTodayOrdersByBranch(branchId));
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('BRANCH_CASHIER', 'BRANCH_MANAGER', 'BRANCH_ADMIN', 'STORE_MANAGER', 'STORE_ADMIN', 'ADMIN')")
    public ResponseEntity<List<OrderDTO>> getCustomerOrders(@PathVariable Long customerId) {
        return ResponseEntity.ok(orderService.getOrdersByCustomerId(customerId));
    }

    @GetMapping("/recent/{branchId}")
    @PreAuthorize("hasAnyRole('BRANCH_MANAGER', 'BRANCH_ADMIN', 'STORE_MANAGER', 'STORE_ADMIN', 'ADMIN')")
    public ResponseEntity<List<OrderDTO>> getRecentOrders(@PathVariable Long branchId) {
        List<OrderDTO> recentOrders = orderService.getTop5RecentOrdersByBranchId(branchId);
        return ResponseEntity.ok(recentOrders);
    }

    @GetMapping("/store/{storeAdminId}/paginated")
    @PreAuthorize("hasAnyRole('STORE_ADMIN', 'STORE_MANAGER', 'BRANCH_ADMIN', 'BRANCH_MANAGER', 'ADMIN')")
    public ResponseEntity<org.springframework.data.domain.Page<OrderDTO>> getPaginatedOrders(
            @PathVariable Long storeAdminId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long cashierId,
            @RequestParam(required = false) PaymentType paymentType,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime startDate,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime endDate
    ) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
                page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt")
        );
        return ResponseEntity.ok(orderService.getOrdersPaginated(
                storeAdminId, branchId, customerId, cashierId, paymentType, status, startDate, endDate, pageable
        ));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STORE_MANAGER', 'STORE_ADMIN', 'ADMIN')")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}

