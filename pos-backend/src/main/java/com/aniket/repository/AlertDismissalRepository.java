package com.aniket.repository;

import com.aniket.modal.AlertDismissal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AlertDismissalRepository extends JpaRepository<AlertDismissal, Long> {
    List<AlertDismissal> findByStoreId(Long storeId);
    List<AlertDismissal> findByStoreIdAndAlertType(Long storeId, String alertType);
    List<AlertDismissal> findByStoreIdAndAlertTypeAndReferenceId(Long storeId, String alertType, String referenceId);
}
