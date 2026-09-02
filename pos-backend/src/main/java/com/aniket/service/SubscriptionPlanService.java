package com.aniket.service;



import com.aniket.exception.ResourceNotFoundException;
import com.aniket.modal.SubscriptionPlan;

import java.util.List;

public interface SubscriptionPlanService {

    /**
     * ➕ Create a new subscription plan
     * Only Super Admin can perform this action.
     *
     * @param plan the plan details to create
     * @return created SubscriptionPlan
     */
    SubscriptionPlan createPlan(SubscriptionPlan plan);

    /**
     * 🔄 Update an existing subscription plan
     * Super Admin can change price, features, limits, etc.
     *
     * @param id the plan ID
     * @param updatedPlan the new values
     * @return updated SubscriptionPlan
     */
    SubscriptionPlan updatePlan(Long id, SubscriptionPlan updatedPlan) throws ResourceNotFoundException;

    /**
     * 🔍 Get a single plan by ID
     *
     * @param id the plan ID
     * @return SubscriptionPlan details
     */
    SubscriptionPlan getPlanById(Long id) throws ResourceNotFoundException;

    /**
     * 📦 Get all available subscription plans (active only)
     * Used for public pricing page and onboarding
     *
     * @return list of active SubscriptionPlans
     */
    List<SubscriptionPlan> getAllPlans();

    /**
     * 👑 Get all subscription plans for Super Admin (active + inactive)
     *
     * @return list of all SubscriptionPlans
     */
    List<SubscriptionPlan> getAllPlansForAdmin();

    /**
     * ❌ Delete a plan by ID
     * Only if no store is subscribed to it (optional business rule)
     *
     * @param id plan ID
     */
    void deletePlan(Long id) throws ResourceNotFoundException;
}
