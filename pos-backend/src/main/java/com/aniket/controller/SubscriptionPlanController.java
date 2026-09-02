package com.aniket.controller;


import com.aniket.exception.ResourceNotFoundException;
import com.aniket.modal.SubscriptionPlan;
import com.aniket.service.SubscriptionPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SubscriptionPlanController {

    private final SubscriptionPlanService subscriptionPlanService;

    // 🔓 Public read-only endpoint for store admins/owners to view available plans
    @GetMapping("/api/subscription-plans")
    public List<SubscriptionPlan> getAvailablePlans() {
        return subscriptionPlanService.getAllPlans();
    }

    // 🔒 Super Admin only endpoints below
    @RestController
    @RequestMapping("/api/super-admin/subscription-plans")
    @PreAuthorize("hasRole('ADMIN')")
    @RequiredArgsConstructor
    public class SuperAdminSubscriptionPlanController {

        private final SubscriptionPlanService subscriptionPlanService;

        /**
         * ➕ Create a new subscription plan
         * @param plan SubscriptionPlan entity
         */
        @PostMapping
        public SubscriptionPlan createPlan(@RequestBody SubscriptionPlan plan) {
            return subscriptionPlanService.createPlan(plan);
        }

        /**
         * 🔄 Update an existing subscription plan by ID
         * @param id SubscriptionPlan ID
         * @param plan Updated plan data
         */
        @PutMapping("/{id}")
        public SubscriptionPlan updatePlan(
                @PathVariable Long id,
                @RequestBody SubscriptionPlan plan
        ) throws ResourceNotFoundException {
            return subscriptionPlanService.updatePlan(id, plan);
        }

        /**
         * 📦 Get all subscription plans (active + inactive for Super Admin)
         */
        @GetMapping
        public List<SubscriptionPlan> getAllPlans() {
            return subscriptionPlanService.getAllPlansForAdmin();
        }

        /**
         * 🔍 Get a single subscription plan by ID
         */
        @GetMapping("/{id}")
        public SubscriptionPlan getPlanById(@PathVariable Long id) throws ResourceNotFoundException {
            return subscriptionPlanService.getPlanById(id);
        }

        /**
         * ❌ Delete a subscription plan by ID
         */
        @DeleteMapping("/{id}")
        public void deletePlan(@PathVariable Long id) throws ResourceNotFoundException {
            subscriptionPlanService.deletePlan(id);
        }
    }
}
