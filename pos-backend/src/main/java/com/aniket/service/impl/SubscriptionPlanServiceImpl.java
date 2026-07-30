package com.aniket.service.impl;

import com.aniket.service.SubscriptionPlanService;



import com.aniket.exception.ResourceNotFoundException;
import com.aniket.modal.SubscriptionPlan;
import com.aniket.repository.SubscriptionPlanRepository;
import com.aniket.service.SubscriptionPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubscriptionPlanServiceImpl implements SubscriptionPlanService {

    private final SubscriptionPlanRepository subscriptionPlanRepository;

    /**
     * ➕ Create new plan
     */
    @Override
    public SubscriptionPlan createPlan(SubscriptionPlan plan) {
        return subscriptionPlanRepository.save(plan);
    }

    /**
     * 🔄 Update existing plan
     */
    @Override
    public SubscriptionPlan updatePlan(Long id, SubscriptionPlan updatedPlan) throws ResourceNotFoundException {
        SubscriptionPlan existing = subscriptionPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription plan not found with id: " + id));

        existing.setName(updatedPlan.getName());
        existing.setDescription(updatedPlan.getDescription());
        existing.setPrice(updatedPlan.getPrice());
        existing.setBillingCycle(updatedPlan.getBillingCycle());

        existing.setMaxBranches(updatedPlan.getMaxBranches());
        existing.setMaxUsers(updatedPlan.getMaxUsers());
        existing.setMaxProducts(updatedPlan.getMaxProducts());

        existing.setEnableAdvancedReports(updatedPlan.getEnableAdvancedReports());
        existing.setEnableInventory(updatedPlan.getEnableInventory());
        existing.setEnableIntegrations(updatedPlan.getEnableIntegrations());
        existing.setEnableEcommerce(updatedPlan.getEnableEcommerce());
        existing.setEnableInvoiceBranding(updatedPlan.getEnableInvoiceBranding());
        existing.setPrioritySupport(updatedPlan.getPrioritySupport());
        existing.setEnableMultiLocation(updatedPlan.getEnableMultiLocation());

        existing.setExtraFeatures(updatedPlan.getExtraFeatures());
        
        // Add active status to updates, fallback to true if null just in case
        if (updatedPlan.getActive() != null) {
            existing.setActive(updatedPlan.getActive());
        }

        return subscriptionPlanRepository.save(existing);
    }

    /**
     * 🔍 Get plan by ID
     */
    @Override
    public SubscriptionPlan getPlanById(Long id) throws ResourceNotFoundException {
        return subscriptionPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription plan not found with id: " + id));
    }

    /**
     * 📦 Get all plans
     */
    @Override
    public List<SubscriptionPlan> getAllPlans() {
        return subscriptionPlanRepository.findAll();
    }

    /**
     * ❌ Delete plan
     */
    @Override
    public void deletePlan(Long id) throws ResourceNotFoundException {
        if (!subscriptionPlanRepository.existsById(id)) {
            throw new ResourceNotFoundException("Subscription plan not found with id: " + id);
        }
        subscriptionPlanRepository.deleteById(id);
    }
}
