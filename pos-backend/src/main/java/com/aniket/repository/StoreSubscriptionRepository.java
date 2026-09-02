package com.aniket.repository;

import com.aniket.modal.Store;
import com.aniket.modal.StoreSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface StoreSubscriptionRepository extends JpaRepository<StoreSubscription, Long> {

    Optional<StoreSubscription> findByStoreId(Long storeId);

    Optional<StoreSubscription> findByStore(Store store);

    boolean existsByStoreId(Long storeId);

    @Query("SELECT COUNT(ss) FROM StoreSubscription ss WHERE (ss.currentPlan IS NOT NULL AND ss.currentPlan.id = :planId) OR (ss.requestedPlan IS NOT NULL AND ss.requestedPlan.id = :planId)")
    long countByPlanId(@Param("planId") Long planId);

    @Query("SELECT COUNT(ss) FROM StoreSubscription ss WHERE ss.currentPlan IS NOT NULL AND ss.currentPlan.id = :planId AND ss.status = 'ACTIVE'")
    long countActiveStoresByPlanId(@Param("planId") Long planId);
}
