package com.aniket.service;


import com.aniket.exception.ResourceNotFoundException;
import com.aniket.modal.Customer;
import com.aniket.modal.User;
import com.aniket.payload.dto.CustomerOverviewDTO;

import java.util.List;

public interface CustomerService {

    Customer createCustomer(Customer customer, User caller);

    Customer updateCustomer(Long id, Customer customer, User caller) throws ResourceNotFoundException;

    void deleteCustomer(Long id, User caller) throws ResourceNotFoundException;

    Customer getCustomerById(Long id, User caller) throws ResourceNotFoundException;

    List<Customer> getAllCustomers(User caller);

    List<Customer> searchCustomer(String keyword, User caller);

    Customer addLoyaltyPoints(Long customerId, int points, User caller) throws ResourceNotFoundException;

    Customer updateStoreCredit(Long customerId, Double amount, String note, User caller) throws ResourceNotFoundException;

    CustomerOverviewDTO getCustomerOverview(User caller);
}


