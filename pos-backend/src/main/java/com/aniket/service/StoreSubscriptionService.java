package com.aniket.service;

import com.aniket.domain.StoreSubscriptionStatus;
import com.aniket.modal.Store;
import com.aniket.modal.StoreSubscription;
import com.aniket.modal.User;
import com.aniket.payload.dto.StoreSubscriptionDetailDTO;
import com.aniket.payload.response.StoreSubscriptionStatusResponse;

public interface StoreSubscriptionService {

    StoreSubscription getOrCreateForStore(Store store);

    StoreSubscription getByStoreId(Long storeId);

    boolean isSubscriptionActive(Long storeId);

    void updateStatus(Long storeId, StoreSubscriptionStatus status);

    StoreSubscriptionStatusResponse getStatusResponseForUser(User user);

    StoreSubscriptionDetailDTO getDetailByStoreId(Long storeId);
}
