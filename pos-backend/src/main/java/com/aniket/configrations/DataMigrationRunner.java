package com.aniket.configrations;

import com.aniket.domain.StoreSubscriptionStatus;
import com.aniket.domain.SubscriptionStatus;
import com.aniket.modal.Store;
import com.aniket.modal.StoreSubscription;
import com.aniket.modal.Subscription;
import com.aniket.repository.StoreRepository;
import com.aniket.repository.StoreSubscriptionRepository;
import com.aniket.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataMigrationRunner implements ApplicationRunner {

    private final StoreRepository storeRepository;
    private final StoreSubscriptionRepository storeSubscriptionRepository;
    private final SubscriptionRepository subscriptionRepository;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        log.info("🔄 Running StoreSubscription Data Migration...");

        List<Store> allStores = storeRepository.findAll();
        int createdCount = 0;

        for (Store store : allStores) {
            if (!storeSubscriptionRepository.existsByStoreId(store.getId())) {
                List<Subscription> activeSubs = subscriptionRepository.findByStoreAndStatus(store, SubscriptionStatus.ACTIVE);

                StoreSubscription storeSub = new StoreSubscription();
                storeSub.setStore(store);

                if (!activeSubs.isEmpty()) {
                    Subscription activeSub = activeSubs.get(0);
                    storeSub.setStatus(StoreSubscriptionStatus.ACTIVE);
                    storeSub.setCurrentPlan(activeSub.getPlan());
                    log.info("✅ Migrated active store subscription for store ID {}: plan {}", store.getId(), activeSub.getPlan().getName());
                } else {
                    storeSub.setStatus(StoreSubscriptionStatus.NONE);
                    log.info("ℹ️ Initialized NONE store subscription for store ID {}", store.getId());
                }

                storeSubscriptionRepository.save(storeSub);
                createdCount++;
            }
        }

        log.info("✅ StoreSubscription Data Migration completed. Initialized {} stores.", createdCount);
    }
}
