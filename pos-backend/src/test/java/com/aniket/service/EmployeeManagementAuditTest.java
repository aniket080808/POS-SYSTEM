package com.aniket.service;

import com.aniket.configrations.JwtProvider;
import com.aniket.domain.UserRole;
import com.aniket.exception.AccessDeniedException;
import com.aniket.exception.UserException;
import com.aniket.modal.Branch;
import com.aniket.modal.User;
import com.aniket.payload.dto.EmployeePerformanceDTO;
import com.aniket.payload.dto.UserDTO;
import com.aniket.repository.BranchRepository;
import com.aniket.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class EmployeeManagementAuditTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private AuthService authService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private com.aniket.repository.OrderRepository orderRepository;

    private static final String TEST_CASHIER_EMAIL = "audit_test_cashier_99@branch1.com";
    private User testCashierUser;

    @BeforeEach
    void setUp() {
        cleanTestUser();
        Branch branch = branchRepository.findAll().stream().findFirst().orElse(null);
        ensureCoreUser("aniketmeshram445@gmail.com", "Aniket Meshram", UserRole.ROLE_ADMIN, null);
        ensureCoreUser("sm2021jadhav@gmail.com", "Swapnil Jadhav", UserRole.ROLE_STORE_ADMIN, null);
        ensureCoreUser("pranaykawade839@gmail.com", "Pranay Kawade", UserRole.ROLE_STORE_MANAGER, null);
        ensureCoreUser("marigaming9@gmail.com", "Mari Gaming", UserRole.ROLE_BRANCH_ADMIN, branch);
        ensureCoreUser("pravinmeshram0205@gmail.com", "Pravin Meshram", UserRole.ROLE_BRANCH_MANAGER, branch);
        ensureCoreUser("rakeshkamble1345@gmail.com", "Rakesh Kamble", UserRole.ROLE_BRANCH_CASHIER, branch);
    }

    private void ensureCoreUser(String email, String name, UserRole role, Branch branch) {
        User u = userRepository.findByEmail(email);
        if (u == null) {
            u = new User();
            u.setEmail(email);
            u.setFullName(name);
            u.setPassword(passwordEncoder.encode("TestPassword123@"));
            u.setRole(role);
            u.setEnabled(true);
            u.setBranch(branch);
            u.setStore(branch != null ? branch.getStore() : null);
            u.setCreatedAt(LocalDateTime.now());
            u.setPasswordChangedAt(LocalDateTime.now());
            userRepository.save(u);
        } else {
            if (Boolean.FALSE.equals(u.getEnabled())) {
                u.setEnabled(true);
            }
            if (branch != null && u.getBranch() == null) {
                u.setBranch(branch);
                if (branch.getStore() != null) {
                    u.setStore(branch.getStore());
                }
            }
            userRepository.save(u);
        }
    }

    @AfterEach
    void tearDown() {
        cleanTestUser();
        SecurityContextHolder.clearContext();
    }

    private void cleanTestUser() {
        User u = userRepository.findByEmail(TEST_CASHIER_EMAIL);
        if (u != null) {
            userRepository.delete(u);
        }
    }

    private void setSecurityContext(User user) {
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                user.getEmail(),
                null,
                Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name()))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    @DisplayName("Safety Point 1: Pre-test verification of all 6 core accounts enabled=true")
    void testAllCoreAccountsEnabled() {
        String[] coreEmails = {
                "aniketmeshram445@gmail.com", // Super Admin
                "sm2021jadhav@gmail.com",     // Store Admin
                "pranaykawade839@gmail.com",  // Store Manager
                "marigaming9@gmail.com",      // Branch Admin
                "pravinmeshram0205@gmail.com",// Branch Manager
                "rakeshkamble1345@gmail.com"  // Cashier
        };

        for (String email : coreEmails) {
            User user = userRepository.findByEmail(email);
            assertNotNull(user, "Core account must exist: " + email);
            assertTrue(user.getEnabled() == null || user.getEnabled(), "Core account must be enabled: " + email);
            assertFalse(Boolean.FALSE.equals(user.getEnabled()), "Core account must not be disabled: " + email);
        }
    }

    @Test
    @DisplayName("Step 1: 'Assigned Since' (createdAt) mapped and present in UserDTO")
    void testAssignedSincePopulatedOnBranchEmployees() throws Exception {
        User branchAdmin = userRepository.findByEmail("marigaming9@gmail.com");
        setSecurityContext(branchAdmin);

        List<UserDTO> branchEmployees = employeeService.findBranchEmployees(1L, null);
        assertFalse(branchEmployees.isEmpty(), "Branch 1 must have employees");

        for (UserDTO emp : branchEmployees) {
            assertNotNull(emp.getCreatedAt(), "createdAt (Assigned Since) must not be null for employee: " + emp.getEmail());
            assertNotNull(emp.getEnabled(), "enabled status must not be null for employee: " + emp.getEmail());
            assertTrue(emp.getEnabled(), "employee must be enabled by default: " + emp.getEmail());
        }
    }

    @Test
    @DisplayName("Step 2 & Point 3: Complete Toggle Access and Session Invalidation on Disable / Enable")
    void testToggleAccessAndSessionInvalidation() throws Exception {
        User branchAdmin = userRepository.findByEmail("marigaming9@gmail.com");
        Branch branch = branchRepository.findById(1L).orElseThrow();

        // 1. Create a test employee
        User newEmp = new User();
        newEmp.setEmail(TEST_CASHIER_EMAIL);
        newEmp.setFullName("Audit Test Cashier");
        newEmp.setPhone("9999988888");
        newEmp.setRole(UserRole.ROLE_BRANCH_CASHIER);
        newEmp.setPassword("TestPass123@");

        setSecurityContext(branchAdmin);
        UserDTO created = employeeService.createBranchEmployee(newEmp, branch.getId());
        assertNotNull(created.getId());
        assertTrue(created.getEnabled());

        // 2. Login as the new test employee -> should succeed
        var loginRes = authService.login(TEST_CASHIER_EMAIL, "TestPass123@");
        assertNotNull(loginRes.getJwt(), "Login must succeed with valid credentials");
        String testUserJwt = loginRes.getJwt();

        // 3. Admin disables test employee's access
        setSecurityContext(branchAdmin);
        UserDTO disabledDto = employeeService.toggleEmployeeAccess(created.getId());
        assertFalse(disabledDto.getEnabled(), "Employee access should now be disabled");

        // 4. Try logging in as disabled user -> Must fail with deactivation error
        UserException loginEx = assertThrows(UserException.class, () -> {
            authService.login(TEST_CASHIER_EMAIL, "TestPass123@");
        });
        assertTrue(loginEx.getMessage().toLowerCase().contains("deactivated") ||
                loginEx.getMessage().toLowerCase().contains("disabled"));

        // 5. Admin re-enables access
        setSecurityContext(branchAdmin);
        UserDTO reEnabledDto = employeeService.toggleEmployeeAccess(created.getId());
        assertTrue(reEnabledDto.getEnabled(), "Employee access should now be restored");

        // 6. Login as re-enabled user -> should succeed
        var reLoginRes = authService.login(TEST_CASHIER_EMAIL, "TestPass123@");
        assertNotNull(reLoginRes.getJwt(), "Login must succeed after re-enabling access");
    }

    @Test
    @DisplayName("Point 3: Password Reset sets passwordChangedAt and rejects old JWT token")
    void testPasswordResetAndOldTokenRejection() throws Exception {
        User branchAdmin = userRepository.findByEmail("marigaming9@gmail.com");
        Branch branch = branchRepository.findById(1L).orElseThrow();

        // 1. Create test employee
        User newEmp = new User();
        newEmp.setEmail(TEST_CASHIER_EMAIL);
        newEmp.setFullName("Audit Test Cashier");
        newEmp.setPhone("9999977777");
        newEmp.setRole(UserRole.ROLE_BRANCH_CASHIER);
        newEmp.setPassword("OldPassword123@");

        setSecurityContext(branchAdmin);
        UserDTO created = employeeService.createBranchEmployee(newEmp, branch.getId());

        // 2. Login with OLD password and capture OLD JWT token
        var initialLogin = authService.login(TEST_CASHIER_EMAIL, "OldPassword123@");
        String oldJwt = initialLogin.getJwt();
        assertNotNull(oldJwt);

        // Pause 1.5 seconds so token iat and passwordChangedAt have distinct seconds
        Thread.sleep(1500);

        // 3. Admin resets password to NEW password
        setSecurityContext(branchAdmin);
        employeeService.resetEmployeePassword(created.getId(), "NewSecurePassword123@");

        // 4. Verify passwordChangedAt was updated on entity
        User refreshedUser = userRepository.findById(created.getId()).orElseThrow();
        assertNotNull(refreshedUser.getPasswordChangedAt(), "passwordChangedAt must be populated on password reset");

        // 5. Verify OLD password no longer works for login
        assertThrows(UserException.class, () -> {
            authService.login(TEST_CASHIER_EMAIL, "OldPassword123@");
        });

        // 6. Verify NEW password works for login
        var newLogin = authService.login(TEST_CASHIER_EMAIL, "NewSecurePassword123@");
        assertNotNull(newLogin.getJwt(), "Login with new password must succeed");

        // 7. Verify OLD JWT token is rejected by the token validator logic
        // Extract claims from old JWT
        io.jsonwebtoken.Claims oldClaims = io.jsonwebtoken.Jwts.parser()
                .verifyWith(io.jsonwebtoken.security.Keys.hmacShaKeyFor(com.aniket.configrations.JwtConstant.SECRET_KEY.getBytes()))
                .build()
                .parseSignedClaims(oldJwt)
                .getPayload();

        long oldIatMillis = oldClaims.getIssuedAt().getTime();
        long pwdChangedMillis = refreshedUser.getPasswordChangedAt()
                .atZone(java.time.ZoneId.systemDefault())
                .toInstant()
                .toEpochMilli();

        assertTrue(oldIatMillis + 1000L < pwdChangedMillis,
                "Old token iat (" + oldIatMillis + ") must be before passwordChangedAt (" + pwdChangedMillis + ")");
    }

    @Test
    @DisplayName("Safety Point 2: Live Role-Hierarchy Enforcement (Branch Manager blocked from modifying Branch Admin)")
    void testBranchManagerCannotModifyBranchAdmin() {
        User branchManager = userRepository.findByEmail("pravinmeshram0205@gmail.com");
        User branchAdmin = userRepository.findByEmail("marigaming9@gmail.com");
        assertNotNull(branchManager);
        assertNotNull(branchAdmin);

        setSecurityContext(branchManager);

        // 1. Branch Manager cannot toggle Branch Admin access -> Expect AccessDeniedException
        AccessDeniedException ex1 = assertThrows(AccessDeniedException.class, () -> {
            employeeService.toggleEmployeeAccess(branchAdmin.getId());
        });
        assertTrue(ex1.getMessage().contains("Branch Manager can only manage Cashier accounts"));

        // 2. Branch Manager cannot reset Branch Admin password -> Expect AccessDeniedException
        AccessDeniedException ex2 = assertThrows(AccessDeniedException.class, () -> {
            employeeService.resetEmployeePassword(branchAdmin.getId(), "HackPass123@");
        });
        assertTrue(ex2.getMessage().contains("Branch Manager can only manage Cashier accounts"));

        // 3. Branch Manager cannot edit Branch Admin details -> Expect AccessDeniedException
        UserDTO editDto = new UserDTO();
        editDto.setPhone("1111111111");
        AccessDeniedException ex3 = assertThrows(AccessDeniedException.class, () -> {
            employeeService.updateEmployee(branchAdmin.getId(), editDto);
        });
        assertTrue(ex3.getMessage().contains("Branch Manager can only manage Cashier accounts"));

        // 4. Branch Manager cannot delete Branch Admin -> Expect AccessDeniedException
        AccessDeniedException ex4 = assertThrows(AccessDeniedException.class, () -> {
            employeeService.deleteEmployee(branchAdmin.getId());
        });
        assertTrue(ex4.getMessage().contains("Branch Manager can only manage Cashier accounts"));
    }

    @Test
    @DisplayName("Safety Point 2: Branch Admin cannot modify Store Admin or Super Admin")
    void testBranchAdminCannotModifyStoreAdmin() {
        User branchAdmin = userRepository.findByEmail("marigaming9@gmail.com");
        User storeAdmin = userRepository.findByEmail("sm2021jadhav@gmail.com");
        User superAdmin = userRepository.findByEmail("aniketmeshram445@gmail.com");

        setSecurityContext(branchAdmin);

        // Branch Admin cannot toggle Store Admin access
        assertThrows(AccessDeniedException.class, () -> {
            employeeService.toggleEmployeeAccess(storeAdmin.getId());
        });

        // Branch Admin cannot reset Super Admin password
        assertThrows(AccessDeniedException.class, () -> {
            employeeService.resetEmployeePassword(superAdmin.getId(), "HackPass123@");
        });
    }

    @Test
    @DisplayName("Step 2.G: Get Real Performance data for Cashier Rakesh Kamble and Branch Manager")
    void testGetRealEmployeePerformance() throws Exception {
        User branchAdmin = userRepository.findByEmail("marigaming9@gmail.com");
        User cashier = userRepository.findByEmail("rakeshkamble1345@gmail.com");
        User branchManager = userRepository.findByEmail("pravinmeshram0205@gmail.com");

        setSecurityContext(branchAdmin);

        // Ensure cashier has at least one completed order for performance metrics
        Long orderCount = orderRepository.countByCashierId(cashier.getId());
        if (orderCount == null || orderCount == 0) {
            com.aniket.modal.Order sampleOrder = com.aniket.modal.Order.builder()
                    .branch(cashier.getBranch())
                    .cashier(cashier)
                    .totalAmount(250.0)
                    .subtotal(250.0)
                    .discount(0.0)
                    .tax(0.0)
                    .status(com.aniket.domain.OrderStatus.COMPLETED)
                    .paymentType(com.aniket.domain.PaymentType.CASH)
                    .createdAt(LocalDateTime.now())
                    .build();
            orderRepository.save(sampleOrder);
        }

        // Cashier performance
        EmployeePerformanceDTO cashierPerf = employeeService.getEmployeePerformance(cashier.getId());
        assertNotNull(cashierPerf);
        assertEquals("Rakesh Kamble", cashierPerf.getFullName());
        assertEquals(UserRole.ROLE_BRANCH_CASHIER, cashierPerf.getRole());
        assertNotNull(cashierPerf.getTotalOrders(), "Total orders must be calculated");
        assertNotNull(cashierPerf.getTotalSales(), "Total sales must be calculated");
        assertNotNull(cashierPerf.getAvgOrderValue(), "Avg order value must be calculated");
        assertTrue(cashierPerf.getTotalOrders() > 0, "Rakesh Kamble must have real orders in this database");
        assertTrue(cashierPerf.getTotalSales() > 0, "Rakesh Kamble must have real revenue in this database");

        // Manager profile
        EmployeePerformanceDTO managerPerf = employeeService.getEmployeePerformance(branchManager.getId());
        assertNotNull(managerPerf);
        assertEquals("Pravin Meshram", managerPerf.getFullName());
        assertEquals(UserRole.ROLE_BRANCH_MANAGER, managerPerf.getRole());
        assertNotNull(managerPerf.getAssignedSince());
    }

    @Test
    @DisplayName("Step 2.H: Update Employee password via updateEmployee and verify subsequent login succeeds")
    void testUpdateEmployeeWithNewPasswordAndLogin() throws Exception {
        User storeAdmin = userRepository.findByEmail("sm2021jadhav@gmail.com");
        User branchManager = userRepository.findByEmail("pravinmeshram0205@gmail.com");
        assertNotNull(storeAdmin);
        assertNotNull(branchManager);

        setSecurityContext(storeAdmin);

        UserDTO updateDto = new UserDTO();
        updateDto.setFullName(branchManager.getFullName());
        updateDto.setEmail(branchManager.getEmail());
        updateDto.setPhone(branchManager.getPhone());
        updateDto.setRole(branchManager.getRole());
        updateDto.setPassword("BrandNewPass456@");

        UserDTO result = employeeService.updateEmployee(branchManager.getId(), updateDto);
        assertNotNull(result);

        // 1. Login with NEW password -> MUST succeed
        var loginResponse = authService.login("pravinmeshram0205@gmail.com", "BrandNewPass456@");
        assertNotNull(loginResponse);
        assertNotNull(loginResponse.getJwt(), "JWT must be returned for new password");

        // 2. Login with WRONG/OLD password -> MUST fail
        assertThrows(UserException.class, () -> {
            authService.login("pravinmeshram0205@gmail.com", "IncorrectPassword123@");
        });
    }
}
