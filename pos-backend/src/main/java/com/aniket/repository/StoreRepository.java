package com.aniket.repository;

import com.aniket.domain.StoreStatus;
import com.aniket.modal.Store;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface StoreRepository extends JpaRepository<Store, Long> {

    Store findByStoreAdminId(Long storeAdminId);

    List<Store> findByStatus(StoreStatus storeStatus);

    // For duplicate contact checks
    List<Store> findByContact_Email(String email);

    List<Store> findByContact_Phone(String phone);

//    analysis
    Long countByStatus(StoreStatus status);

    @Query("""
        SELECT COUNT(s)
        FROM Store s
        WHERE DATE(s.createdAt) = :date
    """)
    Long countByDate(LocalDate date);

    @Query("""
    SELECT DATE(s.createdAt) AS regDate, COUNT(s) AS count
    FROM Store s
    WHERE s.createdAt >= :startDate
    GROUP BY DATE(s.createdAt)
    ORDER BY regDate ASC
""")
    List<Object[]> getStoreRegistrationStats(@Param("startDate") LocalDateTime startDate);

    @Query("""
        SELECT s FROM Store s
        LEFT JOIN s.storeAdmin sa
        WHERE (:status IS NULL OR s.status = :status)
          AND (
            :search IS NULL OR :search = ''
            OR LOWER(s.brand) LIKE :search
            OR LOWER(sa.fullName) LIKE :search
            OR LOWER(s.contact.email) LIKE :search
            OR LOWER(s.contact.phone) LIKE :search
          )
    """)
    Page<Store> searchStores(@Param("status") StoreStatus status,
                             @Param("search") String search,
                             Pageable pageable);
}
