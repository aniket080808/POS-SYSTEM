package com.aniket.repository;

import com.aniket.modal.BranchInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BranchInventoryRepository extends JpaRepository<BranchInventory, Long> {
    List<BranchInventory> findByStoreId(Long storeId);
    
    List<BranchInventory> findByProductId(Long productId);
    
    Optional<BranchInventory> findByStoreIdAndProductId(Long storeId, Long productId);
    
    @Query("SELECT bi FROM BranchInventory bi WHERE bi.store.id = :storeId AND bi.product.id = :productId")
    Optional<BranchInventory> findByStoreIdAndProductIdNative(@Param("storeId") Long storeId, @Param("productId") Long productId);
    
    boolean existsByStoreIdAndProductId(Long storeId, Long productId);
    
    @Query("SELECT COUNT(bi) FROM BranchInventory bi WHERE bi.store.id = :storeId")
    long countByStoreId(@Param("storeId") Long storeId);
    
    @Query("SELECT COUNT(DISTINCT bi.product.id) FROM BranchInventory bi WHERE bi.store.storeAdmin.id = :storeAdminId")
    long countByStoreAdminId(@Param("storeAdminId") Long storeAdminId);
}