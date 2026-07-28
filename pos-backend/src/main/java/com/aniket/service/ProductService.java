package com.aniket.service;


import com.aniket.exception.AccessDeniedException;
import com.aniket.modal.User;
import com.aniket.payload.dto.ProductDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductService {
    ProductDTO createProduct(ProductDTO productDto, User user) throws AccessDeniedException;
    ProductDTO getProductById(Long id);

    ProductDTO updateProduct(Long id, ProductDTO productDto, User user) throws AccessDeniedException;
    void deleteProduct(Long id, User user) throws AccessDeniedException;

    List<ProductDTO> getProductsByStoreId(Long storeId);

    List<ProductDTO> searchByKeyword(Long storeId, String query);



}
