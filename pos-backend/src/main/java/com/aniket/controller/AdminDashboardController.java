package com.aniket.controller;

import com.aniket.domain.StoreStatus;
import com.aniket.exception.ResourceNotFoundException;
import com.aniket.payload.AdminAnalysis.DashboardSummaryDTO;
import com.aniket.payload.AdminAnalysis.RecentActivityDTO;
import com.aniket.payload.AdminAnalysis.StoreRegistrationStatDTO;
import com.aniket.payload.AdminAnalysis.StoreStatusDistributionDTO;
import com.aniket.payload.dto.StoreDTO;
import com.aniket.service.AdminDashboardService;
import com.aniket.service.StoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/super-admin")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;
    private final StoreService storeService;

    /**
     * 📊 Get summary stats for dashboard cards
     * - 🏪 totalStores
     * - ✅ activeStores
     * - ⏳ pendingStores
     * - ⛔ blockedStores
     */
    @GetMapping("/dashboard/summary")
    public DashboardSummaryDTO getDashboardSummary() {
        return adminDashboardService.getDashboardSummary();
    }

    /**
     * 📈 Get number of store registrations in the last 7 days
     * Used for 📅 chart data (line/bar)
     */
    @GetMapping("/dashboard/store-registrations")
    public List<StoreRegistrationStatDTO> getLast7DayRegistrationStats() {
        return adminDashboardService.getLast7DayRegistrationStats();
    }

    /**
     * 🥧 Get store status distribution
     * - ✅ active
     * - ⛔ blocked
     * - ⏳ pending
     * Used for pie chart 📊
     */
    @GetMapping("/dashboard/store-status-distribution")
    public StoreStatusDistributionDTO getStoreStatusDistribution() {
        return adminDashboardService.getStoreStatusDistribution();
    }

    /**
     * 🕐 Get recent activities
     * Returns the latest activity logs with pagination
     */
    @GetMapping("/dashboard/recent-activities")
    @PreAuthorize("hasRole('ADMIN')")
    public List<RecentActivityDTO> getRecentActivities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return adminDashboardService.getRecentActivities(page, size);
    }

}
