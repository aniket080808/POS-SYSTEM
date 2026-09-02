package com.aniket.repository;

import com.aniket.modal.HeldOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HeldOrderRepository extends JpaRepository<HeldOrder, Long> {
    List<HeldOrder> findByBranchIdOrderByCreatedAtDesc(Long branchId);
    List<HeldOrder> findByCashierIdOrderByCreatedAtDesc(Long cashierId);
    List<HeldOrder> findByStoreIdOrderByCreatedAtDesc(Long storeId);
}

