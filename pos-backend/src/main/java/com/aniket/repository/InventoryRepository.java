package com.aniket.repository;

import com.aniket.modal.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Inventory findByProductId(Long productId);
    List<Inventory> findByBranchId(Long branchId);
    java.util.Optional<Inventory> findByBranchIdAndProductId(Long branchId, Long productId);
    boolean existsByBranchIdAndProductId(Long branchId, Long productId);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Inventory i WHERE i.branch.id = :branchId AND i.product.id = :productId")
    java.util.Optional<Inventory> findByBranchIdAndProductIdWithLock(@Param("branchId") Long branchId, @Param("productId") Long productId);

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true)
    @org.springframework.transaction.annotation.Transactional
    @Query("DELETE FROM Inventory i WHERE i.product.id = :productId")
    void deleteByProductId(@Param("productId") Long productId);

    @Query("""
        SELECT COUNT(i)
        FROM Inventory i
        JOIN i.product p
        WHERE i.branch.id = :branchId
        AND i.quantity <= 5
    """)
    int countLowStockItems(@Param("branchId") Long branchId);

}
