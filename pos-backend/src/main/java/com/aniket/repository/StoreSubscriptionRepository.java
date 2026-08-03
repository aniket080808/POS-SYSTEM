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

    @Query("SELECT COUNT(ss) FROM StoreSubscription ss WHERE ss.currentPlan.id = :planId")
    long countByCurrentPlanId(@Param("planId") Long planId);
}
