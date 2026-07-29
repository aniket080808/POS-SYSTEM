package com.aniket.controller;

import com.aniket.domain.ApprovalRequestStatus;
import com.aniket.domain.ApprovalRequestType;
import com.aniket.exception.UserException;
import com.aniket.modal.ApprovalRequest;
import com.aniket.modal.User;
import com.aniket.payload.dto.ApprovalRequestDTO;
import com.aniket.payload.response.ApiResponse;
import com.aniket.payload.response.ResubmitResponse;
import com.aniket.payload.response.StoreSubscriptionStatusResponse;
import com.aniket.service.ApprovalRequestService;
import com.aniket.service.StoreSubscriptionService;
import com.aniket.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ApprovalRequestController {

    private final ApprovalRequestService approvalRequestService;
    private final StoreSubscriptionService storeSubscriptionService;
    private final UserService userService;

    // ==========================================
    // 👑 Super Admin Endpoints
    // ==========================================

    @GetMapping("/api/super-admin/requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ApprovalRequestDTO>> getRequests(
            @RequestParam(required = false) ApprovalRequestType type,
            @RequestParam(required = false) ApprovalRequestStatus status
    ) {
        return ResponseEntity.ok(approvalRequestService.getRequestsByTypeAndStatus(type, status));
    }

    @GetMapping("/api/super-admin/requests/counts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getPendingRequestCounts() {
        return ResponseEntity.ok(approvalRequestService.getPendingRequestCounts());
    }

    @PutMapping("/api/super-admin/requests/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ApprovalRequest>> approveRequest(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body
    ) throws UserException {
        User adminUser = userService.getCurrentUser();
        String adminNotes = body != null ? body.get("adminNotes") : null;
        ApprovalRequest request = approvalRequestService.approveRequest(id, adminUser, adminNotes);
        return ResponseEntity.ok(new ApiResponse<>(true, "Approval request approved successfully.", request));
    }

    @PutMapping("/api/super-admin/requests/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ApprovalRequest>> rejectRequest(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) throws UserException {
        User adminUser = userService.getCurrentUser();
        String reason = body != null ? body.get("reason") : null;
        ApprovalRequest request = approvalRequestService.rejectRequest(id, adminUser, reason);
        return ResponseEntity.ok(new ApiResponse<>(true, "Approval request rejected.", request));
    }

    // ==========================================
    // 🏪 Store Admin Endpoints (Resolved strictly via JWT context)
    // ==========================================

    @GetMapping("/api/approval-requests/my-store")
    public ResponseEntity<List<ApprovalRequestDTO>> getMyStoreRequests() throws UserException {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(approvalRequestService.getRequestsForStore(user));
    }

    @PostMapping("/api/approval-requests/re-register")
    public ResponseEntity<ResubmitResponse> resubmitRegistration() throws UserException {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(approvalRequestService.resubmitRegistration(user));
    }

    @PostMapping("/api/approval-requests/re-request-subscription")
    public ResponseEntity<ResubmitResponse> resubmitSubscriptionRequest(
            @RequestParam Long planId
    ) throws UserException {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(approvalRequestService.resubmitSubscriptionRequest(user, planId));
    }

    @GetMapping("/api/store-subscription/status")
    public ResponseEntity<StoreSubscriptionStatusResponse> getStoreSubscriptionStatus() throws UserException {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(storeSubscriptionService.getStatusResponseForUser(user));
    }
}
