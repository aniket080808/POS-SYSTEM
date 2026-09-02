package com.aniket.repository;

import com.aniket.domain.ApprovalRequestStatus;
import com.aniket.domain.ApprovalRequestType;
import com.aniket.modal.ApprovalRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ApprovalRequestRepository extends JpaRepository<ApprovalRequest, Long> {

    List<ApprovalRequest> findByStatus(ApprovalRequestStatus status);

    List<ApprovalRequest> findByTypeAndStatus(ApprovalRequestType type, ApprovalRequestStatus status);

    List<ApprovalRequest> findByType(ApprovalRequestType type);

    List<ApprovalRequest> findByStoreId(Long storeId);

    List<ApprovalRequest> findByStoreIdAndTypeOrderByCreatedAtDesc(Long storeId, ApprovalRequestType type);

    Optional<ApprovalRequest> findFirstByStoreIdAndTypeAndStatusOrderByCreatedAtDesc(
            Long storeId, ApprovalRequestType type, ApprovalRequestStatus status);

    Optional<ApprovalRequest> findFirstByStoreIdAndTypeOrderByCreatedAtDesc(
            Long storeId, ApprovalRequestType type);

    boolean existsByStoreIdAndTypeAndStatus(Long storeId, ApprovalRequestType type, ApprovalRequestStatus status);

    long countByTypeAndStatus(ApprovalRequestType type, ApprovalRequestStatus status);

    @Query("SELECT COUNT(ar) FROM ApprovalRequest ar WHERE (ar.currentPlan IS NOT NULL AND ar.currentPlan.id = :planId) OR (ar.requestedPlan IS NOT NULL AND ar.requestedPlan.id = :planId)")
    long countByPlanId(@Param("planId") Long planId);
}
