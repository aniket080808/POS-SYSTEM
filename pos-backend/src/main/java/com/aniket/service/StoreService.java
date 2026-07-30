package com.aniket.service;


import com.aniket.domain.StoreStatus;
import com.aniket.exception.ResourceNotFoundException;
import com.aniket.exception.UserException;
import com.aniket.modal.Store;
import com.aniket.modal.User;
import com.aniket.payload.dto.StoreDTO;
import com.aniket.payload.dto.UserDTO;

import java.util.List;

public interface StoreService {
    StoreDTO createStore(StoreDTO storeDto, User user);
    StoreDTO getStoreById(Long id) throws ResourceNotFoundException;
    List<StoreDTO> getAllStores(StoreStatus status);
    Store getStoreByAdminId() throws UserException;
    StoreDTO getStoreByEmployee() throws UserException;
    StoreDTO updateStore(Long id, StoreDTO storeDto) throws ResourceNotFoundException, UserException;
    void deleteStore() throws ResourceNotFoundException, UserException;
    UserDTO addEmployee(Long id, UserDTO userDto) throws UserException;
    List<UserDTO> getEmployeesByStore(Long storeId) throws UserException;

    StoreDTO moderateStore(Long storeId, StoreStatus action) throws ResourceNotFoundException;

}

