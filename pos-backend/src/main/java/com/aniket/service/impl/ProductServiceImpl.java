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
    private final com.aniket.repository.InventoryRepository inventoryRepository;
    private final com.aniket.repository.OrderItemRepository orderItemRepository;
    private final com.aniket.repository.BranchRepository branchRepository;
    private final StoreSubscriptionService storeSubscriptionService;
    private final UserService userService;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;
    private final jakarta.persistence.EntityManager entityManager;

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

        // Seed branch inventories for all branches under this store
        List<com.aniket.modal.Branch> branches = branchRepository.findByStoreId(store.getId());
        for (com.aniket.modal.Branch b : branches) {
            com.aniket.modal.Inventory branchInv = com.aniket.modal.Inventory.builder()
                    .branch(b)
                    .product(product)
                    .quantity(dto.getStock() != null ? dto.getStock() : 0)
                    .lastUpdated(java.time.LocalDateTime.now())
                    .build();
            inventoryRepository.save(branchInv);
        }

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

        checkAuthority(store, user);

        // Validate that EVERY DTO in the batch belongs to the resolved store.
        for (ProductDTO dto : dtos) {
            if (dto.getStoreId() != null && !dto.getStoreId().equals(store.getId())) {
                throw new AccessDeniedException(
                    "Product with SKU '" + dto.getSku() + "' belongs to a different store. " +
                    "All products in a bulk import must belong to your store."
                );
            }
        }

        // Atomic pre-check: current count + batch size must not exceed the plan's maxProducts.
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

        // Check for duplicate SKUs within the import batch
        java.util.Set<String> seenSkus = new java.util.HashSet<>();
        for (ProductDTO dto : dtos) {
            if (!seenSkus.add(dto.getSku())) {
                throw new org.springframework.dao.DataIntegrityViolationException("Duplicate SKU in import file: '" + dto.getSku() + "'");
            }
        }

        // Fast batch check against existing database SKUs (in chunks of 1000)
        for (int i = 0; i < dtos.size(); i += 1000) {
            List<String> chunk = dtos.subList(i, Math.min(i + 1000, dtos.size())).stream()
                    .map(ProductDTO::getSku).toList();
            String inSql = String.join(",", java.util.Collections.nCopies(chunk.size(), "?"));
            List<String> found = jdbcTemplate.queryForList(
                    "SELECT sku FROM products WHERE sku IN (" + inSql + ")", String.class, chunk.toArray()
            );
            if (!found.isEmpty()) {
                throw new org.springframework.dao.DataIntegrityViolationException("Product with SKU '" + found.get(0) + "' already exists");
            }
        }

        // Fetch all referenced categories for this store in a single query
        java.util.Set<Long> categoryIds = dtos.stream()
                .map(ProductDTO::getCategoryId)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());
        java.util.Map<Long, Category> categoryMap = categoryRepository.findAllById(categoryIds).stream()
                .collect(Collectors.toMap(Category::getId, java.util.function.Function.identity(), (a, b) -> a));

        // Fetch all branches of the store in a single query
        List<com.aniket.modal.Branch> branches = branchRepository.findByStoreId(store.getId());

        // Batch insert products, store inventory, and branch shelf records
        List<ProductDTO> created = new java.util.ArrayList<>(dtos.size());
        int batchSize = 100;
        for (int i = 0; i < dtos.size(); i++) {
            ProductDTO dto = dtos.get(i);
            dto.setStoreId(store.getId());

            Category category = categoryMap.get(dto.getCategoryId());
            if (category == null) {
                throw new EntityNotFoundException("Category with ID " + dto.getCategoryId() + " not found");
            }

            Product product = ProductMapper.toEntity(dto, store);
            product.setCategory(category);
            product = productRepository.save(product);

            BranchInventory inventory = BranchInventory.builder()
                    .store(store)
                    .product(product)
                    .stock(dto.getStock() != null ? dto.getStock() : 0)
                    .sellingPrice(dto.getSellingPrice() != null ? dto.getSellingPrice() : dto.getMrp())
                    .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                    .build();
            branchInventoryRepository.save(inventory);

            for (com.aniket.modal.Branch b : branches) {
                com.aniket.modal.Inventory branchInv = com.aniket.modal.Inventory.builder()
                        .branch(b)
                        .product(product)
                        .quantity(dto.getStock() != null ? dto.getStock() : 0)
                        .lastUpdated(java.time.LocalDateTime.now())
                        .build();
                inventoryRepository.save(branchInv);
            }

            created.add(ProductMapper.toDto(product, inventory));

            if ((i + 1) % batchSize == 0) {
                entityManager.flush();
                entityManager.clear();
            }
        }
        entityManager.flush();
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

        // 2. Synchronize branch inventories for branches under this store
        if (inventory.getStore() != null) {
            List<com.aniket.modal.Branch> branches = branchRepository.findByStoreId(inventory.getStore().getId());
            for (com.aniket.modal.Branch b : branches) {
                com.aniket.modal.Inventory branchInv = inventoryRepository
                        .findByBranchIdAndProductIdWithLock(b.getId(), existing.getId())
                        .orElseGet(() -> com.aniket.modal.Inventory.builder()
                                .branch(b)
                                .product(existing)
                                .build());
                branchInv.setQuantity(dto.getStock() != null ? dto.getStock() : 0);
                branchInv.setLastUpdated(java.time.LocalDateTime.now());
                inventoryRepository.save(branchInv);
            }
        }

        return ProductMapper.toDto(existing, inventory);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id, User user) throws AccessDeniedException {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));

        // Validate store access authority if product is linked to a store
        List<BranchInventory> inventories = branchInventoryRepository.findByProductId(id);
        if (!inventories.isEmpty() && inventories.get(0).getStore() != null) {
            checkAuthority(inventories.get(0).getStore(), user);
        }

        // Nullify foreign keys in order_items so historical orders remain valid
        orderItemRepository.nullifyProductReference(id);

        // Fast direct SQL batch deletes for inventory
        inventoryRepository.deleteByProductId(id);
        branchInventoryRepository.deleteByProductId(id);
        
        // Delete product entity
        productRepository.delete(product);

        // Flush and clear Hibernate persistence context
        entityManager.flush();
        entityManager.clear();
    }

    @Override
    @Transactional
    public int deleteAllProductsByStore(Long storeId, User user) throws AccessDeniedException {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new EntityNotFoundException("Store not found"));

        checkAuthority(store, user);

        // Find all product IDs belonging to this store via branch inventory OR store categories
        List<Long> productIdsFromInv = jdbcTemplate.queryForList(
                "SELECT DISTINCT product_id FROM branch_inventory WHERE store_id = ?", Long.class, storeId
        );
        List<Long> productIdsFromCat = jdbcTemplate.queryForList(
                "SELECT DISTINCT p.id FROM products p JOIN categories c ON p.category_id = c.id WHERE c.store_id = ?", Long.class, storeId
        );
        java.util.Set<Long> allProductIds = new java.util.HashSet<>(productIdsFromInv);
        allProductIds.addAll(productIdsFromCat);

        if (allProductIds.isEmpty()) {
            return 0;
        }

        // Bulk SQL deletes in chunks of 1000
        List<Long> idList = new java.util.ArrayList<>(allProductIds);
        for (int i = 0; i < idList.size(); i += 1000) {
            List<Long> chunk = idList.subList(i, Math.min(i + 1000, idList.size()));
            String inSql = String.join(",", java.util.Collections.nCopies(chunk.size(), "?"));
            Object[] params = chunk.toArray();

            jdbcTemplate.update("UPDATE order_items SET product_id = NULL WHERE product_id IN (" + inSql + ")", params);
            jdbcTemplate.update("DELETE FROM inventories WHERE product_id IN (" + inSql + ")", params);
            jdbcTemplate.update("DELETE FROM branch_inventory WHERE product_id IN (" + inSql + ")", params);
            jdbcTemplate.update("DELETE FROM products WHERE id IN (" + inSql + ")", params);
        }

        entityManager.flush();
        entityManager.clear();

        return allProductIds.size();
    }

    @Override
    public List<ProductDTO> getProductsByStoreId(Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new EntityNotFoundException("Store not found"));
        User currentUser;
        try {
            currentUser = userService.getCurrentUser();
        } catch (UserException e) {
            throw new AccessDeniedException("You are not authorized to view products for this store.", e);
        }
        checkAuthority(store, currentUser);

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
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new EntityNotFoundException("Store not found"));
        User currentUser;
        try {
            currentUser = userService.getCurrentUser();
        } catch (UserException e) {
            throw new AccessDeniedException("You are not authorized to view products for this store.", e);
        }
        checkAuthority(store, currentUser);

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
        if (user.getRole() == UserRole.ROLE_ADMIN) {
            return;
        }

        if (user.getRole() == UserRole.ROLE_STORE_MANAGER
                && user.getStore() != null && user.getStore().getId().equals(store.getId())) {
            return;
        }

        if (user.getRole() == UserRole.ROLE_STORE_ADMIN
                && ((store.getStoreAdmin() != null && store.getStoreAdmin().getId().equals(user.getId()))
                    || (user.getStore() != null && user.getStore().getId().equals(store.getId())))) {
            return;
        }

        if ((user.getRole() == UserRole.ROLE_BRANCH_ADMIN
                || user.getRole() == UserRole.ROLE_BRANCH_MANAGER
                || user.getRole() == UserRole.ROLE_BRANCH_CASHIER)
                && user.getStore() != null && user.getStore().getId().equals(store.getId())) {
            return;
        }

        throw new AccessDeniedException("You are not authorized to access this store's products.");
    }
}