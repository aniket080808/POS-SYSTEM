package com.aniket.repository;

import com.aniket.modal.Branch;
import com.aniket.payload.dto.BranchDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface BranchRepository extends JpaRepository<Branch, Long> {

    List<Branch> findByStoreId(Long storeId);
    List<Branch> findByStoreIdAndIsActiveTrue(Long storeId);





    @Query("SELECT COUNT(b) FROM Branch b WHERE b.store.storeAdmin.id = :storeAdminId AND b.isActive = true")
    int countByStoreAdminId(@Param("storeAdminId") Long storeAdminId);

    @Query("""
        SELECT COUNT(b)
        FROM Branch b
        WHERE b.store.storeAdmin.id = :storeAdminId
        AND MONTH(b.createdAt) = MONTH(CURRENT_DATE)
    """)
    int countNewBranchesThisMonth(@Param("storeAdminId") Long storeAdminId);

    @Query("""
        SELECT b.name
        FROM Branch b
        JOIN Order o ON o.branch.id = b.id
        WHERE b.store.storeAdmin.id = :storeAdminId
        AND b.isActive = true
        AND o.status = com.aniket.domain.OrderStatus.COMPLETED
        GROUP BY b.id, b.name
        ORDER BY SUM(o.totalAmount) DESC
    """)
    List<String> findTopBranchBySales(@Param("storeAdminId") Long storeAdminId);

    @Query("""
        SELECT new com.aniket.payload.dto.BranchDTO(
        b.id, b.name, b.address
        )
        FROM Branch b
        WHERE b.store.storeAdmin.id = :storeAdminId
        AND b.isActive = true
        AND (
            SIZE(b.workingDays) = 0
            OR :dayOfWeek MEMBER OF b.workingDays
        )
        AND b.id NOT IN (
            SELECT DISTINCT o.branch.id
            FROM Order o
            WHERE o.createdAt >= :startOfToday
        AND o.status = com.aniket.domain.OrderStatus.COMPLETED
        )
    """)
    List<BranchDTO> findBranchesWithNoSalesToday(@Param("storeAdminId") Long storeAdminId,
                                                 @Param("startOfToday") LocalDateTime startOfToday,
                                                 @Param("dayOfWeek") String dayOfWeek);

}
