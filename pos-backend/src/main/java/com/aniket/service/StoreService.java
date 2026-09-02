package com.aniket.service;


import com.aniket.domain.StoreStatus;
import com.aniket.exception.ResourceNotFoundException;
import com.aniket.exception.UserException;
import com.aniket.modal.Store;
import com.aniket.modal.User;
import com.aniket.payload.dto.StoreDTO;
import com.aniket.payload.dto.UserDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface StoreService {
    StoreDTO createStore(StoreDTO storeDto, User user) throws UserException;
    StoreDTO getStoreById(Long id) throws ResourceNotFoundException;
    List<StoreDTO> getAllStores(StoreStatus status);
    Page<StoreDTO> searchStores(StoreStatus status, String search, Pageable pageable);
    Store getStoreByAdminId() throws UserException;
    StoreDTO getStoreByEmployee() throws UserException;
    StoreDTO updateStore(Long id, StoreDTO storeDto) throws ResourceNotFoundException, UserException;
    StoreDTO updateStoreAsSuperAdmin(Long id, StoreDTO storeDto) throws ResourceNotFoundException, UserException;
    void deleteStore() throws ResourceNotFoundException, UserException;
    void deleteStore(Long id) throws ResourceNotFoundException, UserException;
    UserDTO addEmployee(Long id, UserDTO userDto) throws UserException;
    List<UserDTO> getEmployeesByStore(Long storeId) throws UserException;

    StoreDTO moderateStore(Long storeId, StoreStatus action) throws ResourceNotFoundException;

}

