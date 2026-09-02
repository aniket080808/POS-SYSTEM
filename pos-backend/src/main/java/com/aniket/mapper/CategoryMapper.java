package com.aniket.mapper;

import com.aniket.modal.Category;
import com.aniket.payload.dto.CategoryDTO;

public class CategoryMapper {

    public static CategoryDTO toDto(Category category) {
        if (category == null) return null;
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .storeId(category.getStore() != null ? category.getStore().getId() : null)
                .build();
    }
}
