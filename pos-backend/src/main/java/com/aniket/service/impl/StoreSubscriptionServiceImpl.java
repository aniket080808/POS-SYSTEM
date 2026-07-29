package com.aniket.service.impl;

import com.aniket.domain.ApprovalRequestStatus;
import com.aniket.domain.ApprovalRequestType;
import com.aniket.domain.StoreSubscriptionStatus;
import com.aniket.modal.ApprovalRequest;
import com.aniket.modal.Store;
import com.aniket.modal.StoreSubscription;
import com.aniket.modal.User;
import com.aniket.payload.response.StoreSubscriptionStatusResponse;
import com.aniket.repository.ApprovalRequestRepository;
import com.aniket.repository.StoreRepository;
import com.aniket.repository.StoreSubscriptionRepository;
import com.aniket.service.StoreSubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StoreSubscriptionServiceImpl implements StoreSubscriptionService {

    private final StoreSubscriptionRepository storeSubscriptionRepository;
    private final StoreRepository storeRepository;
    private final ApprovalRequestRepository approvalRequestRepository;

    @Override
    @Transactional
    public StoreSubscription getOrCreateForStore(Store store) {
        return storeSubscriptionRepository.findByStoreId(store.getId())
                .orElseGet(() -> {
                    StoreSubscription sub = StoreSubscription.builder()
                            .store(store)
                            .status(StoreSubscriptionStatus.NONE)
                            .build();
                    return storeSubscriptionRepository.save(sub);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public StoreSubscription getByStoreId(Long storeId) {
        return storeSubscriptionRepository.findByStoreId(storeId).orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isSubscriptionActive(Long storeId) {
        return storeSubscriptionRepository.findByStoreId(storeId)
                .map(sub -> sub.getStatus() == StoreSubscriptionStatus.ACTIVE)
                .orElse(false);
    }

    @Override
    @Transactional(readOnly = true)
    public StoreSubscriptionStatusResponse getStatusResponseForUser(User user) {
        Store store = storeRepository.findByStoreAdminId(user.getId());
        if (store == null) {
            return StoreSubscriptionStatusResponse.builder().build();
        }

        StoreSubscription storeSub = getOrCreateForStore(store);

        // Find recent rejected request if any to get rejectedPlanId
        Optional<ApprovalRequest> rejectedSubReqOpt = approvalRequestRepository
                .findFirstByStoreIdAndTypeAndStatusOrderByCreatedAtDesc(
                        store.getId(), ApprovalRequestType.SUBSCRIPTION_CHANGE, ApprovalRequestStatus.REJECTED);

        Long rejectedPlanId = rejectedSubReqOpt.map(r -> r.getRequestedPlan() != null ? r.getRequestedPlan().getId() : null).orElse(null);
        String rejectedPlanName = rejectedSubReqOpt.map(r -> r.getRequestedPlan() != null ? r.getRequestedPlan().getName() : null).orElse(null);

        return StoreSubscriptionStatusResponse.builder()
                .registrationStatus(store.getStatus())
                .registrationRejectionReason(store.getRegistrationRejectionReason())
                .subscriptionStatus(storeSub.getStatus())
                .currentPlan(storeSub.getCurrentPlan())
                .requestedPlan(storeSub.getRequestedPlan())
                .subscriptionRejectionReason(storeSub.getRejectionReason())
                .rejectedPlanId(rejectedPlanId)
                .rejectedPlanName(rejectedPlanName)
                .build();
    }
}
