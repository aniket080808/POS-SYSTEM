package com.aniket.controller;

import com.aniket.domain.PaymentGateway;
import com.aniket.domain.PaymentStatus;
import com.aniket.domain.SubscriptionStatus;
import com.aniket.exception.PaymentException;
import com.aniket.modal.Subscription;
import com.aniket.payload.response.PaymentInitiateResponse;
import com.aniket.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;


    // 🆕 Store subscribes to a plan (TRIAL or NEW)
    @PostMapping("/subscribe")
    @PreAuthorize("hasAnyRole('STORE_ADMIN', 'ADMIN')")
    public ResponseEntity<?> createSubscription(
            @RequestParam Long storeId,
            @RequestParam Long planId,
            @RequestParam(defaultValue = "RAZORPAY") PaymentGateway gateway,
            @RequestParam(required = false) String transactionId
    ) throws PaymentException {


        PaymentInitiateResponse res=subscriptionService.createSubscription(storeId, planId, gateway, transactionId);
        return ResponseEntity.ok(res);
    }

    // 🔁 Store upgrades to a new plan (ACTIVE)
    @PostMapping("/upgrade")
    @PreAuthorize("hasAnyRole('STORE_ADMIN', 'ADMIN')")
    public ResponseEntity<?> upgradePlan(
            @RequestParam Long storeId,
            @RequestParam Long planId,
            @RequestParam(defaultValue = "RAZORPAY") PaymentGateway gateway,
            @RequestParam(required = false) String transactionId
    ) throws PaymentException {

        PaymentInitiateResponse res= subscriptionService.upgradeSubscription(storeId, planId, gateway, transactionId);
        return ResponseEntity.ok(res);
    }

    // ✅ Admin activates a subscription
    @PutMapping("/{subscriptionId}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public Subscription activateSubscription(@PathVariable Long subscriptionId) {
        return subscriptionService.activateSubscription(subscriptionId);
    }

    // ❌ Admin cancels a subscription
    @PutMapping("/{subscriptionId}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public Subscription cancelSubscription(@PathVariable Long subscriptionId) {
        return subscriptionService.cancelSubscription(subscriptionId);
    }

    // 💳 Update payment status manually (if needed)
    @PutMapping("/{subscriptionId}/payment-status")
    @PreAuthorize("hasRole('ADMIN')")
    public Subscription updatePaymentStatus(
            @PathVariable Long subscriptionId,
            @RequestParam PaymentStatus status
    ) {
        return subscriptionService.updatePaymentStatus(subscriptionId, status);
    }

    // 📦 Store: Get all subscriptions (or by status)
    @GetMapping("/store/{storeId}")
    @PreAuthorize("hasAnyRole('STORE_ADMIN', 'STORE_MANAGER', 'ADMIN')")
    public List<Subscription> getStoreSubscriptions(
            @PathVariable Long storeId,
            @RequestParam(required = false) SubscriptionStatus status
    ) {
        return subscriptionService.getSubscriptionsByStore(storeId, status);
    }

    // 🗂️ Admin: Get all subscriptions (optionally filter by status)
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Subscription> getAllSubscriptions(
            @RequestParam(required = false) SubscriptionStatus status
    ) {
        return subscriptionService.getAllSubscriptions(status);
    }

    // ⌛ Admin: Get subscriptions expiring within X days
    @GetMapping("/admin/expiring")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Subscription> getExpiringSubscriptions(
            @RequestParam(defaultValue = "7") int days
    ) {
        return subscriptionService.getExpiringSubscriptionsWithin(days);
    }

    // 📊 Count total subscriptions by status
    @GetMapping("/admin/count")
    @PreAuthorize("hasRole('ADMIN')")
    public Long countByStatus(
            @RequestParam SubscriptionStatus status
    ) {
        return subscriptionService.countByStatus(status);
    }
}
