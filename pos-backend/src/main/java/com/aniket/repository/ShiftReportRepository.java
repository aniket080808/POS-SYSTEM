package com.aniket.repository;



import com.aniket.modal.ShiftReport;
import com.aniket.modal.User;
import com.aniket.modal.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ShiftReportRepository extends JpaRepository<ShiftReport, Long> {

    /**
     * Get all shift reports for a specific cashier.
     */
    List<ShiftReport> findByCashier(User cashier);

    /**
     * Get all shift reports for a specific branch.
     */
    List<ShiftReport> findByBranch(Branch branch);

    /**
     * Get latest open shift for a cashier (where shiftEnd is null).
     */
    Optional<ShiftReport> findTopByCashierAndShiftEndIsNullOrderByShiftStartDesc(User cashier);

    /**
     * Get shift report for a specific date for a cashier.
     */
    Optional<ShiftReport> findByCashierAndShiftStartBetween(User cashier, LocalDateTime start, LocalDateTime end);

    /**
     * Count active shifts (where shiftEnd is null) for a branch strictly for ROLE_BRANCH_CASHIER.
     */
    @Query("""
        SELECT COUNT(s)
        FROM ShiftReport s
        WHERE s.branch.id = :branchId
        AND s.shiftEnd IS NULL
        AND s.cashier.role = com.aniket.domain.UserRole.ROLE_BRANCH_CASHIER
    """)
    int countByBranchIdAndShiftEndIsNull(@Param("branchId") Long branchId);
}
