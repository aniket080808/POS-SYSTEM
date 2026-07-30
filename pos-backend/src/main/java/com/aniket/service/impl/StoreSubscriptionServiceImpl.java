package com.aniket.service.impl;

import com.aniket.domain.ApprovalRequestStatus;
import com.aniket.domain.ApprovalRequestType;
import com.aniket.domain.StoreSubscriptionStatus;
import com.aniket.domain.SubscriptionStatus;
import com.aniket.exception.ResourceNotFoundException;
import com.aniket.modal.ApprovalRequest;
import com.aniket.modal.Store;
import com.aniket.modal.StoreSubscription;
import com.aniket.modal.Subscription;
import com.aniket.modal.SubscriptionPlan;
import com.aniket.modal.User;
import com.aniket.payload.dto.StoreSubscriptionDetailDTO;
import com.aniket.payload.response.StoreSubscriptionStatusResponse;
import com.aniket.repository.ApprovalRequestRepository;
import com.aniket.repository.StoreRepository;
import com.aniket.repository.StoreSubscriptionRepository;
import com.aniket.repository.SubscriptionRepository;
import com.aniket.service.StoreSubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StoreSubscriptionServiceImpl implements StoreSubscriptionService {

    private final StoreSubscriptionRepository storeSubscriptionRepository;
    private final StoreRepository storeRepository;
    private final ApprovalRequestRepository approvalRequestRepository;
    private final SubscriptionRepository subscriptionRepository;

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
    @Transactional
    public void updateStatus(Long storeId, StoreSubscriptionStatus status) {
        Store store = storeRepository.findById(storeId).orElse(null);
        if (store == null) return;
        StoreSubscription storeSub = storeSubscriptionRepository.findByStoreId(storeId)
                .orElseGet(() -> {
                    StoreSubscription sub = StoreSubscription.builder()
                            .store(store)
                            .status(StoreSubscriptionStatus.NONE)
                            .build();
                    return storeSubscriptionRepository.save(sub);
                });
        storeSub.setStatus(status);
        storeSubscriptionRepository.save(storeSub);
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

    @Override
    @Transactional(readOnly = true)
    public StoreSubscriptionDetailDTO getDetailByStoreId(Long storeId) {
        Store store = storeRepository.findById(storeId).orElse(null);
        if (store == null) {
            return StoreSubscriptionDetailDTO.builder()
                    .storeId(storeId)
                    .subscriptionStatus(StoreSubscriptionStatus.NONE)
                    .build();
        }

        StoreSubscription storeSub = getOrCreateForStore(store);
        SubscriptionPlan currentPlan = storeSub.getCurrentPlan();

        // Find the latest ACTIVE or TRIAL subscription record for start/end dates
        List<Subscription> subs = subscriptionRepository.findByStore(store);
        Subscription latestActiveSub = subs.stream()
                .filter(s -> s.getStatus() == SubscriptionStatus.ACTIVE || s.getStatus() == SubscriptionStatus.TRIAL)
                .max(Comparator.comparing(Subscription::getStartDate))
                .orElse(null);

        StoreSubscriptionDetailDTO.StoreSubscriptionDetailDTOBuilder builder = StoreSubscriptionDetailDTO.builder()
                .storeId(storeId)
                .subscriptionStatus(storeSub.getStatus());

        if (currentPlan != null) {
            builder.planId(currentPlan.getId())
                    .planName(currentPlan.getName())
                    .planPrice(currentPlan.getPrice())
                    .billingCycle(currentPlan.getBillingCycle());
        }

        if (latestActiveSub != null) {
            builder.status(latestActiveSub.getStatus())
                    .startDate(latestActiveSub.getStartDate())
                    .endDate(latestActiveSub.getEndDate());
        }

        return builder.build();
    }
}
