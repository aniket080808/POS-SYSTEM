package com.aniket.repository;

import com.aniket.modal.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    List<Customer> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String fullName, String email);

    // Store-scoped queries
    List<Customer> findByStoreId(Long storeId);

    List<Customer> findByStoreIdAndFullNameContainingIgnoreCaseOrStoreIdAndEmailContainingIgnoreCase(
            Long storeId1, String fullName, Long storeId2, String email);

    //    analysis
    @Query("""
            SELECT COUNT(DISTINCT o.customer.id)
            FROM Order o
            WHERE o.branch.store.storeAdmin.id = :storeAdminId
        """)
    int countByStoreAdminId(@Param("storeAdminId") Long storeAdminId);

    long countByStoreId(Long storeId);

    @Query("SELECT COUNT(c) FROM Customer c WHERE c.store.id = :storeId AND LOWER(c.loyaltyStatus) = LOWER(:status)")
    long countByStoreIdAndLoyaltyStatusIgnoreCase(@Param("storeId") Long storeId, @Param("status") String status);
}

