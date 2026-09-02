package com.aniket.controller;

import com.aniket.exception.ResourceNotFoundException;
import com.aniket.modal.Customer;
import com.aniket.modal.User;
import com.aniket.payload.dto.CustomerOverviewDTO;
import com.aniket.service.CustomerService;
import com.aniket.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final UserService userService;

    private static final String BRANCH_AND_ABOVE = "hasAnyRole('STORE_ADMIN', 'STORE_MANAGER', 'BRANCH_ADMIN', 'BRANCH_MANAGER', 'BRANCH_CASHIER')";

    @GetMapping("/overview")
    @PreAuthorize(BRANCH_AND_ABOVE)
    public ResponseEntity<CustomerOverviewDTO> getOverview(
            @RequestHeader("Authorization") String jwt
    ) throws Exception {
        User caller = userService.getUserFromJwtToken(jwt);
        return ResponseEntity.ok(customerService.getCustomerOverview(caller));
    }

    @PostMapping
    @PreAuthorize(BRANCH_AND_ABOVE)
    public ResponseEntity<Customer> create(
            @RequestBody Customer customer,
            @RequestHeader("Authorization") String jwt) throws Exception {
        User caller = userService.getUserFromJwtToken(jwt);
        return ResponseEntity.ok(customerService.createCustomer(customer, caller));
    }

    @PutMapping("/{id}")
    @PreAuthorize(BRANCH_AND_ABOVE)
    public ResponseEntity<Customer> update(
            @PathVariable Long id,
            @RequestBody Customer customer,
            @RequestHeader("Authorization") String jwt
    ) throws Exception {
        User caller = userService.getUserFromJwtToken(jwt);
        return ResponseEntity.ok(customerService.updateCustomer(id, customer, caller));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STORE_ADMIN', 'STORE_MANAGER', 'BRANCH_ADMIN', 'BRANCH_MANAGER')")
    public ResponseEntity<String> delete(
            @PathVariable Long id,
            @RequestHeader("Authorization") String jwt
    ) throws Exception {
        User caller = userService.getUserFromJwtToken(jwt);
        customerService.deleteCustomer(id, caller);
        return ResponseEntity.ok("Customer deleted successfully");
    }

    @GetMapping("/{id}")
    @PreAuthorize(BRANCH_AND_ABOVE)
    public ResponseEntity<Customer> getById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String jwt
    ) throws Exception {
        User caller = userService.getUserFromJwtToken(jwt);
        return ResponseEntity.ok(customerService.getCustomerById(id, caller));
    }

    @GetMapping
    @PreAuthorize(BRANCH_AND_ABOVE)
    public ResponseEntity<List<Customer>> getAll(
            @RequestHeader("Authorization") String jwt
    ) throws Exception {
        User caller = userService.getUserFromJwtToken(jwt);
        return ResponseEntity.ok(customerService.getAllCustomers(caller));
    }

    @PostMapping("/{id}/points")
    @PreAuthorize(BRANCH_AND_ABOVE)
    public ResponseEntity<Customer> addPoints(
            @PathVariable Long id,
            @RequestParam int points,
            @RequestHeader("Authorization") String jwt
    ) throws Exception {
        User caller = userService.getUserFromJwtToken(jwt);
        return ResponseEntity.ok(customerService.addLoyaltyPoints(id, points, caller));
    }

    @PostMapping("/{id}/credit")
    @PreAuthorize(BRANCH_AND_ABOVE)
    public ResponseEntity<Customer> updateCredit(
            @PathVariable Long id,
            @RequestParam Double amount,
            @RequestParam(required = false, defaultValue = "Store credit transaction") String note,
            @RequestHeader("Authorization") String jwt
    ) throws Exception {
        User caller = userService.getUserFromJwtToken(jwt);
        return ResponseEntity.ok(customerService.updateStoreCredit(id, amount, note, caller));
    }

}

