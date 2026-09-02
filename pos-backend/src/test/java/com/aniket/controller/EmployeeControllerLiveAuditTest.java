package com.aniket.controller;

import com.aniket.configrations.JwtProvider;
import com.aniket.domain.UserRole;
import com.aniket.modal.Branch;
import com.aniket.modal.User;
import com.aniket.payload.dto.UserDTO;
import com.aniket.payload.request.AdminResetPasswordRequest;
import com.aniket.repository.BranchRepository;
import com.aniket.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Collections;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class EmployeeControllerLiveAuditTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String TEST_EMAIL = "live_audit_emp_99@branch1.com";
    private String branchAdminJwt;
    private String branchManagerJwt;
    private User branchAdmin;
    private User branchManager;
    private User cashier;

    @BeforeEach
    void setUp() {
        cleanTestUser();

        branchAdmin = userRepository.findByEmail("marigaming9@gmail.com");
        branchManager = userRepository.findByEmail("pravinmeshram0205@gmail.com");
        cashier = userRepository.findByEmail("rakeshkamble1345@gmail.com");

        branchAdmin.setLastActivity(LocalDateTime.now());
        userRepository.save(branchAdmin);

        branchManager.setLastActivity(LocalDateTime.now());
        userRepository.save(branchManager);

        // Generate valid JWT tokens for branch admin and branch manager
        UsernamePasswordAuthenticationToken adminAuth = new UsernamePasswordAuthenticationToken(
                branchAdmin.getEmail(), null,
                Collections.singletonList(new SimpleGrantedAuthority(branchAdmin.getRole().name()))
        );
        branchAdminJwt = jwtProvider.generateToken(adminAuth);

        UsernamePasswordAuthenticationToken mgrAuth = new UsernamePasswordAuthenticationToken(
                branchManager.getEmail(), null,
                Collections.singletonList(new SimpleGrantedAuthority(branchManager.getRole().name()))
        );
        branchManagerJwt = jwtProvider.generateToken(mgrAuth);
    }

    @AfterEach
    void tearDown() {
        cleanTestUser();
    }

    private void cleanTestUser() {
        User u = userRepository.findByEmail(TEST_EMAIL);
        if (u != null) {
            userRepository.delete(u);
        }
    }

    @Test
    @DisplayName("GET /api/employees/branch/1 - Returns employees with non-null createdAt & enabled fields")
    void testGetBranchEmployeesReturnsMetadata() throws Exception {
        mockMvc.perform(get("/api/employees/branch/1")
                        .header("Authorization", "Bearer " + branchAdminJwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(3))))
                .andExpect(jsonPath("$[0].createdAt").isNotEmpty())
                .andExpect(jsonPath("$[0].enabled").value(true));
    }

    @Test
    @DisplayName("SAFETY REQUIREMENT: Branch Manager (pravinmeshram0205@gmail.com) modifying Branch Admin (Mari Bhai) returns HTTP 403 Forbidden")
    void testBranchManagerForbiddenFromModifyingBranchAdmin() throws Exception {
        Long branchAdminId = branchAdmin.getId();

        // 1. Toggle access of Branch Admin as Branch Manager -> 403 Forbidden
        mockMvc.perform(put("/api/employees/" + branchAdminId + "/toggle-access")
                        .header("Authorization", "Bearer " + branchManagerJwt))
                .andExpect(status().isForbidden());

        // 2. Reset password of Branch Admin as Branch Manager -> 403 Forbidden
        AdminResetPasswordRequest resetReq = new AdminResetPasswordRequest();
        resetReq.setNewPassword("NewPassword123@");

        mockMvc.perform(put("/api/employees/" + branchAdminId + "/reset-password")
                        .header("Authorization", "Bearer " + branchManagerJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetReq)))
                .andExpect(status().isForbidden());

        // 3. Edit details of Branch Admin as Branch Manager -> 403 Forbidden
        UserDTO editDto = new UserDTO();
        editDto.setFullName("Unauthorized Change");

        mockMvc.perform(put("/api/employees/" + branchAdminId)
                        .header("Authorization", "Bearer " + branchManagerJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(editDto)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("PUT /api/employees/{id}/toggle-access - Branch Admin toggles test employee access")
    void testToggleAccessHttpFlow() throws Exception {
        String empJson = """
                {
                    "fullName": "Live Audit User",
                    "email": "live_audit_emp_99@branch1.com",
                    "phone": "9988776655",
                    "role": "ROLE_BRANCH_CASHIER",
                    "password": "SamplePass123@"
                }
                """;

        mockMvc.perform(post("/api/employees/branch/1")
                        .header("Authorization", "Bearer " + branchAdminJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(empJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists());

        User created = userRepository.findByEmail(TEST_EMAIL);

        // Toggle access -> should become disabled (enabled = false)
        mockMvc.perform(put("/api/employees/" + created.getId() + "/toggle-access")
                        .header("Authorization", "Bearer " + branchAdminJwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(false));

        // Toggle access again -> should become enabled (enabled = true)
        mockMvc.perform(put("/api/employees/" + created.getId() + "/toggle-access")
                        .header("Authorization", "Bearer " + branchAdminJwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(true));
    }

    @Test
    @DisplayName("PUT /api/employees/{id}/reset-password - Branch Admin resets password with validation")
    void testResetPasswordHttpFlow() throws Exception {
        String empJson = """
                {
                    "fullName": "Live Audit User 2",
                    "email": "live_audit_emp_99@branch1.com",
                    "phone": "9988776644",
                    "role": "ROLE_BRANCH_CASHIER",
                    "password": "SamplePass123@"
                }
                """;

        mockMvc.perform(post("/api/employees/branch/1")
                        .header("Authorization", "Bearer " + branchAdminJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(empJson))
                .andExpect(status().isCreated());

        User created = userRepository.findByEmail(TEST_EMAIL);

        // Try resetting with short password (< 8 chars) -> 400 Bad Request
        AdminResetPasswordRequest shortReq = new AdminResetPasswordRequest();
        shortReq.setNewPassword("short");

        mockMvc.perform(put("/api/employees/" + created.getId() + "/reset-password")
                        .header("Authorization", "Bearer " + branchAdminJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(shortReq)))
                .andExpect(status().isBadRequest());

        // Valid password reset -> 200 OK
        AdminResetPasswordRequest validReq = new AdminResetPasswordRequest();
        validReq.setNewPassword("ValidResetPassword123@");

        mockMvc.perform(put("/api/employees/" + created.getId() + "/reset-password")
                        .header("Authorization", "Bearer " + branchAdminJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validReq)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/employees/{id}/performance - Returns real performance for cashier & manager")
    void testPerformanceHttpFlow() throws Exception {
        // Cashier performance
        mockMvc.perform(get("/api/employees/" + cashier.getId() + "/performance")
                        .header("Authorization", "Bearer " + branchAdminJwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Rakesh Kamble"))
                .andExpect(jsonPath("$.role").value("ROLE_BRANCH_CASHIER"))
                .andExpect(jsonPath("$.totalOrders").value(greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.totalSales").value(greaterThan(0.0)));

        // Manager profile
        mockMvc.perform(get("/api/employees/" + branchManager.getId() + "/performance")
                        .header("Authorization", "Bearer " + branchAdminJwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Pravin Meshram"))
                .andExpect(jsonPath("$.role").value("ROLE_BRANCH_MANAGER"))
                .andExpect(jsonPath("$.branchName").isNotEmpty());
    }
}
