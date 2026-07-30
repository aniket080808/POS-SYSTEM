package com.aniket.repository;

import com.aniket.domain.SubscriptionStatus;
import com.aniket.modal.Store;
import com.aniket.modal.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    // 📌 Get all subscriptions for a store
    List<Subscription> findByStore(Store store);

    // 📌 Get subscriptions by store + status
    List<Subscription> findByStoreAndStatus(Store store, SubscriptionStatus status);

    // 📌 Admin: Get all subscriptions with a specific status
    List<Subscription> findByStatus(SubscriptionStatus status);

    // ⏳ Get subscriptions expiring within a date range
    List<Subscription> findByEndDateBetween(LocalDate startDate, LocalDate endDate);

    // 🔢 Count by status (dashboard, stats)
    Long countByStatus(SubscriptionStatus status);
}
