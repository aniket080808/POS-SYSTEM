package com.aniket.service;

import com.aniket.domain.ApprovalRequestStatus;
import com.aniket.domain.ApprovalRequestType;
import com.aniket.domain.SubscriptionAction;
import com.aniket.modal.ApprovalRequest;
import com.aniket.modal.Store;
import com.aniket.modal.SubscriptionPlan;
import com.aniket.modal.User;
import com.aniket.payload.dto.ApprovalRequestDTO;
import com.aniket.payload.response.ResubmitResponse;

import java.util.List;
import java.util.Map;

public interface ApprovalRequestService {

    ApprovalRequest createRegistrationRequest(Store store, User user);

    ApprovalRequest createOrUpdateReApprovalRequest(Store store, User adminUser);

    ApprovalRequest createSubscriptionRequest(Store store, User user, SubscriptionPlan plan, SubscriptionAction action, String paymentRef);

    ApprovalRequest approveRequest(Long requestId, User adminUser, String adminNotes);

    ApprovalRequest rejectRequest(Long requestId, User adminUser, String reason);

    ResubmitResponse resubmitRegistration(User currentUser);

    ResubmitResponse resubmitSubscriptionRequest(User currentUser, Long planId);

    List<ApprovalRequestDTO> getRequestsByTypeAndStatus(ApprovalRequestType type, ApprovalRequestStatus status);

    List<ApprovalRequestDTO> getRequestsForStore(User currentUser);

    Map<String, Long> getPendingRequestCounts();
}
