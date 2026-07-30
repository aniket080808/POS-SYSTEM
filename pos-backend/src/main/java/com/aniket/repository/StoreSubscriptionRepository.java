package com.aniket.repository;

import com.aniket.modal.Store;
import com.aniket.modal.StoreSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StoreSubscriptionRepository extends JpaRepository<StoreSubscription, Long> {

    Optional<StoreSubscription> findByStoreId(Long storeId);

    Optional<StoreSubscription> findByStore(Store store);

    boolean existsByStoreId(Long storeId);
}
