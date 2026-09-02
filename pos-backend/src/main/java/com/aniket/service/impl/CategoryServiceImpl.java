package com.aniket.service.impl;

import com.aniket.domain.UserRole;
import com.aniket.exception.AccessDeniedException;
import com.aniket.exception.UserException;
import com.aniket.mapper.CategoryMapper;
import com.aniket.modal.*;
import com.aniket.payload.dto.CategoryDTO;
import com.aniket.repository.*;

import com.aniket.service.CategoryService;
import com.aniket.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final StoreRepository storeRepository;
    private final UserService userService;

    @Override
    public CategoryDTO createCategory(CategoryDTO dto) throws UserException {
        User user = userService.getCurrentUser();
        Store store = storeRepository.findById(dto.getStoreId())
                .orElseThrow(() -> new EntityNotFoundException("Store not found"));

        checkManageAuthority(user, store);

        Category category = Category.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .store(store)
                .build();

        return CategoryMapper.toDto(categoryRepository.save(category));
    }

    @Override
    public CategoryDTO updateCategory(Long id, CategoryDTO dto) throws UserException {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));

        User user = userService.getCurrentUser();
        checkManageAuthority(user, category.getStore());

        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        return CategoryMapper.toDto(categoryRepository.save(category));
    }

    @Override
    public List<CategoryDTO> getCategoriesByStore(Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new EntityNotFoundException("Store not found"));
        User user;
        try {
            user = userService.getCurrentUser();
        } catch (UserException e) {
            throw new AccessDeniedException("You are not authorized to view this store's categories.", e);
        }
        checkViewAuthority(user, store);
        return categoryRepository.findByStoreId(storeId).stream()
                .map(CategoryMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteCategory(Long id) throws UserException {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));

        User user = userService.getCurrentUser();
        checkManageAuthority(user, category.getStore());

        categoryRepository.delete(category);
    }

    private void checkViewAuthority(User user, Store store) {
        if (user.getRole() == UserRole.ROLE_ADMIN) {
            return;
        }

        Long userStoreId = null;
        if (user.getStore() != null) {
            userStoreId = user.getStore().getId();
        } else if (user.getBranch() != null && user.getBranch().getStore() != null) {
            userStoreId = user.getBranch().getStore().getId();
        }

        if (userStoreId != null && userStoreId.equals(store.getId())) {
            return;
        }
        throw new AccessDeniedException("You do not have permission to view categories for this store.");
    }

    private void checkManageAuthority(User user, Store store) {
        if (user.getRole() == UserRole.ROLE_ADMIN) {
            return;
        }
        boolean isStoreAdmin = user.getRole().equals(UserRole.ROLE_STORE_ADMIN);
        boolean isStoreManager = user.getRole().equals(UserRole.ROLE_STORE_MANAGER);

        Long userStoreId = user.getStore() != null ? user.getStore().getId() : null;
        boolean isSameStore = userStoreId != null && userStoreId.equals(store.getId());

        if ((isStoreAdmin || isStoreManager) && isSameStore) {
            return;
        }
        throw new AccessDeniedException("You do not have permission to manage this category.");
    }
}
