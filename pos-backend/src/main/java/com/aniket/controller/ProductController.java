package com.aniket.controller;


import com.aniket.exception.AccessDeniedException;
import com.aniket.exception.UserException;
import com.aniket.modal.User;
import com.aniket.payload.dto.ProductDTO;
import com.aniket.service.ProductService;
import com.aniket.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<ProductDTO> create(
            @Valid @RequestBody ProductDTO dto,
            @RequestHeader("Authorization") String jwt
    ) throws UserException, AccessDeniedException {
        User user = userService.getUserFromJwtToken(jwt);
        return ResponseEntity.ok(productService.createProduct(dto, user));
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<ProductDTO>> bulkCreate(
            @Valid @RequestBody List<ProductDTO> dtos,
            @RequestHeader("Authorization") String jwt
    ) throws UserException, AccessDeniedException {
        User user = userService.getUserFromJwtToken(jwt);
        return ResponseEntity.ok(productService.bulkCreateProducts(dtos, user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }


    @PatchMapping("/{id}")
    public ResponseEntity<ProductDTO> update(@PathVariable Long id,
                                             @RequestBody ProductDTO dto,

                                             @RequestHeader("Authorization") String jwt) throws UserException, AccessDeniedException {
        User user = userService.getUserFromJwtToken(jwt);
        return ResponseEntity.ok(productService.updateProduct(id, dto,user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                       @RequestHeader("Authorization") String jwt) throws UserException, AccessDeniedException {
        User user = userService.getUserFromJwtToken(jwt);
        productService.deleteProduct(id, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/store/{storeId}")
    public ResponseEntity<List<ProductDTO>> getByStore(@PathVariable Long storeId) {
        return ResponseEntity.ok(productService.getProductsByStoreId(storeId));
    }

    @GetMapping("/store/{storeId}/search")
    public ResponseEntity<List<ProductDTO>> searchByKeyword(
            @PathVariable Long storeId,
            @RequestParam String q) {
        return ResponseEntity.ok(productService.searchByKeyword(storeId,q));
    }



}

