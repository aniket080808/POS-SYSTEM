package com.aniket.repository;

import com.aniket.modal.Order;
import com.aniket.modal.Refund;
import com.aniket.modal.User;
import com.aniket.payload.dto.RefundDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface RefundRepository extends JpaRepository<Refund, Long> {

    List<Refund> findByCashierAndCreatedAtBetween(User cashier,
                                                 LocalDateTime start,
                                                 LocalDateTime end);

    List<Refund> findByCashierId(Long cashierId);

    List<Refund> findByShiftReportId(Long shiftReportId);

    List<Refund> findByCashierIdAndCreatedAtBetween(Long cashierId, LocalDateTime from, LocalDateTime to);

    List<Refund> findByBranchId(Long branchId);

    List<Refund> findByBranch_Store_Id(Long storeId);

    // store analysis
    @Query("SELECT COUNT(r) FROM Refund r WHERE r.order.branch.store.storeAdmin.id = :storeAdminId")
    int countByStoreAdminId(@Param("storeAdminId") Long storeAdminId);

    @Query("""
        SELECT new com.aniket.payload.dto.RefundDTO(
                r.id, r.order.id, r.reason, r.amount,
                r.order.cashier.fullName, r.shiftReport.id,
                r.order.branch.id, r.createdAt, null
            )
            FROM Refund r
            WHERE r.order.branch.store.storeAdmin.id = :storeAdminId
            AND r.createdAt >= :startOfToday
            ORDER BY r.createdAt DESC
    """)
    List<RefundDTO> findTodayRefunds(@Param("storeAdminId") Long storeAdminId,
                                     @Param("startOfToday") java.time.LocalDateTime startOfToday);

    @Query("""
        SELECT new com.aniket.payload.dto.RefundDTO(
                r.id, r.order.id, r.reason, r.amount,
                r.order.cashier.fullName, r.shiftReport.id,
                r.order.branch.id, r.createdAt, null
            )
            FROM Refund r
            WHERE r.order.branch.store.storeAdmin.id = :storeAdminId
            AND r.createdAt >= :baselineStart
            AND r.createdAt < :baselineEnd
            ORDER BY r.createdAt DESC
    """)
    List<RefundDTO> findRefundsBetween(@Param("storeAdminId") Long storeAdminId,
                                       @Param("baselineStart") java.time.LocalDateTime baselineStart,
                                       @Param("baselineEnd") java.time.LocalDateTime baselineEnd);

}
