package com.aniket.repository;

import com.aniket.modal.Order;
import com.aniket.modal.User;
import com.aniket.payload.StoreAnalysis.BranchSalesDTO;
import com.aniket.payload.StoreAnalysis.PaymentInsightDTO;
import com.aniket.payload.StoreAnalysis.RecentSaleDTO;
import com.aniket.payload.StoreAnalysis.TimeSeriesPointDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<Order> {
    Optional<Order> findByOfflineId(String offlineId);
    List<Order> findByCustomerId(Long customerId);
    List<Order> findByBranchId(Long branchId);
    List<Order> findByCashierId(Long cashierId);
    Long countByCashierId(Long cashierId);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0.0) FROM Order o WHERE o.cashier.id = :cashierId AND o.status = com.aniket.domain.OrderStatus.COMPLETED")
    Double sumTotalAmountByCashierId(@Param("cashierId") Long cashierId);
    List<Order> findByBranchIdAndCreatedAtBetween(Long branchId,
                                                  LocalDateTime start,
                                                  LocalDateTime end);
    List<Order> findByCashierAndCreatedAtBetween(User cashier,
                                                 LocalDateTime start,
                                                 LocalDateTime end);
    List<Order> findTop5ByBranchIdOrderByCreatedAtDesc(Long branchId);

    @Query(""" 
            SELECT SUM(o.totalAmount) 
            FROM Order o 
            WHERE o.branch.id = :branchId  
            AND o.status = com.aniket.domain.OrderStatus.COMPLETED
            AND o.createdAt BETWEEN :start AND :end
           """)
    Optional<BigDecimal> getTotalSalesBetween(@Param("branchId") Long branchId,
                                              @Param("start") LocalDateTime start,
                                              @Param("end") LocalDateTime end);

    @Query("""
        SELECT u.id, u.fullName, SUM(o.totalAmount) AS totalRevenue
        FROM Order o
        JOIN o.cashier u
        WHERE o.branch.id = :branchId
        AND o.status = com.aniket.domain.OrderStatus.COMPLETED
        AND u.role = com.aniket.domain.UserRole.ROLE_BRANCH_CASHIER
        GROUP BY u.id, u.fullName
        ORDER BY totalRevenue DESC
    """)
    List<Object[]> getTopCashiersByRevenue(@Param("branchId") Long branchId);

    @Query("""
        SELECT COUNT(o)
        FROM Order o
        WHERE o.branch.id = :branchId
        AND o.status = com.aniket.domain.OrderStatus.COMPLETED
        AND DATE(o.createdAt) = :date
    """)
    int countOrdersByBranchAndDate(@Param("branchId") Long branchId,
                                   @Param("date") LocalDate date);

    @Query("""
        SELECT COUNT(DISTINCT o.cashier.id)
        FROM Order o
        WHERE o.branch.id = :branchId
        AND o.status = com.aniket.domain.OrderStatus.COMPLETED
        AND o.cashier.role = com.aniket.domain.UserRole.ROLE_BRANCH_CASHIER
        AND DATE(o.createdAt) = :date
    """)
    int countDistinctCashiersByBranchAndDate(@Param("branchId") Long branchId,
                                             @Param("date") LocalDate date);

    @Query("""
    SELECT o.paymentType, SUM(o.totalAmount), COUNT(o)
    FROM Order o
    WHERE o.branch.id = :branchId
    AND o.status = com.aniket.domain.OrderStatus.COMPLETED
    AND DATE(o.createdAt) = :date
    GROUP BY o.paymentType
""")
    List<Object[]> getPaymentBreakdownByMethod(
            @Param("branchId") Long branchId,
            @Param("date") LocalDate date
    );

    @Query("""
    SELECT o.paymentType, SUM(o.totalAmount), COUNT(o)
    FROM Order o
    WHERE o.branch.id = :branchId
    AND o.status = com.aniket.domain.OrderStatus.COMPLETED
    AND o.createdAt BETWEEN :start AND :end
    GROUP BY o.paymentType
""")
    List<Object[]> getPaymentBreakdownBetween(
            @Param("branchId") Long branchId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("""
    SELECT o.paymentType, SUM(o.totalAmount), COUNT(o)
    FROM Order o
    WHERE o.branch.id = :branchId
    AND o.status = com.aniket.domain.OrderStatus.COMPLETED
    GROUP BY o.paymentType
""")
    List<Object[]> getAllTimePaymentBreakdown(
            @Param("branchId") Long branchId
    );

    ////////////////////
    // Dashboard page queries (all-time totals, filtered to completed)
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.branch.store.storeAdmin.id = :storeAdminId AND o.status = com.aniket.domain.OrderStatus.COMPLETED")
    Optional<Double> sumTotalSalesByStoreAdmin(@Param("storeAdminId") Long storeAdminId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.branch.store.storeAdmin.id = :storeAdminId AND o.status = com.aniket.domain.OrderStatus.COMPLETED")
    int countByStoreAdminId(@Param("storeAdminId") Long storeAdminId);
    ////////////////////

    @Query("""
    SELECT o FROM Order o 
    WHERE o.branch.store.storeAdmin.id = :storeAdminId 
    AND o.createdAt BETWEEN :start AND :end
 """)
    List<Order> findAllByStoreAdminAndCreatedAtBetween(@Param("storeAdminId") Long storeAdminId,
                                                       @Param("start") LocalDateTime start,
                                                       @Param("end") LocalDateTime end);

    // Sales Management: count COMPLETED orders for a date range with status filter
    @Query("""
        SELECT COUNT(o)
        FROM Order o
        WHERE o.branch.store.storeAdmin.id = :storeAdminId
        AND o.status = com.aniket.domain.OrderStatus.COMPLETED
        AND o.createdAt BETWEEN :start AND :end
    """)
    int countCompletedOrdersByStoreAdminAndDateRange(@Param("storeAdminId") Long storeAdminId,
                                                     @Param("start") LocalDateTime start,
                                                     @Param("end") LocalDateTime end);

    // Sales Management: sum COMPLETED orders for a date range with status filter
    @Query("""
        SELECT COALESCE(SUM(o.totalAmount), 0.0)
        FROM Order o
        WHERE o.branch.store.storeAdmin.id = :storeAdminId
        AND o.status = com.aniket.domain.OrderStatus.COMPLETED
        AND o.createdAt BETWEEN :start AND :end
    """)
    Double sumCompletedSalesByStoreAdminAndDateRange(@Param("storeAdminId") Long storeAdminId,
                                                     @Param("start") LocalDateTime start,
                                                     @Param("end") LocalDateTime end);

    // Sales Management: Daily Sales - native query to avoid JPQL FUNCTION('DATE', ...) type-mapping issues
    // PostgreSQL's DATE(o.created_at) returns a proper date type that Hibernate maps to LocalDate
    @Query(value = """
        SELECT DATE(o.created_at) AS sale_date, SUM(o.total_amount) AS total
        FROM orders o
        JOIN branches b ON o.branch_id = b.id
        JOIN stores s ON b.store_id = s.id
        WHERE s.store_admin_id = :storeAdminId
          AND o.status = 0
          AND o.created_at BETWEEN :start AND :end
        GROUP BY DATE(o.created_at)
        ORDER BY DATE(o.created_at)
    """, nativeQuery = true)
    List<Object[]> getDailySales(@Param("storeAdminId") Long storeAdminId,
                                 @Param("start") LocalDateTime start,
                                 @Param("end") LocalDateTime end);

    // Sales Management: Payment Methods - added COMPLETED status filter
    @Query("""
        SELECT new com.aniket.payload.StoreAnalysis.PaymentInsightDTO(
            o.paymentType,
            SUM(o.totalAmount)
        )
        FROM Order o
        WHERE o.branch.store.storeAdmin.id = :storeAdminId
          AND o.status = com.aniket.domain.OrderStatus.COMPLETED
        GROUP BY o.paymentType
    """)
    List<PaymentInsightDTO> getSalesByPaymentMethod(@Param("storeAdminId") Long storeAdminId);

    @Query("""
        SELECT new com.aniket.payload.StoreAnalysis.RecentSaleDTO(
            o.branch.name,
            o.totalAmount,
            o.createdAt
        )
        FROM Order o
        WHERE o.branch.store.storeAdmin.id = :storeAdminId
        ORDER BY o.createdAt DESC
    """)
    List<RecentSaleDTO> findRecentSalesByStoreAdmin(@Param("storeAdminId") Long storeAdminId, org.springframework.data.domain.Pageable pageable);

    @Query("""
        SELECT new com.aniket.payload.StoreAnalysis.BranchSalesDTO(
            o.branch.name,
            SUM(o.totalAmount)
        )
        FROM Order o
        WHERE o.branch.store.storeAdmin.id = :storeAdminId
        GROUP BY o.branch.id
    """)
    List<BranchSalesDTO> getSalesByBranch(@Param("storeAdminId") Long storeAdminId);

    @Query("""
        SELECT o FROM Order o
        WHERE o.branch.store.storeAdmin.id = :storeAdminId
          AND (:branchId IS NULL OR o.branch.id = :branchId)
          AND (:customerId IS NULL OR (o.customer IS NOT NULL AND o.customer.id = :customerId))
          AND (:cashierId IS NULL OR (o.cashier IS NOT NULL AND o.cashier.id = :cashierId))
          AND (:paymentType IS NULL OR o.paymentType = :paymentType)
          AND (:status IS NULL OR o.status = :status)
          AND (:start IS NULL OR o.createdAt >= :start)
          AND (:end IS NULL OR o.createdAt <= :end)
    """)
    org.springframework.data.domain.Page<Order> findOrdersWithFilters(
            @Param("storeAdminId") Long storeAdminId,
            @Param("branchId") Long branchId,
            @Param("customerId") Long customerId,
            @Param("cashierId") Long cashierId,
            @Param("paymentType") com.aniket.domain.PaymentType paymentType,
            @Param("status") com.aniket.domain.OrderStatus status,
            @Param("start") java.time.LocalDateTime start,
            @Param("end") java.time.LocalDateTime end,
            org.springframework.data.domain.Pageable pageable
    );

    @Query("SELECT COUNT(o) FROM Order o WHERE o.branch.store.id = :storeId AND o.customer IS NOT NULL")
    long countCustomerOrdersByStoreId(@Param("storeId") Long storeId);

    @Query("""
        SELECT COUNT(o)
        FROM Order o
        WHERE o.branch.store.id = :storeId
          AND o.createdAt BETWEEN :start AND :end
    """)
    Long countByStoreIdAndCreatedAtBetween(@Param("storeId") Long storeId,
                                           @Param("start") LocalDateTime start,
                                           @Param("end") LocalDateTime end);
}