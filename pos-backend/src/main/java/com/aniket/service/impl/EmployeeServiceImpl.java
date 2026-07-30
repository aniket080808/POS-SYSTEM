package com.aniket.service.impl;

import com.aniket.domain.UserRole;
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
import com.aniket.service.EmployeeService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with ID: " + storeId));

        Branch branch = null;

        // 🔹 Branch assignment for ALL branch-level roles (not just Branch Manager)
        if (BRANCH_LEVEL_ROLES.contains(dto.getRole())) {
            if (dto.getBranchId() == null) {
                throw new IllegalArgumentException("Branch ID is required for branch-level role: " + dto.getRole());
            }

            branch = branchRepository.findById(dto.getBranchId())
                    .orElseThrow(() -> new EntityNotFoundException("Branch not found with ID: " + dto.getBranchId()));
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

        User employee = UserMapper.toEntity(dto);
        employee.setStore(store);
        // Set branch for branch-level roles; explicitly clear for store-level roles
        employee.setBranch(branch);

        employee.setPassword(passwordEncoder.encode(employee.getPassword()));

        User savedEmployee = userRepository.save(employee);

        // Assign manager to the branch if applicable
        if (dto.getRole() == UserRole.ROLE_BRANCH_MANAGER && branch != null) {
            branch.setManager(savedEmployee);
            branchRepository.save(branch);
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

        employee.setPassword(passwordEncoder.encode(employee.getPassword()));
        employee.setBranch(branch);

        User savedEmployee = userRepository.save(employee);

        return UserMapper.toDTO(savedEmployee);
    }

    @Override
    @Transactional
    public UserDTO updateEmployee(Long employeeId, UserDTO employeeDetails) throws Exception {
        User existingEmployee = findEmployeeByIdEntity(employeeId);

        if (employeeDetails.getFullName() != null) {
            existingEmployee.setFullName(employeeDetails.getFullName());
        }
        if (employeeDetails.getEmail() != null) {
            existingEmployee.setEmail(employeeDetails.getEmail());
        }
        if (employeeDetails.getPhone() != null) {
            existingEmployee.setPhone(employeeDetails.getPhone());
        }
        if (employeeDetails.getRole() != null) {
            existingEmployee.setRole(employeeDetails.getRole());
        }

        // 🔹 Handle branch reassignment based on the updated role
        if (employeeDetails.getRole() != null) {
            if (BRANCH_LEVEL_ROLES.contains(employeeDetails.getRole())) {
                // Branch-level role — a branchId must be provided
                if (employeeDetails.getBranchId() == null) {
                    throw new IllegalArgumentException("Branch ID is required for branch-level role: " + employeeDetails.getRole());
                }
                Branch branch = branchRepository.findById(employeeDetails.getBranchId())
                        .orElseThrow(() -> new EntityNotFoundException("Branch not found with ID: " + employeeDetails.getBranchId()));
                existingEmployee.setBranch(branch);

                // If promoted to Branch Manager, assign them as the branch manager
                if (employeeDetails.getRole() == UserRole.ROLE_BRANCH_MANAGER) {
                    branch.setManager(existingEmployee);
                    branchRepository.save(branch);
                }
            } else if (STORE_LEVEL_ROLES.contains(employeeDetails.getRole())) {
                // Store-level role — clear any existing branch assignment
                existingEmployee.setBranch(null);
            }
        }

        // Password should be updated via a separate method for security reasons

        User updated = userRepository.save(existingEmployee);
        return UserMapper.toDTO(updated);
    }

    @Override
    public void deleteEmployee(Long employeeId) throws Exception {
        User employee = findEmployeeByIdEntity(employeeId);
        userRepository.delete(employee);
    }

    @Override
    public UserDTO findEmployeeById(Long employeeId) throws Exception {
        Optional<User> opt = userRepository.findById(employeeId);
        if (opt.isPresent()) {
            return UserMapper.toDTO(opt.get());
        }
        throw new ResourceNotFoundException("Employee not found with ID: " + employeeId);
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
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with ID: " + storeId));

        // 🔹 Use the new query that fetches BOTH store-level (u.store) AND branch-level (u.branch.store) employees
        List<User> employees = userRepository.findAllEmployeesByStoreId(storeId);

        // Filter by role if a specific role was requested
        if (role != null) {
            employees = employees.stream()
                    .filter(user -> user.getRole() == role)
                    .collect(Collectors.toList());
        }

        return UserMapper.toDTOList(employees);
    }

    @Override
    public List<UserDTO> findBranchEmployees(Long branchId, UserRole role) throws Exception {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with ID: " + branchId));
        List<User> employees = userRepository.findByBranchId(branch.getId()).stream()
                .filter(user -> role == null || user.getRole() == role)
                .collect(Collectors.toList());

        return UserMapper.toDTOList(employees);
    }
}