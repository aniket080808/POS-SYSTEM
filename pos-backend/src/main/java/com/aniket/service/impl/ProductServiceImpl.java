package com.aniket.service.impl;

import com.aniket.domain.UserRole;
import com.aniket.exception.AccessDeniedException;
import com.aniket.exception.UserException;
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
import com.aniket.service.StoreSubscriptionService;
import com.aniket.service.UserService;
import com.aniket.exception.PlanLimitExceededException;
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
    private final StoreSubscriptionService storeSubscriptionService;
    private final UserService userService;

    @Override
    @Transactional
    public ProductDTO createProduct(ProductDTO dto, User user) throws AccessDeniedException {
        Store store = storeRepository.findById(dto.getStoreId())
                .orElseThrow(() -> new EntityNotFoundException("Store not found"));

        enforceProductLimit(store);

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
    @Transactional
    public List<ProductDTO> bulkCreateProducts(List<ProductDTO> dtos, User user) throws AccessDeniedException {
        if (dtos == null || dtos.isEmpty()) {
            throw new IllegalArgumentException("Product list cannot be empty");
        }

        // Resolve the store strictly from the authenticated user — never trust storeId from the request body.
        Store store = user.getStore() != null
                ? user.getStore()
                : storeRepository.findByStoreAdminId(user.getId());
        if (store == null) {
            throw new AccessDeniedException("No store is linked to this account.");
        }

        // Validate that EVERY DTO in the batch belongs to the resolved store.
        // Reject the entire batch if any mismatch (IDOR protection).
        for (ProductDTO dto : dtos) {
            if (dto.getStoreId() != null && !dto.getStoreId().equals(store.getId())) {
                throw new AccessDeniedException(
                    "Product with SKU '" + dto.getSku() + "' belongs to a different store. " +
                    "All products in a bulk import must belong to your store."
                );
            }
        }

        // Atomic pre-check: current count + batch size must not exceed the plan's maxProducts.
        // Runs inside the same @Transactional boundary as the inserts, so no other request
        // can slip in between the count-check and the row creations.
        var storeSub = storeSubscriptionService.getOrCreateForStore(store);
        var plan = storeSub.getCurrentPlan();
        if (plan != null && plan.getMaxProducts() != null && plan.getMaxProducts() > 0) {
            int currentCount = (int) branchInventoryRepository.countByStoreId(store.getId());
            if (currentCount + dtos.size() > plan.getMaxProducts()) {
                throw new PlanLimitExceededException(
                    "This import would exceed your plan's limit of " + plan.getMaxProducts() +
                    " products (you currently have " + currentCount + ", importing " + dtos.size() +
                    " more). Please upgrade your plan or reduce the file size."
                );
            }
        }

        // Create each product. createProduct() keeps enforceProductLimit() as a
        // defense-in-depth backstop, but the atomic pre-check above should catch
        // over-limit imports before any row is processed.
        List<ProductDTO> created = new java.util.ArrayList<>();
        for (ProductDTO dto : dtos) {
            // Force the storeId to the resolved store (ignore any client-supplied value)
            dto.setStoreId(store.getId());
            created.add(createProduct(dto, user));
        }
        return created;
    }

    private void enforceProductLimit(Store store) throws PlanLimitExceededException {
        if (store == null) return;
        var storeSub = storeSubscriptionService.getOrCreateForStore(store);
        var plan = storeSub.getCurrentPlan();
        if (plan == null || plan.getMaxProducts() == null || plan.getMaxProducts() <= 0) return;

        int current = (int) branchInventoryRepository.countByStoreId(store.getId());
        if (current >= plan.getMaxProducts()) {
            throw new PlanLimitExceededException(
                "Your plan allows a maximum of " + plan.getMaxProducts() + " products.");
        }
    }

    @Override
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));

        BranchInventory inventory = branchInventoryRepository
                .findByProductId(id)
                .stream()
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Product inventory not found"));

        User currentUser;
        try {
            currentUser = userService.getCurrentUser();
        } catch (UserException e) {
            throw new AccessDeniedException("You are not authorized to view this product.", e);
        }
        checkAuthority(inventory.getStore(), currentUser);

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