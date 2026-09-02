package com.aniket.service.impl;

import com.aniket.domain.UserRole;
import com.aniket.exception.AccessDeniedException;
import com.aniket.exception.ResourceNotFoundException;
import com.aniket.exception.UserException;
import com.aniket.mapper.UserMapper;
import com.aniket.modal.Branch;
import com.aniket.modal.Store;
import com.aniket.modal.User;
import com.aniket.payload.dto.UserDTO;
import com.aniket.repository.BranchRepository;
import com.aniket.repository.StoreRepository;
import com.aniket.repository.UserRepository;
import com.aniket.service.EmailService;
import com.aniket.service.EmailTemplateService;
import com.aniket.service.EmployeeService;
import com.aniket.service.StoreSubscriptionService;
import com.aniket.service.UserService;
import com.aniket.exception.PlanLimitExceededException;
import com.aniket.payload.dto.EmployeePerformanceDTO;
import com.aniket.repository.OrderRepository;
import com.aniket.repository.ShiftReportRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final BranchRepository branchRepository;
    private final PasswordEncoder passwordEncoder;
    private final StoreSubscriptionService storeSubscriptionService;
    private final UserService userService;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;
    private final OrderRepository orderRepository;
    private final ShiftReportRepository shiftReportRepository;
    private final EmailService emailService;
    private final EmailTemplateService emailTemplateService;

    // Branch-level roles that require a branch assignment
    private static final List<UserRole> BRANCH_LEVEL_ROLES = List.of(
            UserRole.ROLE_BRANCH_ADMIN,
            UserRole.ROLE_BRANCH_MANAGER,
            UserRole.ROLE_BRANCH_CASHIER
    );

    // Store-level roles that are NOT tied to a specific branch
    private static final List<UserRole> STORE_LEVEL_ROLES = List.of(
            UserRole.ROLE_STORE_ADMIN,
            UserRole.ROLE_STORE_MANAGER
    );

    @Override
    @Transactional
    public UserDTO createStoreEmployee(UserDTO dto, Long storeId) throws Exception {
        Store store = resolveAndVerifyStore(storeId);

        enforceUserLimit(store);

        if (dto.getFullName() == null || dto.getFullName().trim().isEmpty()) {
            throw new UserException("Full name is required");
        }
        if (dto.getEmail() == null || dto.getEmail().trim().isEmpty()) {
            throw new UserException("Email is required");
        }
        if (dto.getPassword() == null || dto.getPassword().trim().isEmpty()) {
            throw new UserException("Password is required");
        }
        if (dto.getRole() == null) {
            throw new UserException("Role is required");
        }

        // 🔒 Verify creator's role authority
        User caller = userService.getCurrentUser();
        if (caller != null) {
            if (caller.getRole() == UserRole.ROLE_STORE_MANAGER) {
                if (dto.getRole() != UserRole.ROLE_BRANCH_MANAGER &&
                    dto.getRole() != UserRole.ROLE_BRANCH_ADMIN &&
                    dto.getRole() != UserRole.ROLE_BRANCH_CASHIER) {
                    throw new AccessDeniedException("Store Manager can only create Branch Manager, Branch Admin, or Cashier accounts.");
                }
            } else if (caller.getRole() == UserRole.ROLE_STORE_ADMIN) {
                if (dto.getRole() == UserRole.ROLE_ADMIN || dto.getRole() == UserRole.ROLE_STORE_ADMIN) {
                    throw new AccessDeniedException("Store Admin cannot create Super Admin or Store Admin accounts.");
                }
            }
        }

        Branch branch = null;

        // 🔹 Branch assignment for ALL branch-level roles (not just Branch Manager)
        if (BRANCH_LEVEL_ROLES.contains(dto.getRole())) {
            if (dto.getBranchId() == null) {
                throw new UserException("Branch assignment is required for " + dto.getRole().name().replace("ROLE_", "").replace("_", " "));
            }

            branch = branchRepository.findById(dto.getBranchId())
                    .orElseThrow(() -> new ResourceNotFoundException("Branch not found with ID: " + dto.getBranchId()));
        }

        // 🔹 Duplicate validation — email
        User existingByEmail = userRepository.findByEmail(dto.getEmail());
        if (existingByEmail != null) {
            throw new UserException("An employee with this email already exists: " + dto.getEmail());
        }

        // 🔹 Duplicate validation — phone
        if (dto.getPhone() != null && !dto.getPhone().trim().isEmpty()) {
            User existingByPhone = userRepository.findByPhone(dto.getPhone());
            if (existingByPhone != null) {
                throw new UserException("An employee with this phone number already exists: " + dto.getPhone());
            }
        }

        String rawPassword = dto.getPassword();
        User employee = UserMapper.toEntity(dto);
        employee.setStore(store);
        // Set branch for branch-level roles; explicitly clear for store-level roles
        employee.setBranch(branch);
        employee.setEnabled(true);
        employee.setPasswordChangedAt(LocalDateTime.now());
        employee.setPassword(passwordEncoder.encode(employee.getPassword()));

        User savedEmployee = userRepository.save(employee);

        // Assign manager to the branch if applicable
        if (dto.getRole() == UserRole.ROLE_BRANCH_MANAGER && branch != null) {
            branch.setManager(savedEmployee);
            branchRepository.save(branch);
        }

        // 🔔 Publish EmployeeAddedEvent if branch assigned
        if (branch != null) {
            eventPublisher.publishEvent(com.aniket.event.EmployeeAddedEvent.builder()
                    .employeeId(savedEmployee.getId())
                    .employeeName(savedEmployee.getFullName())
                    .employeeEmail(savedEmployee.getEmail())
                    .role(savedEmployee.getRole())
                    .branchId(branch.getId())
                    .branchName(branch.getName())
                    .createdAt(savedEmployee.getCreatedAt() != null ? savedEmployee.getCreatedAt() : java.time.LocalDateTime.now())
                    .build());
        }

        // Send themed Staff Invitation Email
        if (savedEmployee.getEmail() != null) {
            try {
                String branchTitle = branch != null ? branch.getName() : "Main Store Terminal";
                String emailBody = emailTemplateService.buildStaffInviteEmail(
                        savedEmployee.getFullName(),
                        savedEmployee.getRole().name(),
                        store.getBrand(),
                        branchTitle,
                        savedEmployee.getEmail(),
                        rawPassword,
                        "http://localhost:5173/auth/login"
                );
                emailService.sendEmail(savedEmployee.getEmail(), "You're Invited to Join " + store.getBrand() + " on NexPOS", emailBody);
            } catch (Exception emailEx) {
                // Fail-safe: do not roll back staff creation if email delivery encounters network error
            }
        }

        return UserMapper.toDTO(savedEmployee);
    }

    @Override
    @Transactional
    public UserDTO createBranchEmployee(User employee, Long branchId) throws Exception {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with ID: " + branchId));

        if (!BRANCH_LEVEL_ROLES.contains(employee.getRole())) {
            throw new UserException("Invalid role for branch employee. Must be ROLE_BRANCH_ADMIN, ROLE_BRANCH_MANAGER, or ROLE_BRANCH_CASHIER");
        }

        // Verify caller permissions
        User caller = userService.getCurrentUser();
        if (caller.getRole() == UserRole.ROLE_BRANCH_MANAGER) {
            if (caller.getBranch() == null || !caller.getBranch().getId().equals(branchId)) {
                throw new AccessDeniedException("Branch Manager can only create employees for their own branch.");
            }
            if (employee.getRole() != UserRole.ROLE_BRANCH_CASHIER) {
                throw new AccessDeniedException("Branch Manager can only create Cashier accounts.");
            }
        } else if (caller.getRole() == UserRole.ROLE_BRANCH_ADMIN) {
            if (caller.getBranch() == null || !caller.getBranch().getId().equals(branchId)) {
                throw new AccessDeniedException("Branch Admin can only create employees for their own branch.");
            }
            if (employee.getRole() == UserRole.ROLE_STORE_ADMIN || employee.getRole() == UserRole.ROLE_STORE_MANAGER) {
                throw new AccessDeniedException("Branch Admin cannot create Store-level accounts.");
            }
        }

        // Verify the branch belongs to the authenticated user's store
        resolveAndVerifyStore(branch.getStore().getId());

        enforceUserLimit(branch.getStore());

        // 🔹 Duplicate validation — email
        User existingByEmail = userRepository.findByEmail(employee.getEmail());
        if (existingByEmail != null) {
            throw new UserException("An employee with this email already exists: " + employee.getEmail());
        }

        // 🔹 Duplicate validation — phone
        if (employee.getPhone() != null && !employee.getPhone().trim().isEmpty()) {
            User existingByPhone = userRepository.findByPhone(employee.getPhone());
            if (existingByPhone != null) {
                throw new UserException("An employee with this phone number already exists: " + employee.getPhone());
            }
        }

        String rawBranchPassword = employee.getPassword();
        employee.setPassword(passwordEncoder.encode(employee.getPassword()));
        employee.setPasswordChangedAt(LocalDateTime.now());
        employee.setEnabled(true);
        employee.setBranch(branch);
        employee.setStore(branch.getStore());

        User savedEmployee = userRepository.save(employee);

        // 🔔 Publish EmployeeAddedEvent
        eventPublisher.publishEvent(com.aniket.event.EmployeeAddedEvent.builder()
                .employeeId(savedEmployee.getId())
                .employeeName(savedEmployee.getFullName())
                .employeeEmail(savedEmployee.getEmail())
                .role(savedEmployee.getRole())
                .branchId(branch.getId())
                .branchName(branch.getName())
                .createdAt(savedEmployee.getCreatedAt() != null ? savedEmployee.getCreatedAt() : java.time.LocalDateTime.now())
                .build());

        // Send themed Staff Invitation Email
        if (savedEmployee.getEmail() != null) {
            try {
                String emailBody = emailTemplateService.buildStaffInviteEmail(
                        savedEmployee.getFullName(),
                        savedEmployee.getRole().name(),
                        branch.getStore().getBrand(),
                        branch.getName(),
                        savedEmployee.getEmail(),
                        rawBranchPassword,
                        "http://localhost:5173/auth/login"
                );
                emailService.sendEmail(savedEmployee.getEmail(), "You're Invited to Join " + branch.getStore().getBrand() + " on NexPOS", emailBody);
            } catch (Exception emailEx) {
                // Fail-safe
            }
        }

        return UserMapper.toDTO(savedEmployee);
    }

    private void enforceUserLimit(Store store) throws PlanLimitExceededException {
        if (store == null) return;
        var storeSub = storeSubscriptionService.getOrCreateForStore(store);
        var plan = storeSub.getCurrentPlan();
        if (plan == null || plan.getMaxUsers() == null || plan.getMaxUsers() <= 0) return;

        int current = userRepository.findAllEmployeesByStoreId(store.getId()).size();
        if (current >= plan.getMaxUsers()) {
            throw new PlanLimitExceededException(
                "Your plan allows a maximum of " + plan.getMaxUsers() + " users.");
        }
    }

    @Override
    @Transactional
    public UserDTO updateEmployee(Long employeeId, UserDTO employeeDetails) throws Exception {
        User existingEmployee = findEmployeeByIdEntity(employeeId);
        verifyManagementPermission(existingEmployee);

        if (employeeDetails.getFullName() != null) {
            existingEmployee.setFullName(employeeDetails.getFullName());
        }
        if (employeeDetails.getEmail() != null) {
            // Check email duplication if changed
            if (!employeeDetails.getEmail().equalsIgnoreCase(existingEmployee.getEmail())) {
                User dup = userRepository.findByEmail(employeeDetails.getEmail());
                if (dup != null && !dup.getId().equals(existingEmployee.getId())) {
                    throw new UserException("An employee with this email already exists: " + employeeDetails.getEmail());
                }
            }
            existingEmployee.setEmail(employeeDetails.getEmail());
        }
        if (employeeDetails.getPhone() != null) {
            if (!employeeDetails.getPhone().equals(existingEmployee.getPhone())) {
                User dup = userRepository.findByPhone(employeeDetails.getPhone());
                if (dup != null && !dup.getId().equals(existingEmployee.getId())) {
                    throw new UserException("An employee with this phone number already exists: " + employeeDetails.getPhone());
                }
            }
            existingEmployee.setPhone(employeeDetails.getPhone());

            // If updating Store Admin, sync phone to store's contact information
            if (existingEmployee.getRole() == UserRole.ROLE_STORE_ADMIN) {
                Store ownedStore = storeRepository.findByStoreAdminId(existingEmployee.getId());
                if (ownedStore != null) {
                    if (ownedStore.getContact() == null) {
                        ownedStore.setContact(new com.aniket.modal.StoreContact());
                    }
                    ownedStore.getContact().setPhone(employeeDetails.getPhone());
                    storeRepository.save(ownedStore);
                }
            }
        }

        // 🔒 Update Password if provided
        if (employeeDetails.getPassword() != null && !employeeDetails.getPassword().trim().isEmpty()) {
            String rawPassword = employeeDetails.getPassword().trim();
            if (rawPassword.length() < 6) {
                throw new UserException("Password must be at least 6 characters long.");
            }
            existingEmployee.setPassword(passwordEncoder.encode(rawPassword));
            existingEmployee.setPasswordChangedAt(LocalDateTime.now());
        }

        // 🔒 Validate Role Changes (Bug #1 Prevention)
        if (employeeDetails.getRole() != null && employeeDetails.getRole() != existingEmployee.getRole()) {
            User caller = userService.getCurrentUser();
            if (caller.getRole() == UserRole.ROLE_BRANCH_MANAGER) {
                if (employeeDetails.getRole() != UserRole.ROLE_BRANCH_CASHIER) {
                    throw new AccessDeniedException("Branch Manager can only manage Cashier accounts and cannot assign other roles.");
                }
            } else if (caller.getRole() == UserRole.ROLE_BRANCH_ADMIN) {
                if (employeeDetails.getRole() == UserRole.ROLE_STORE_ADMIN ||
                    employeeDetails.getRole() == UserRole.ROLE_STORE_MANAGER ||
                    employeeDetails.getRole() == UserRole.ROLE_ADMIN) {
                    throw new AccessDeniedException("Branch Admin cannot assign Store or Super Admin roles.");
                }
            } else if (caller.getRole() == UserRole.ROLE_STORE_MANAGER) {
                if (employeeDetails.getRole() == UserRole.ROLE_STORE_ADMIN ||
                    employeeDetails.getRole() == UserRole.ROLE_STORE_MANAGER ||
                    employeeDetails.getRole() == UserRole.ROLE_ADMIN) {
                    throw new AccessDeniedException("Store Manager can only assign Branch Manager, Branch Admin, or Cashier roles.");
                }
            }
            existingEmployee.setRole(employeeDetails.getRole());
        }

        // 🔹 Handle branch reassignment based on the updated role (Bug #2 Prevention)
        UserRole targetRole = existingEmployee.getRole();
        if (BRANCH_LEVEL_ROLES.contains(targetRole)) {
            Long targetBranchId = employeeDetails.getBranchId() != null 
                    ? employeeDetails.getBranchId() 
                    : (existingEmployee.getBranch() != null ? existingEmployee.getBranch().getId() : null);

            if (targetBranchId == null) {
                throw new IllegalArgumentException("Branch ID is required for branch-level role: " + targetRole);
            }

            User caller = userService.getCurrentUser();
            // 🔒 Verify Caller Branch Boundary
            if (caller.getRole() == UserRole.ROLE_BRANCH_ADMIN || caller.getRole() == UserRole.ROLE_BRANCH_MANAGER) {
                if (caller.getBranch() == null || !caller.getBranch().getId().equals(targetBranchId)) {
                    throw new AccessDeniedException("Branch managers and admins cannot reassign employees to a different branch.");
                }
            }

            Branch branch = branchRepository.findById(targetBranchId)
                    .orElseThrow(() -> new EntityNotFoundException("Branch not found with ID: " + targetBranchId));

            // Verify store boundary for store admins/managers
            if (caller.getRole() != UserRole.ROLE_ADMIN && caller.getStore() != null) {
                if (branch.getStore() == null || !branch.getStore().getId().equals(caller.getStore().getId())) {
                    throw new AccessDeniedException("Cannot assign employee to a branch belonging to another store.");
                }
            }

            existingEmployee.setBranch(branch);

            if (targetRole == UserRole.ROLE_BRANCH_MANAGER) {
                branch.setManager(existingEmployee);
                branchRepository.save(branch);
            }
        } else if (STORE_LEVEL_ROLES.contains(targetRole)) {
            existingEmployee.setBranch(null);
        }

        User updated = userRepository.save(existingEmployee);
        return UserMapper.toDTO(updated);
    }

    @Override
    @Transactional
    public void deleteEmployee(Long employeeId) throws Exception {
        User employee = findEmployeeByIdEntity(employeeId);
        verifyManagementPermission(employee);
        userRepository.delete(employee);
    }

    @Override
    @Transactional
    public UserDTO toggleEmployeeAccess(Long employeeId) throws Exception {
        User employee = findEmployeeByIdEntity(employeeId);
        verifyManagementPermission(employee);

        boolean currentStatus = employee.getEnabled() == null || employee.getEnabled();
        employee.setEnabled(!currentStatus);
        User updated = userRepository.save(employee);
        return UserMapper.toDTO(updated);
    }

    @Override
    @Transactional
    public UserDTO resetEmployeePassword(Long employeeId, String newPassword) throws Exception {
        if (newPassword == null || newPassword.trim().length() < 8) {
            throw new UserException("Password must be at least 8 characters long.");
        }
        User employee = findEmployeeByIdEntity(employeeId);
        verifyManagementPermission(employee);

        employee.setPassword(passwordEncoder.encode(newPassword));
        employee.setPasswordChangedAt(LocalDateTime.now());
        User updated = userRepository.save(employee);
        return UserMapper.toDTO(updated);
    }

    @Override
    public EmployeePerformanceDTO getEmployeePerformance(Long employeeId) throws Exception {
        User employee = findEmployeeByIdEntity(employeeId);
        verifyManagementPermission(employee);

        Long branchId = employee.getBranch() != null ? employee.getBranch().getId() : null;
        String branchName = employee.getBranch() != null ? employee.getBranch().getName() : null;

        Long totalOrders = 0L;
        Double totalSales = 0.0;
        Double avgOrderValue = 0.0;
        Long totalShifts = 0L;
        String currentShiftStatus = "NONE";

        if (employee.getRole() == UserRole.ROLE_BRANCH_CASHIER) {
            totalOrders = orderRepository.countByCashierId(employee.getId());
            Double sum = orderRepository.sumTotalAmountByCashierId(employee.getId());
            totalSales = sum != null ? Math.round(sum * 100.0) / 100.0 : 0.0;
            if (totalOrders != null && totalOrders > 0) {
                avgOrderValue = Math.round((totalSales / totalOrders) * 100.0) / 100.0;
            }
            totalShifts = (long) shiftReportRepository.findByCashier(employee).size();
            var openShift = shiftReportRepository.findTopByCashierAndShiftEndIsNullOrderByShiftStartDesc(employee);
            if (openShift.isPresent()) {
                currentShiftStatus = "ACTIVE";
            } else if (totalShifts > 0) {
                currentShiftStatus = "CLOSED";
            }
        }

        return EmployeePerformanceDTO.builder()
                .employeeId(employee.getId())
                .fullName(employee.getFullName())
                .email(employee.getEmail())
                .phone(employee.getPhone())
                .role(employee.getRole())
                .branchId(branchId)
                .branchName(branchName)
                .enabled(employee.getEnabled() != null ? employee.getEnabled() : true)
                .totalOrders(totalOrders != null ? totalOrders : 0L)
                .totalSales(totalSales)
                .avgOrderValue(avgOrderValue)
                .totalShifts(totalShifts)
                .currentShiftStatus(currentShiftStatus)
                .assignedSince(employee.getCreatedAt())
                .lastLogin(employee.getLastLogin())
                .lastActivity(employee.getLastActivity())
                .build();
    }

    @Override
    public UserDTO findEmployeeById(Long employeeId) throws Exception {
        User employee = findEmployeeByIdEntity(employeeId);
        User currentUser = userService.getCurrentUser();
        if (currentUser.getRole() != UserRole.ROLE_ADMIN && !currentUser.getId().equals(employeeId)) {
            verifyManagementPermission(employee);
        }
        return UserMapper.toDTO(employee);
    }

    // Internal helper that returns the raw entity (not serialized)
    private User findEmployeeByIdEntity(Long employeeId) throws Exception {
        Optional<User> opt = userRepository.findById(employeeId);
        if (opt.isPresent()) {
            return opt.get();
        }
        throw new ResourceNotFoundException("Employee not found with ID: " + employeeId);
    }

    @Override
    public List<UserDTO> findStoreEmployees(Long storeId, UserRole role) throws Exception {
        Store store = resolveAndVerifyStore(storeId);

        List<User> employees = userRepository.findAllEmployeesByStoreId(storeId);

        if (role != null) {
            employees = employees.stream()
                    .filter(user -> user.getRole() == role)
                    .collect(Collectors.toList());
        }

        List<UserDTO> dtoList = UserMapper.toDTOList(employees);
        if (store != null && store.getContact() != null && store.getContact().getPhone() != null && !store.getContact().getPhone().trim().isEmpty()) {
            String storePhone = store.getContact().getPhone();
            for (UserDTO empDto : dtoList) {
                if (empDto.getRole() == UserRole.ROLE_STORE_ADMIN && (empDto.getPhone() == null || empDto.getPhone().trim().isEmpty())) {
                    empDto.setPhone(storePhone);
                }
            }
        }
        return dtoList;
    }

    @Override
    public List<UserDTO> findBranchEmployees(Long branchId, UserRole role) throws Exception {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with ID: " + branchId));

        User caller = userService.getCurrentUser();
        if (caller.getRole() == UserRole.ROLE_BRANCH_ADMIN || caller.getRole() == UserRole.ROLE_BRANCH_MANAGER) {
            if (caller.getBranch() == null || !caller.getBranch().getId().equals(branchId)) {
                throw new AccessDeniedException("You are not authorized to view employees from another branch.");
            }
        }

        // Verify the branch belongs to the authenticated user's store
        if (branch.getStore() == null) {
            throw new AccessDeniedException("You are not authorized to access this branch's employees.");
        }
        resolveAndVerifyStore(branch.getStore().getId());

        List<User> employees = userRepository.findByBranchId(branch.getId()).stream()
                .filter(user -> role == null || user.getRole() == role)
                .collect(Collectors.toList());

        return UserMapper.toDTOList(employees);
    }

    private void verifyManagementPermission(User targetEmployee) throws Exception {
        User caller = userService.getCurrentUser();

        // Super Admin bypass
        if (caller.getRole() == UserRole.ROLE_ADMIN) {
            return;
        }

        // Store boundary check
        Store callerStore = caller.getStore();
        Store targetStore = targetEmployee.getStore();
        if (callerStore == null || targetStore == null || !callerStore.getId().equals(targetStore.getId())) {
            throw new AccessDeniedException("You are not authorized to manage employees from another store.");
        }

        // Role hierarchy & branch boundary checks
        switch (caller.getRole()) {
            case ROLE_STORE_ADMIN:
                if (targetEmployee.getRole() == UserRole.ROLE_ADMIN) {
                    throw new AccessDeniedException("Store Admin cannot manage Super Admin accounts.");
                }
                break;

            case ROLE_STORE_MANAGER:
                if (targetEmployee.getRole() == UserRole.ROLE_ADMIN || targetEmployee.getRole() == UserRole.ROLE_STORE_ADMIN) {
                    throw new AccessDeniedException("Store Manager cannot manage Store Admin or Super Admin accounts.");
                }
                break;

            case ROLE_BRANCH_ADMIN:
                if (caller.getBranch() == null) {
                    throw new AccessDeniedException("Branch Admin account is not linked to a branch.");
                }
                if (targetEmployee.getBranch() == null || !caller.getBranch().getId().equals(targetEmployee.getBranch().getId())) {
                    throw new AccessDeniedException("Branch Admin can only manage employees within their own branch.");
                }
                if (targetEmployee.getRole() == UserRole.ROLE_ADMIN ||
                    targetEmployee.getRole() == UserRole.ROLE_STORE_ADMIN ||
                    targetEmployee.getRole() == UserRole.ROLE_STORE_MANAGER) {
                    throw new AccessDeniedException("Branch Admin cannot manage Store or Super Admin accounts.");
                }
                break;

            case ROLE_BRANCH_MANAGER:
                if (caller.getBranch() == null) {
                    throw new AccessDeniedException("Branch Manager account is not linked to a branch.");
                }
                if (targetEmployee.getBranch() == null || !caller.getBranch().getId().equals(targetEmployee.getBranch().getId())) {
                    throw new AccessDeniedException("Branch Manager can only manage employees within their own branch.");
                }
                if (targetEmployee.getRole() != UserRole.ROLE_BRANCH_CASHIER) {
                    throw new AccessDeniedException("Branch Manager can only manage Cashier accounts.");
                }
                break;

            default:
                throw new AccessDeniedException("You do not have permission to manage employees.");
        }
    }

    private Store resolveAndVerifyStore(Long requestedStoreId) throws UserException, ResourceNotFoundException {
        User currentUser = userService.getCurrentUser();

        // Super Admin bypass — allow access to any store
        if (currentUser.getRole() == UserRole.ROLE_ADMIN) {
            if (requestedStoreId != null) {
                return storeRepository.findById(requestedStoreId)
                        .orElseThrow(() -> new ResourceNotFoundException("Store not found with ID: " + requestedStoreId));
            }
            return null;
        }

        Store userStore = currentUser.getStore();
        if (userStore == null) {
            throw new AccessDeniedException("No store is linked to this account.");
        }
        if (requestedStoreId != null && !requestedStoreId.equals(userStore.getId())) {
            throw new AccessDeniedException("You are not authorized to manage employees for this store.");
        }
        return userStore;
    }
}
