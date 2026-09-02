package com.aniket.controller;

import com.aniket.domain.StoreStatus;
import com.aniket.exception.ResourceNotFoundException;
import com.aniket.exception.UserException;
import com.aniket.mapper.StoreMapper;
import com.aniket.modal.ActivityLog;
import com.aniket.modal.Store;
import com.aniket.modal.User;
import com.aniket.payload.AdminAnalysis.DashboardSummaryDTO;
import com.aniket.payload.AdminAnalysis.RecentActivityDTO;
import com.aniket.payload.AdminAnalysis.StoreRegistrationStatDTO;
import com.aniket.payload.AdminAnalysis.StoreStatusDistributionDTO;
import com.aniket.payload.dto.StoreDTO;
import com.aniket.payload.response.ApiResponse;
import com.aniket.repository.ActivityLogRepository;
import com.aniket.repository.StoreRepository;
import com.aniket.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/super-admin")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;
    private final StoreService storeService;
    private final StoreRepository storeRepository;
    private final ActivityLogRepository activityLogRepository;
    private final ActivityLogService activityLogService;
    private final UserService userService;
    private final AuthService authService;
    private final StoreAnalyticsService storeAnalyticsService;

    /**
     * 📊 Get summary stats for dashboard cards
     */
    @GetMapping("/dashboard/summary")
    public DashboardSummaryDTO getDashboardSummary() {
        return adminDashboardService.getDashboardSummary();
    }

    /**
     * 📈 Get number of store registrations in the last 7 days
     */
    @GetMapping("/dashboard/store-registrations")
    public List<StoreRegistrationStatDTO> getLast7DayRegistrationStats() {
        return adminDashboardService.getLast7DayRegistrationStats();
    }

    /**
     * 🥧 Get store status distribution
     */
    @GetMapping("/dashboard/store-status-distribution")
    public StoreStatusDistributionDTO getStoreStatusDistribution() {
        return adminDashboardService.getStoreStatusDistribution();
    }

    /**
     * 🕐 Get recent activities (dashboard preview)
     */
    @GetMapping("/dashboard/recent-activities")
    public List<RecentActivityDTO> getRecentActivities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return adminDashboardService.getRecentActivities(page, size);
    }

    /**
     * 🛡️ Tenant Impersonation: Log audit trail and grant store context
     */
    @PostMapping("/stores/{id}/impersonate")
    public ResponseEntity<ApiResponse<StoreDTO>> impersonateStore(@PathVariable Long id) {
        try {
            User admin = userService.getCurrentUser();
            Store store = storeRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + id));

            activityLogService.log(
                    "STORE_IMPERSONATION",
                    "Super Admin \"" + admin.getFullName() + "\" initiated impersonation for store \"" + store.getBrand() + "\" (ID: " + id + ")",
                    "Store",
                    id,
                    admin.getFullName(),
                    "ACTIVE"
            );

            return ResponseEntity.ok(new ApiResponse<>(true, "Impersonation started for " + store.getBrand(), StoreMapper.toDto(store)));
        } catch (Exception e) {
            log.error("Failed to impersonate store {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Failed to start impersonation: " + e.getMessage(), null));
        }
    }

    /**
     * 🩺 System Health & Infrastructure Telemetry
     */
    @GetMapping("/system/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSystemHealth() {
        Map<String, Object> health = new HashMap<>();

        // 1. Database Connectivity & Query Latency Check
        long dbStart = System.currentTimeMillis();
        boolean dbOk = false;
        long storeCount = 0;
        try {
            storeCount = storeRepository.count();
            dbOk = true;
        } catch (Exception e) {
            log.error("DB health ping failed", e);
        }
        long dbLatency = System.currentTimeMillis() - dbStart;

        // 2. JVM Heap Telemetry
        Runtime runtime = Runtime.getRuntime();
        long totalMemoryMb = runtime.totalMemory() / (1024 * 1024);
        long freeMemoryMb = runtime.freeMemory() / (1024 * 1024);
        long usedMemoryMb = totalMemoryMb - freeMemoryMb;
        long maxMemoryMb = runtime.maxMemory() / (1024 * 1024);

        // 3. JVM Uptime & Threads
        long uptimeMs = java.lang.management.ManagementFactory.getRuntimeMXBean().getUptime();
        long uptimeMinutes = uptimeMs / (1000 * 60);
        int activeThreads = Thread.activeCount();

        health.put("databaseStatus", dbOk ? "UP" : "DOWN");
        health.put("databaseLatencyMs", dbLatency);
        health.put("databaseType", "PostgreSQL");
        health.put("totalStoresTracked", storeCount);
        health.put("usedMemoryMb", usedMemoryMb);
        health.put("totalMemoryMb", totalMemoryMb);
        health.put("maxMemoryMb", maxMemoryMb);
        health.put("systemUptimeMinutes", uptimeMinutes);
        health.put("activeThreads", activeThreads);
        health.put("webSocketStatus", "ACTIVE");

        return ResponseEntity.ok(new ApiResponse<>(true, "System telemetry fetched", health));
    }

    /**
     * ⚙️ Custom Quota Override for a specific store
     */
    @PatchMapping("/stores/{id}/quota-override")
    public ResponseEntity<ApiResponse<StoreDTO>> overrideStoreQuota(
            @PathVariable Long id,
            @RequestParam(required = false) Integer maxBranches,
            @RequestParam(required = false) Integer maxUsers,
            @RequestParam(required = false) Integer maxProducts
    ) {
        try {
            User admin = userService.getCurrentUser();
            Store store = storeRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + id));

            store.setCustomMaxBranches(maxBranches);
            store.setCustomMaxUsers(maxUsers);
            store.setCustomMaxProducts(maxProducts);

            Store saved = storeRepository.save(store);

            activityLogService.log(
                    "STORE_QUOTA_OVERRIDE",
                    "Custom quota configured for store \"" + store.getBrand() + "\" (Branches: " + maxBranches + ", Users: " + maxUsers + ", Products: " + maxProducts + ")",
                    "Store",
                    id,
                    admin.getFullName(),
                    "ACTIVE"
            );

            return ResponseEntity.ok(new ApiResponse<>(true, "Store quota overrides saved successfully", StoreMapper.toDto(saved)));
        } catch (Exception e) {
            log.error("Failed to override quota for store {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Failed to save quota overrides: " + e.getMessage(), null));
        }
    }

    /**
     * 📧 Direct Password Reset Dispatch for Store Owner
     */
    @PostMapping("/stores/{id}/send-password-reset")
    public ResponseEntity<ApiResponse<String>> sendStorePasswordReset(@PathVariable Long id) {
        try {
            User admin = userService.getCurrentUser();
            Store store = storeRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + id));

            if (store.getStoreAdmin() == null || store.getStoreAdmin().getEmail() == null) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Store has no registered administrator email", null));
            }

            String adminEmail = store.getStoreAdmin().getEmail();
            authService.createPasswordResetToken(adminEmail);

            activityLogService.log(
                    "PASSWORD_RESET_DISPATCHED",
                    "Super Admin triggered password recovery email for store \"" + store.getBrand() + "\" owner (" + adminEmail + ")",
                    "Store",
                    id,
                    admin.getFullName(),
                    "SUCCESS"
            );

            return ResponseEntity.ok(new ApiResponse<>(true, "Password reset link sent to " + adminEmail, adminEmail));
        } catch (Exception e) {
            log.error("Failed to send password reset for store {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Failed to send password reset: " + e.getMessage(), null));
        }
    }

    /**
     * 📈 Store Commercial & Financial Performance Overview
     */
    @GetMapping("/stores/{id}/financial-overview")
    public ResponseEntity<ApiResponse<com.aniket.payload.StoreAnalysis.StoreOverviewDTO>> getStoreFinancialOverview(@PathVariable Long id) {
        try {
            Store store = storeRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + id));

            if (store.getStoreAdmin() == null) {
                return ResponseEntity.ok(new ApiResponse<>(true, "No admin associated", null));
            }

            com.aniket.payload.StoreAnalysis.StoreOverviewDTO overview =
                    storeAnalyticsService.getStoreOverview(store.getStoreAdmin().getId());
            return ResponseEntity.ok(new ApiResponse<>(true, "Store financial overview fetched", overview));
        } catch (Exception e) {
            log.error("Failed to fetch financial overview for store {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Failed to load financial overview: " + e.getMessage(), null));
        }
    }

    /**
     * 📜 Full Audit Logs Search & Filtering
     */
    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<Page<RecentActivityDTO>>> searchAuditLogs(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ActivityLog> logsPage = activityLogRepository.searchActivityLogs(action, search, pageable);

        Page<RecentActivityDTO> dtoPage = logsPage.map(logItem -> RecentActivityDTO.builder()
                .id(logItem.getId())
                .action(logItem.getAction())
                .description(logItem.getDescription())
                .entityType(logItem.getEntityType())
                .entityId(logItem.getEntityId())
                .performedBy(logItem.getPerformedBy())
                .status(logItem.getStatus())
                .createdAt(logItem.getCreatedAt())
                .build());

        return ResponseEntity.ok(new ApiResponse<>(true, "Audit logs fetched", dtoPage));
    }

    /**
     * 🏷️ Get Distinct Audit Actions (for filtering dropdowns)
     */
    @GetMapping("/audit-logs/actions")
    public ResponseEntity<ApiResponse<List<String>>> getAuditLogActions() {
        List<String> actions = activityLogRepository.findDistinctActions();
        return ResponseEntity.ok(new ApiResponse<>(true, "Audit actions fetched", actions));
    }
}
