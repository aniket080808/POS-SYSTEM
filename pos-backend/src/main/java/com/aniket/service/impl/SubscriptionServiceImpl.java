package com.aniket.service.impl;


import com.aniket.domain.PaymentGateway;
import com.aniket.domain.PaymentStatus;
import com.aniket.domain.SubscriptionStatus;
import com.aniket.exception.PaymentException;
import com.aniket.mapper.SubscriptionMapper;
import com.aniket.modal.Payment;
import com.aniket.modal.Store;
import com.aniket.modal.Subscription;
import com.aniket.modal.SubscriptionPlan;
//import com.aniket.payload.SubscriptionDTO;
import com.aniket.payload.request.PaymentInitiateRequest;
import com.aniket.payload.response.PaymentInitiateResponse;
import com.aniket.repository.StoreRepository;
import com.aniket.repository.SubscriptionPlanRepository;
import com.aniket.repository.SubscriptionRepository;
import com.aniket.service.PaymentService;
import com.aniket.service.SubscriptionService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubscriptionServiceImpl implements SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final StoreRepository storeRepository;

    private final SubscriptionPlanRepository planRepository;
    private final PaymentService paymentService;
    private final com.aniket.service.ApprovalRequestService approvalRequestService;
    private final com.aniket.service.StoreSubscriptionService storeSubscriptionService;

    @Override
    @Transactional
    public PaymentInitiateResponse createSubscription(Long storeId,
                                      Long planId,
                                      PaymentGateway gateway,
                                      String transactionId) throws PaymentException {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new EntityNotFoundException("Store not found"));

        SubscriptionPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Subscription Plan not found"
                ));

        Subscription sub = Subscription.builder()
                .store(store)
                .plan(plan)
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusMonths(1))
                .status(SubscriptionStatus.TRIAL)
                .paymentStatus(PaymentStatus.PENDING)
                .paymentGateway(gateway)
                .transactionId(transactionId)
                .build();
        Subscription savedSub = subscriptionRepository.save(sub);

        // Create pending subscription ApprovalRequest & set StoreSubscription status PENDING
        approvalRequestService.createSubscriptionRequest(store, store.getStoreAdmin(), plan, com.aniket.domain.SubscriptionAction.NEW, transactionId);

        PaymentInitiateRequest paymentInitiateRequest = PaymentInitiateRequest.builder()
                .amount(plan.getPrice())
                .subscriptionId(savedSub.getId())
                .description("subscribe " + plan.getName())
                .storeId(storeId)
                .gateway(gateway)
                .build();
        PaymentInitiateResponse payment = paymentService.initiatePayment(paymentInitiateRequest);

        return payment;
    }

    @Override
    @Transactional
    public PaymentInitiateResponse upgradeSubscription(Long storeId,
                                            Long planId, PaymentGateway gateway,
                                            String transactionId) throws PaymentException {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new EntityNotFoundException("Store not found"));

        SubscriptionPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Subscription Plan not found"
                ));

        com.aniket.modal.StoreSubscription currentStoreSub = storeSubscriptionService.getOrCreateForStore(store);
        com.aniket.domain.SubscriptionAction action = com.aniket.domain.SubscriptionAction.UPGRADE;
        if (currentStoreSub.getCurrentPlan() != null && currentStoreSub.getCurrentPlan().getPrice() > plan.getPrice()) {
            action = com.aniket.domain.SubscriptionAction.DOWNGRADE;
        }

        Subscription sub = Subscription.builder()
                .store(store)
                .plan(plan)
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusMonths(1))
                .status(SubscriptionStatus.TRIAL)
                .paymentStatus(PaymentStatus.PENDING)
                .paymentGateway(gateway)
                .transactionId(transactionId)
                .build();
        Subscription updatedSubscription = subscriptionRepository.save(sub);

        // Create pending subscription ApprovalRequest & set StoreSubscription status PENDING
        approvalRequestService.createSubscriptionRequest(store, store.getStoreAdmin(), plan, action, transactionId);

        PaymentInitiateRequest paymentInitiateRequest = PaymentInitiateRequest.builder()
                .amount(plan.getPrice())
                .subscriptionId(updatedSubscription.getId())
                .description("upgrade " + plan.getName())
                .storeId(storeId)
                .gateway(gateway)
                .build();
        PaymentInitiateResponse payment = paymentService.initiatePayment(paymentInitiateRequest);
        return payment;
    }

    @Override
    public Subscription activateSubscription(Long subscriptionId) {
        Subscription sub = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));
        sub.setStatus(SubscriptionStatus.ACTIVE);
        sub.setPaymentStatus(PaymentStatus.SUCCESS);
        return subscriptionRepository.save(sub);
    }

    @Override
    public Subscription cancelSubscription(Long subscriptionId) {
        Subscription sub = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));
        sub.setStatus(SubscriptionStatus.CANCELLED);
        return subscriptionRepository.save(sub);
    }

    @Override
    public void expirePastSubscriptions() {
        List<Subscription> all = subscriptionRepository.findAll();
        all.stream()
                .filter(s -> s.getEndDate().isBefore(LocalDate.now()) && s.getStatus() != SubscriptionStatus.EXPIRED)
                .forEach(s -> {
                    s.setStatus(SubscriptionStatus.EXPIRED);
                    subscriptionRepository.save(s);
                });
    }

    @Override
    public Subscription updatePaymentStatus(Long subscriptionId, PaymentStatus status) {
        Subscription sub = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));
        sub.setPaymentStatus(status);
        return subscriptionRepository.save(sub);
    }

    @Override
    public List<Subscription> getSubscriptionsByStore(
            Long storeId,
            SubscriptionStatus status) {
        Store store = storeRepository.findById(storeId).orElseThrow(
                () -> new EntityNotFoundException("Store not found")
        );
        if (status != null) {
            return subscriptionRepository.findByStoreAndStatus(store, status);
        }
        return subscriptionRepository.findByStore(store);
    }

    @Override
    public List<Subscription> getAllSubscriptions(SubscriptionStatus status) {
        if (status != null) {
            return subscriptionRepository.findByStatus(status);
        }
        return subscriptionRepository.findAll();
    }

    @Override
    public List<Subscription> getExpiringSubscriptionsWithin(int days) {
        LocalDate today = LocalDate.now();
        LocalDate future = today.plusDays(days);
        return subscriptionRepository.findByEndDateBetween(today, future);
    }

    @Override
    public Long countByStatus(SubscriptionStatus status) {
        return subscriptionRepository.countByStatus(status);
    }
}
