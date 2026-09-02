package com.aniket.service.impl;

import com.aniket.domain.*;
import com.aniket.exception.ResourceNotFoundException;
import com.aniket.exception.UserException;
import com.aniket.mapper.ApprovalRequestMapper;
import com.aniket.modal.*;
import com.aniket.payload.dto.ApprovalRequestDTO;
import com.aniket.payload.response.ResubmitResponse;
import com.aniket.repository.*;
import com.aniket.service.ApprovalRequestService;
import com.aniket.service.EmailService;
import com.aniket.service.EmailTemplateService;
import com.aniket.service.NotificationService;
import com.aniket.service.StoreSubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApprovalRequestServiceImpl implements ApprovalRequestService {

    private final ApprovalRequestRepository approvalRequestRepository;
    private final StoreRepository storeRepository;
    private final StoreSubscriptionRepository storeSubscriptionRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final StoreSubscriptionService storeSubscriptionService;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final EmailTemplateService emailTemplateService;

    @Override
    @Transactional
    public ApprovalRequest createRegistrationRequest(Store store, User user) {
        // Guard: check if pending registration request already exists
        if (approvalRequestRepository.existsByStoreIdAndTypeAndStatus(
                store.getId(), ApprovalRequestType.STORE_REGISTRATION, ApprovalRequestStatus.PENDING)) {
            log.warn("Duplicate registration request attempt for storeId: {}", store.getId());
            throw new IllegalArgumentException("A registration approval request is already pending for this store.");
        }

        store.setStatus(StoreStatus.PENDING);
        storeRepository.save(store);

        ApprovalRequest request = ApprovalRequest.builder()
                .type(ApprovalRequestType.STORE_REGISTRATION)
                .status(ApprovalRequestStatus.PENDING)
                .store(store)
                .requestedBy(user)
                .build();

        return approvalRequestRepository.save(request);
    }

    @Override
    @Transactional
    public ApprovalRequest createOrUpdateReApprovalRequest(Store store, User adminUser) {
        // Check if a PENDING STORE_REGISTRATION request already exists for this store
        Optional<ApprovalRequest> existingPending = approvalRequestRepository
                .findFirstByStoreIdAndTypeAndStatusOrderByCreatedAtDesc(
                        store.getId(), ApprovalRequestType.STORE_REGISTRATION, ApprovalRequestStatus.PENDING);

        if (existingPending.isPresent()) {
            log.info("Re-approval request already pending for storeId: {}", store.getId());
            return existingPending.get();
        }

        // Create a new re-approval request
        ApprovalRequest request = ApprovalRequest.builder()
                .type(ApprovalRequestType.STORE_REGISTRATION)
                .status(ApprovalRequestStatus.PENDING)
                .store(store)
                .requestedBy(adminUser)
                .build();

        return approvalRequestRepository.save(request);
    }

    @Override
    @Transactional
    public ApprovalRequest createSubscriptionRequest(Store store, User user, SubscriptionPlan plan, SubscriptionAction action, String paymentRef) {
        // Guard: check if pending subscription request already exists
        if (approvalRequestRepository.existsByStoreIdAndTypeAndStatus(
                store.getId(), ApprovalRequestType.SUBSCRIPTION_CHANGE, ApprovalRequestStatus.PENDING)) {
            log.warn("Duplicate subscription request attempt for storeId: {}", store.getId());
            throw new IllegalArgumentException("A subscription approval request is already pending for this store.");
        }

        StoreSubscription storeSub = storeSubscriptionService.getOrCreateForStore(store);
        storeSub.setStatus(StoreSubscriptionStatus.PENDING);
        storeSub.setRequestedPlan(plan);
        storeSub.setRejectionReason(null);
        storeSubscriptionRepository.save(storeSub);

        ApprovalRequest request = ApprovalRequest.builder()
                .type(ApprovalRequestType.SUBSCRIPTION_CHANGE)
                .status(ApprovalRequestStatus.PENDING)
                .store(store)
                .requestedBy(user)
                .subscriptionAction(action)
                .requestedPlan(plan)
                .currentPlan(storeSub.getCurrentPlan())
                .paymentReference(paymentRef)
                .build();

        return approvalRequestRepository.save(request);
    }

    @Override
    @Transactional
    public ApprovalRequest approveRequest(Long requestId, User adminUser, String adminNotes) {
        ApprovalRequest request = approvalRequestRepository.findById(requestId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Approval request not found with ID: " + requestId));

        if (request.getStatus() != ApprovalRequestStatus.PENDING) {
            throw new IllegalArgumentException("This approval request has already been processed.");
        }

        request.setStatus(ApprovalRequestStatus.APPROVED);
        request.setAdminNotes(adminNotes);
        request.setResolvedBy(adminUser);
        request.setResolvedAt(LocalDateTime.now());

        Store store = request.getStore();

        if (request.getType() == ApprovalRequestType.STORE_REGISTRATION) {
            store.setStatus(StoreStatus.ACTIVE);
            store.setRegistrationRejectionReason(null);
            storeRepository.save(store);
            // Restore subscription to ACTIVE only if it has a current plan that is not expired
            StoreSubscription storeSub = storeSubscriptionService.getOrCreateForStore(store);
            if (storeSub.getCurrentPlan() != null) {
                List<Subscription> activeSubs = subscriptionRepository.findByStoreAndStatus(store, SubscriptionStatus.ACTIVE);
                boolean hasActiveSubscription = activeSubs.stream()
                        .anyMatch(s -> s.getEndDate() != null && !s.getEndDate().isBefore(java.time.LocalDate.now()));
                if (hasActiveSubscription) {
                    storeSub.setStatus(StoreSubscriptionStatus.ACTIVE);
                } else {
                    // Plan exists but expired — keep as INACTIVE
                    storeSub.setStatus(StoreSubscriptionStatus.INACTIVE);
                }
            } else {
                storeSub.setStatus(StoreSubscriptionStatus.NONE);
            }
            storeSubscriptionRepository.save(storeSub);
            log.info("APPROVED store registration for store ID: {}", store.getId());

            // Notify store admin
            notificationService.createNotification(
                    NotificationType.STORE_APPROVED,
                    Priority.SUCCESS,
                    "Store Registration Approved",
                    "Your store \"" + store.getBrand() + "\" has been approved and is now active.",
                    "Store",
                    store.getId(),
                    "/store/dashboard",
                    store.getStoreAdmin().getId()
            );

            // Send fail-safe themed email notification
            if (store.getStoreAdmin() != null && store.getStoreAdmin().getEmail() != null) {
                String planTitle = storeSub.getCurrentPlan() != null ? storeSub.getCurrentPlan().getName() : "Starter";
                String emailBody = emailTemplateService.buildStoreApprovedEmail(
                        store.getStoreAdmin().getFullName(),
                        store.getBrand(),
                        planTitle,
                        "http://localhost:5173/auth/login"
                );
                sendFailSafeEmail(store.getStoreAdmin(), "Your Store Has Been Approved! 🎉", emailBody);
            }
        } else if (request.getType() == ApprovalRequestType.SUBSCRIPTION_CHANGE) {
            StoreSubscription storeSub = storeSubscriptionService.getOrCreateForStore(store);
            storeSub.setStatus(StoreSubscriptionStatus.ACTIVE);
            storeSub.setCurrentPlan(request.getRequestedPlan());
            storeSub.setRequestedPlan(null);
            storeSub.setRejectionReason(null);
            storeSubscriptionRepository.save(storeSub);

            // Also create/update historic Subscription entity to ACTIVE
            Subscription sub = Subscription.builder()
                    .store(store)
                    .plan(request.getRequestedPlan())
                    .status(SubscriptionStatus.ACTIVE)
                    .paymentStatus(PaymentStatus.SUCCESS)
                    .transactionId(request.getPaymentReference())
                    .startDate(java.time.LocalDate.now())
                    .endDate(java.time.LocalDate.now().plusMonths(1))
                    .build();
            subscriptionRepository.save(sub);

            log.info("APPROVED subscription change for store ID: {}, plan: {}", store.getId(), request.getRequestedPlan().getName());

            // Notify store admin
            notificationService.createNotification(
                    NotificationType.SUBSCRIPTION_APPROVED,
                    Priority.SUCCESS,
                    "Subscription Approved",
                    "Your subscription to \"" + request.getRequestedPlan().getName() + "\" has been approved.",
                    "Subscription",
                    storeSub.getId(),
                    "/store/upgrade",
                    store.getStoreAdmin().getId()
            );

            // Send fail-safe themed email notification
            if (store.getStoreAdmin() != null && store.getStoreAdmin().getEmail() != null) {
                String emailBody = emailTemplateService.buildSubscriptionApprovedEmail(
                        store.getStoreAdmin().getFullName(),
                        store.getBrand(),
                        request.getRequestedPlan().getName(),
                        request.getRequestedPlan().getPrice(),
                        "http://localhost:5173/store/settings"
                );
                sendFailSafeEmail(store.getStoreAdmin(), "Subscription Plan Upgrade Approved! ⚡", emailBody);
            }
        }

        return approvalRequestRepository.save(request);
    }

    @Override
    @Transactional
    public ApprovalRequest rejectRequest(Long requestId, User adminUser, String reason) {
        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Rejection reason is required.");
        }

        ApprovalRequest request = approvalRequestRepository.findById(requestId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Approval request not found with ID: " + requestId));

        if (request.getStatus() != ApprovalRequestStatus.PENDING) {
            throw new IllegalArgumentException("This approval request has already been processed.");
        }

        request.setStatus(ApprovalRequestStatus.REJECTED);
        request.setRejectionReason(reason);
        request.setResolvedBy(adminUser);
        request.setResolvedAt(LocalDateTime.now());

        Store store = request.getStore();

        if (request.getType() == ApprovalRequestType.STORE_REGISTRATION) {
            store.setStatus(StoreStatus.REJECTED);
            store.setRegistrationRejectionReason(reason);
            storeRepository.save(store);
            // Sync subscription status to REJECTED
            StoreSubscription storeSub = storeSubscriptionService.getOrCreateForStore(store);
            storeSub.setStatus(StoreSubscriptionStatus.REJECTED);
            storeSubscriptionRepository.save(storeSub);
            log.info("REJECTED store registration for store ID: {}", store.getId());

            // Notify store admin
            notificationService.createNotification(
                    NotificationType.STORE_REJECTED,
                    Priority.ERROR,
                    "Store Registration Rejected",
                    "Your store \"" + store.getBrand() + "\" registration was rejected. Reason: " + reason,
                    "Store",
                    store.getId(),
                    "/store/upgrade",
                    store.getStoreAdmin().getId()
            );

            // Send fail-safe themed email notification
            if (store.getStoreAdmin() != null && store.getStoreAdmin().getEmail() != null) {
                String emailBody = emailTemplateService.buildStoreRejectedEmail(
                        store.getStoreAdmin().getFullName(),
                        store.getBrand(),
                        reason,
                        "http://localhost:5173/auth/onboarding"
                );
                sendFailSafeEmail(store.getStoreAdmin(), "Important: Store Registration Application Update", emailBody);
            }
        } else if (request.getType() == ApprovalRequestType.SUBSCRIPTION_CHANGE) {
            StoreSubscription storeSub = storeSubscriptionService.getOrCreateForStore(store);
            // Keep status as REJECTED so the store admin's upgrade page can show the rejection banner.
            // The currentPlan reference is preserved so the store can still use their existing plan.
            storeSub.setStatus(StoreSubscriptionStatus.REJECTED);
            storeSub.setRequestedPlan(null);
            storeSub.setRejectionReason(reason);
            storeSubscriptionRepository.save(storeSub);
            log.info("REJECTED subscription change for store ID: {}", store.getId());

            // Notify store admin
            notificationService.createNotification(
                    NotificationType.SUBSCRIPTION_REJECTED,
                    Priority.ERROR,
                    "Subscription Rejected",
                    "Your subscription change request was rejected. Reason: " + reason,
                    "Subscription",
                    storeSub.getId(),
                    "/store/upgrade",
                    store.getStoreAdmin().getId()
            );

            // Send fail-safe themed email notification
            if (store.getStoreAdmin() != null && store.getStoreAdmin().getEmail() != null) {
                String planName = request.getRequestedPlan() != null ? request.getRequestedPlan().getName() : "Requested Plan";
                String emailBody = emailTemplateService.buildSubscriptionRejectedEmail(
                        store.getStoreAdmin().getFullName(),
                        store.getBrand(),
                        planName,
                        reason,
                        "http://localhost:5173/store/upgrade"
                );
                sendFailSafeEmail(store.getStoreAdmin(), "Subscription Plan Request Update", emailBody);
            }
        }

        return approvalRequestRepository.save(request);
    }

    /**
     * Sends an email notification to the store admin in a fail-safe manner.
     * If the email fails to send (SMTP down, bad address), the transaction is NOT rolled back.
     */
    private void sendFailSafeEmail(User storeAdmin, String subject, String htmlBody) {
        if (storeAdmin == null || storeAdmin.getEmail() == null) return;
        try {
            emailService.sendEmail(storeAdmin.getEmail(), subject, htmlBody);
        } catch (Exception e) {
            log.warn("Failed to send email to {}: {}", storeAdmin.getEmail(), e.getMessage());
        }
    }

    @Override
    @Transactional
    public ResubmitResponse resubmitRegistration(User currentUser) {
        Store store = storeRepository.findByStoreAdminId(currentUser.getId());
        if (store == null) {
            throw new IllegalArgumentException("No store found for current user.");
        }

        // Guard: check if pending registration request already exists
        if (approvalRequestRepository.existsByStoreIdAndTypeAndStatus(
                store.getId(), ApprovalRequestType.STORE_REGISTRATION, ApprovalRequestStatus.PENDING)) {
            throw new IllegalArgumentException("A store registration request is already pending.");
        }

        store.setStatus(StoreStatus.PENDING);
        store.setRegistrationRejectionReason(null);
        storeRepository.save(store);

        ApprovalRequest request = ApprovalRequest.builder()
                .type(ApprovalRequestType.STORE_REGISTRATION)
                .status(ApprovalRequestStatus.PENDING)
                .store(store)
                .requestedBy(currentUser)
                .build();
        approvalRequestRepository.save(request);

        return ResubmitResponse.builder()
                .success(true)
                .requiresPayment(false)
                .message("Store registration request re-submitted successfully.")
                .build();
    }

    @Override
    @Transactional
    public ResubmitResponse resubmitSubscriptionRequest(User currentUser, Long planId) {
        Store store = storeRepository.findByStoreAdminId(currentUser.getId());
        if (store == null) {
            throw new IllegalArgumentException("No store found for current user.");
        }

        // Guard: check if pending subscription request already exists
        if (approvalRequestRepository.existsByStoreIdAndTypeAndStatus(
                store.getId(), ApprovalRequestType.SUBSCRIPTION_CHANGE, ApprovalRequestStatus.PENDING)) {
            throw new IllegalArgumentException("A subscription change request is already pending.");
        }

        SubscriptionPlan targetPlan = subscriptionPlanRepository.findById(planId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Subscription plan not found with ID: " + planId));

        // Find most recent rejected subscription request for this store
        Optional<ApprovalRequest> lastRejectedOpt = approvalRequestRepository
                .findFirstByStoreIdAndTypeAndStatusOrderByCreatedAtDesc(
                        store.getId(), ApprovalRequestType.SUBSCRIPTION_CHANGE, ApprovalRequestStatus.REJECTED);

        if (lastRejectedOpt.isPresent()
                && lastRejectedOpt.get().getRequestedPlan() != null
                && lastRejectedOpt.get().getRequestedPlan().getId().equals(planId)) {

            // REAPPLY CASE (same plan -> reuse paymentReference, no new charge)
            String paymentRef = lastRejectedOpt.get().getPaymentReference();

            StoreSubscription storeSub = storeSubscriptionService.getOrCreateForStore(store);
            storeSub.setStatus(StoreSubscriptionStatus.PENDING);
            storeSub.setRequestedPlan(targetPlan);
            storeSub.setRejectionReason(null);
            storeSubscriptionRepository.save(storeSub);

            ApprovalRequest newRequest = ApprovalRequest.builder()
                    .type(ApprovalRequestType.SUBSCRIPTION_CHANGE)
                    .status(ApprovalRequestStatus.PENDING)
                    .store(store)
                    .requestedBy(currentUser)
                    .subscriptionAction(lastRejectedOpt.get().getSubscriptionAction() != null
                            ? lastRejectedOpt.get().getSubscriptionAction() : SubscriptionAction.NEW)
                    .requestedPlan(targetPlan)
                    .currentPlan(storeSub.getCurrentPlan())
                    .paymentReference(paymentRef)
                    .build();
            approvalRequestRepository.save(newRequest);

            return ResubmitResponse.builder()
                    .success(true)
                    .requiresPayment(false)
                    .message("Subscription request reapplied successfully for " + targetPlan.getName() + ".")
                    .build();
        } else {
            // DIFFERENT PLAN CASE -> Requires new payment flow via subscribeToPlan/upgradeSubscription
            return ResubmitResponse.builder()
                    .success(true)
                    .requiresPayment(true)
                    .message("Different plan selected. Payment is required.")
                    .build();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApprovalRequestDTO> getRequestsByTypeAndStatus(ApprovalRequestType type, ApprovalRequestStatus status) {
        List<ApprovalRequest> requests;
        if (type != null && status != null) {
            requests = approvalRequestRepository.findByTypeAndStatus(type, status);
        } else if (type != null) {
            requests = approvalRequestRepository.findByType(type);
        } else if (status != null) {
            requests = approvalRequestRepository.findByStatus(status);
        } else {
            requests = approvalRequestRepository.findAll();
        }
        return requests.stream().map(ApprovalRequestMapper::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApprovalRequestDTO> getRequestsForStore(User currentUser) {
        Store store = storeRepository.findByStoreAdminId(currentUser.getId());
        if (store == null) {
            return List.of();
        }
        return approvalRequestRepository.findByStoreId(store.getId()).stream()
                .map(ApprovalRequestMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> getPendingRequestCounts() {
        Map<String, Long> counts = new HashMap<>();
        counts.put("registrationPending", approvalRequestRepository.countByTypeAndStatus(ApprovalRequestType.STORE_REGISTRATION, ApprovalRequestStatus.PENDING));
        counts.put("subscriptionPending", approvalRequestRepository.countByTypeAndStatus(ApprovalRequestType.SUBSCRIPTION_CHANGE, ApprovalRequestStatus.PENDING));
        return counts;
    }
}
