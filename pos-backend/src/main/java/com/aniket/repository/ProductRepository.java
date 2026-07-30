package com.aniket.repository;

import com.aniket.modal.Product;
import com.aniket.payload.StoreAnalysis.CategorySalesDTO;
import com.aniket.payload.dto.ProductDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query("SELECT p FROM Product p " +
            "JOIN BranchInventory bi ON bi.product.id = p.id " +
            "WHERE bi.store.id = :storeId AND (" +
            "LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(p.category.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :query, '%'))" +
            ")"
    )
    List<Product> searchByKeyword(@Param("storeId") Long storeId,
                                  @Param("query") String query);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.category.id = :categoryId")
    int countByCategoryId(@Param("categoryId") Long categoryId);

    @Query("""
        SELECT new com.aniket.payload.StoreAnalysis.CategorySalesDTO(
            p.category.name,
            SUM(oi.quantity * bi.sellingPrice)
        )
        FROM OrderItem oi
        JOIN oi.product p
        JOIN BranchInventory bi ON bi.product.id = p.id
        JOIN bi.store s
        WHERE s.storeAdmin.id = :storeAdminId
        GROUP BY p.category.name
    """)
    List<CategorySalesDTO> getSalesGroupedByCategory(@Param("storeAdminId") Long storeAdminId);

    @Query("""
        SELECT new com.aniket.payload.dto.ProductDTO(
            p.id, p.name, p.sku, p.description, p.mrp,
            p.brand, p.image, p.category.id, p.category.name,
            p.createdAt, p.updatedAt, bi.store.id, bi.store.brand,
            bi.stock, bi.sellingPrice, bi.isActive
        )
        FROM Product p
        JOIN BranchInventory bi ON bi.product.id = p.id
        JOIN bi.store s
        WHERE s.storeAdmin.id = :storeAdminId
        AND bi.stock < :threshold
        AND bi.isActive = true
        ORDER BY bi.stock ASC
    """)
    List<ProductDTO> findLowStockProducts(@Param("storeAdminId") Long storeAdminId,
                                          @Param("threshold") Integer threshold);

    boolean existsBySku(String sku);
    
    Optional<Product> findBySku(String sku);
}