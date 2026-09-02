package com.aniket.controller;

import com.aniket.domain.UserRole;
import com.aniket.modal.User;
import com.aniket.payload.dto.UserDTO;
import com.aniket.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @PostMapping("/store/{storeId}")
    @PreAuthorize("hasAnyAuthority('ROLE_STORE_ADMIN', 'ROLE_STORE_MANAGER')")
    public ResponseEntity<UserDTO> createStoreEmployee(
            @RequestBody UserDTO employee, @PathVariable Long storeId) throws Exception {
        UserDTO createdEmployee = employeeService.createStoreEmployee(employee, storeId);
        return new ResponseEntity<>(createdEmployee, HttpStatus.CREATED);
    }

    @PostMapping("/branch/{branchId}")
    @PreAuthorize("hasAnyAuthority('ROLE_BRANCH_ADMIN', 'ROLE_BRANCH_MANAGER')")
    public ResponseEntity<UserDTO> createBranchEmployee(@RequestBody User employee, @PathVariable Long branchId) throws Exception {
        UserDTO createdEmployee = employeeService.createBranchEmployee(employee, branchId);
        return new ResponseEntity<>(createdEmployee, HttpStatus.CREATED);
    }

    @PutMapping("/{employeeId}")
    @PreAuthorize("hasAnyAuthority('ROLE_STORE_ADMIN', 'ROLE_STORE_MANAGER', 'ROLE_BRANCH_ADMIN', 'ROLE_BRANCH_MANAGER')")
    public ResponseEntity<UserDTO> updateEmployee(@PathVariable Long employeeId, @RequestBody UserDTO employeeDetails) throws Exception {
        UserDTO updatedEmployee = employeeService.updateEmployee(employeeId, employeeDetails);
        return new ResponseEntity<>(updatedEmployee, HttpStatus.OK);
    }

    @DeleteMapping("/{employeeId}")
    @PreAuthorize("hasAnyAuthority('ROLE_STORE_ADMIN', 'ROLE_BRANCH_ADMIN')")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long employeeId) throws Exception {
        employeeService.deleteEmployee(employeeId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/{employeeId}")
    @PreAuthorize("hasAnyAuthority('ROLE_STORE_ADMIN', 'ROLE_STORE_MANAGER', 'ROLE_BRANCH_ADMIN', 'ROLE_BRANCH_MANAGER')")
    public ResponseEntity<UserDTO> findEmployeeById(@PathVariable Long employeeId) throws Exception {
        UserDTO employee = employeeService.findEmployeeById(employeeId);
        return new ResponseEntity<>(employee, HttpStatus.OK);
    }

    @GetMapping("/store/{storeId}")
    @PreAuthorize("hasAnyAuthority('ROLE_STORE_ADMIN', 'ROLE_STORE_MANAGER')")
    public ResponseEntity<List<UserDTO>> findStoreEmployees(
            @PathVariable Long storeId,
            @RequestParam(required = false) UserRole role) throws Exception {
        List<UserDTO> employees = employeeService.findStoreEmployees(storeId, role);
        return new ResponseEntity<>(employees, HttpStatus.OK);
    }

    @GetMapping("/branch/{branchId}")
    @PreAuthorize("hasAnyAuthority('ROLE_BRANCH_ADMIN', 'ROLE_BRANCH_MANAGER')")
    public ResponseEntity<List<UserDTO>> findBranchEmployees(
            @PathVariable Long branchId,
            @RequestParam(required = false) UserRole role
    ) throws Exception {
        List<UserDTO> employees = employeeService.findBranchEmployees(branchId,role);
        return new ResponseEntity<>(employees, HttpStatus.OK);
    }

    @PutMapping("/{employeeId}/toggle-access")
    @PreAuthorize("hasAnyAuthority('ROLE_STORE_ADMIN', 'ROLE_STORE_MANAGER', 'ROLE_BRANCH_ADMIN', 'ROLE_BRANCH_MANAGER')")
    public ResponseEntity<UserDTO> toggleEmployeeAccess(@PathVariable Long employeeId) throws Exception {
        UserDTO updated = employeeService.toggleEmployeeAccess(employeeId);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @PutMapping("/{employeeId}/reset-password")
    @PreAuthorize("hasAnyAuthority('ROLE_STORE_ADMIN', 'ROLE_STORE_MANAGER', 'ROLE_BRANCH_ADMIN', 'ROLE_BRANCH_MANAGER')")
    public ResponseEntity<UserDTO> resetEmployeePassword(
            @PathVariable Long employeeId,
            @RequestBody @jakarta.validation.Valid com.aniket.payload.request.AdminResetPasswordRequest req
    ) throws Exception {
        UserDTO updated = employeeService.resetEmployeePassword(employeeId, req.getNewPassword());
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @GetMapping("/{employeeId}/performance")
    @PreAuthorize("hasAnyAuthority('ROLE_STORE_ADMIN', 'ROLE_STORE_MANAGER', 'ROLE_BRANCH_ADMIN', 'ROLE_BRANCH_MANAGER')")
    public ResponseEntity<com.aniket.payload.dto.EmployeePerformanceDTO> getEmployeePerformance(
            @PathVariable Long employeeId
    ) throws Exception {
        com.aniket.payload.dto.EmployeePerformanceDTO performance = employeeService.getEmployeePerformance(employeeId);
        return new ResponseEntity<>(performance, HttpStatus.OK);
    }
}