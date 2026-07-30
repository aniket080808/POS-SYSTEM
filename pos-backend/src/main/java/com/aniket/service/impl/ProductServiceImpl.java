package com.aniket.service.impl;

import com.aniket.domain.UserRole;
import com.aniket.exception.AccessDeniedException;
import com.aniket.mapper.BranchInventoryMapper;
import com.aniket.mapper.ProductMapper;
import com.aniket.modal.BranchInventory;
import com.aniket.modal.Category;
import com.aniket.modal.Product;
import com.aniket.modal.Store;
import com.aniket.modal.User;
import com.aniket.payload.dto.ProductDTO;
import com.aniket.repository.BranchInventoryRepository;
import com.aniket.repository.CategoryRepository;
import com.aniket.repository.ProductRepository;
import com.aniket.repository.StoreRepository;
import com.aniket.service.ProductService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final StoreRepository storeRepository;
    private final CategoryRepository categoryRepository;
    private final BranchInventoryRepository branchInventoryRepository;

    @Override
    @Transactional
    public ProductDTO createProduct(ProductDTO dto, User user) throws AccessDeniedException {
        Store store = storeRepository.findById(dto.getStoreId())
                .orElseThrow(() -> new EntityNotFoundException("Store not found"));

        checkAuthority(store, user);

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));

        // Check if SKU already exists globally
        if (productRepository.existsBySku(dto.getSku())) {
            throw new DataIntegrityViolationException("Product with SKU '" + dto.getSku() + "' already exists");
        }

        // Create the product (catalog only)
        Product product = ProductMapper.toEntity(dto, store);
        product.setCategory(category);
        product = productRepository.save(product);

        // Create branch inventory entry
        BranchInventory inventory = BranchInventory.builder()
                .store(store)
                .product(product)
                .stock(dto.getStock() != null ? dto.getStock() : 0)
                .sellingPrice(dto.getSellingPrice() != null ? dto.getSellingPrice() : dto.getMrp())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();
        branchInventoryRepository.save(inventory);

        return ProductMapper.toDto(product, inventory);
    }

    @Override
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));
        
        BranchInventory inventory = branchInventoryRepository
                .findByProductId(id)
                .stream()
                .findFirst()
                .orElse(null);
        
        return ProductMapper.toDto(product, inventory);
    }

    @Override
    @Transactional
    public ProductDTO updateProduct(Long id, ProductDTO dto, User user) throws AccessDeniedException {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));

        Category category = categoryRepository.findById(dto.getCategoryId()).orElseThrow(
                () -> new EntityNotFoundException("Category not found")
        );

        // Get the branch inventory for this store
        BranchInventory inventory = branchInventoryRepository
                .findByStoreIdAndProductId(dto.getStoreId(), id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found in this store"));

        checkAuthority(inventory.getStore(), user);

        // Update catalog fields
        existing.setName(dto.getName());
        existing.setSku(dto.getSku());
        existing.setDescription(dto.getDescription());
        existing.setMrp(dto.getMrp());
        existing.setBrand(dto.getBrand());
        existing.setImage(dto.getImage());
        existing.setCategory(category);

        // Update inventory fields
        inventory.setStock(dto.getStock() != null ? dto.getStock() : 0);
        inventory.setSellingPrice(dto.getSellingPrice() != null ? dto.getSellingPrice() : dto.getMrp());
        inventory.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        productRepository.save(existing);
        branchInventoryRepository.save(inventory);

        return ProductMapper.toDto(existing, inventory);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id, User user) throws AccessDeniedException {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));

        // Find all branch inventory entries for this product
        List<BranchInventory> inventories = branchInventoryRepository.findByProductId(id);
        if (inventories.isEmpty()) {
            throw new EntityNotFoundException("Product inventory not found");
        }

        // Check authority for the first inventory entry
        checkAuthority(inventories.get(0).getStore(), user);

        // Delete all branch inventory entries first
        branchInventoryRepository.deleteAll(inventories);

        // Then delete the product
        productRepository.deleteById(id);
    }

    @Override
    public List<ProductDTO> getProductsByStoreId(Long storeId) {
        // Get all branch inventory for the store
        List<BranchInventory> inventories = branchInventoryRepository.findByStoreId(storeId);
        
        return inventories.stream()
                .map(inventory -> {
                    Product product = inventory.getProduct();
                    return ProductMapper.toDto(product, inventory);
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductDTO> searchByKeyword(Long storeId, String query) {
        // Use the custom query from repository
        List<Product> products = productRepository.searchByKeyword(storeId, query);
        
        return products.stream()
                .map(product -> {
                    BranchInventory inventory = branchInventoryRepository
                            .findByStoreIdAndProductId(storeId, product.getId())
                            .orElse(null);
                    return ProductMapper.toDto(product, inventory);
                })
                .collect(Collectors.toList());
    }

    // Note: checkAuthority is not in ProductService interface, so no @Override
    public void checkAuthority(Store store, User user) throws AccessDeniedException {
        if (user.getRole() == UserRole.ROLE_STORE_MANAGER
                && user.getStore().getId().equals(store.getId())) {
            return;
        }

        if (user.getRole() == UserRole.ROLE_STORE_ADMIN
                && store.getStoreAdmin().getId().equals(user.getId())) {
            return;
        }

        throw new AccessDeniedException("You are not authorized to manage this store.");
    }
}