package com.aniket.service.impl;


import com.aniket.exception.AccessDeniedException;
import com.aniket.exception.ResourceNotFoundException;
import com.aniket.modal.Customer;
import com.aniket.modal.Store;
import com.aniket.modal.User;
import com.aniket.payload.dto.CustomerOverviewDTO;
import com.aniket.repository.CustomerRepository;
import com.aniket.repository.OrderRepository;
import com.aniket.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;

    /**
     * Resolve the caller's store, throwing if none found.
     */
    private Store resolveStore(User caller) {
        Store store = caller.getStore();
        if (store == null && caller.getBranch() != null) {
            store = caller.getBranch().getStore();
        }
        if (store == null && caller.getOwnedStore() != null) {
            store = caller.getOwnedStore();
        }
        if (store == null) {
            throw new AccessDeniedException("Unable to determine your store. Please contact support.");
        }
        return store;
    }

    /**
     * Verify a customer belongs to the caller's store.
     */
    private void verifyOwnership(Customer customer, Store store) {
        if (customer.getStore() == null || !customer.getStore().getId().equals(store.getId())) {
            throw new AccessDeniedException("You are not authorized to access this customer.");
        }
    }

    @Override
    public Customer createCustomer(Customer customer, User caller) {
        Store store = resolveStore(caller);
        customer.setStore(store);
        if (customer.getLoyaltyPoints() == null) {
            customer.setLoyaltyPoints(0);
        }
        if (customer.getLoyaltyStatus() == null) {
            customer.setLoyaltyStatus("Bronze");
        }
        return customerRepository.save(customer);
    }

    @Override
    public Customer updateCustomer(Long id, Customer customerData, User caller) throws ResourceNotFoundException {
        Store store = resolveStore(caller);
        Customer customer = customerRepository.findById(id)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Customer not found with id " + id));

        verifyOwnership(customer, store);

        customer.setFullName(customerData.getFullName());
        customer.setEmail(customerData.getEmail());
        customer.setPhone(customerData.getPhone());

        return customerRepository.save(customer);
    }

    @Override
    public void deleteCustomer(Long id, User caller) throws ResourceNotFoundException {
        Store store = resolveStore(caller);
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id " + id));
        verifyOwnership(customer, store);
        customerRepository.delete(customer);
    }

    @Override
    public Customer getCustomerById(Long id, User caller) throws ResourceNotFoundException {
        Store store = resolveStore(caller);
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id " + id));
        verifyOwnership(customer, store);
        return customer;
    }

    @Override
    public List<Customer> getAllCustomers(User caller) {
        Store store = resolveStore(caller);
        return customerRepository.findByStoreId(store.getId());
    }

    @Override
    public List<Customer> searchCustomer(String keyword, User caller) {
        Store store = resolveStore(caller);
        return customerRepository.findByStoreIdAndFullNameContainingIgnoreCaseOrStoreIdAndEmailContainingIgnoreCase(
                store.getId(), keyword, store.getId(), keyword);
    }

    @Override
    public Customer addLoyaltyPoints(Long customerId, int points, User caller) throws ResourceNotFoundException {
        Store store = resolveStore(caller);
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id " + customerId));
        verifyOwnership(customer, store);

        int currentPoints = customer.getLoyaltyPoints() != null ? customer.getLoyaltyPoints() : 0;
        int updatedPoints = Math.max(0, currentPoints + points);
        customer.setLoyaltyPoints(updatedPoints);

        // Update Tier based on points
        if (updatedPoints >= 500) {
            customer.setLoyaltyStatus("Gold");
        } else if (updatedPoints >= 200) {
            customer.setLoyaltyStatus("Silver");
        } else {
            customer.setLoyaltyStatus("Bronze");
        }

        return customerRepository.save(customer);
    }

    @Override
    public CustomerOverviewDTO getCustomerOverview(User caller) {
        Store store = resolveStore(caller);
        Long storeId = store.getId();

        long totalCustomers = customerRepository.countByStoreId(storeId);
        long goldMembers = customerRepository.countByStoreIdAndLoyaltyStatusIgnoreCase(storeId, "Gold");
        long silverMembers = customerRepository.countByStoreIdAndLoyaltyStatusIgnoreCase(storeId, "Silver");
        long bronzeMembers = customerRepository.countByStoreIdAndLoyaltyStatusIgnoreCase(storeId, "Bronze");
        long totalOrders = orderRepository.countCustomerOrdersByStoreId(storeId);

        double avgOrders = totalCustomers > 0 ? (double) totalOrders / totalCustomers : 0.0;
        double roundedAvg = Math.round(avgOrders * 10.0) / 10.0;

        return CustomerOverviewDTO.builder()
                .totalCustomers(totalCustomers)
                .goldMembersCount(goldMembers)
                .silverMembersCount(silverMembers)
                .bronzeMembersCount(bronzeMembers)
                .totalOrders(totalOrders)
                .avgOrdersPerCustomer(roundedAvg)
                .build();
    }

    @Override
    public Customer updateStoreCredit(Long customerId, Double amount, String note, User caller) throws ResourceNotFoundException {
        Store store = resolveStore(caller);
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id " + customerId));
        verifyOwnership(customer, store);

        double currentCredit = customer.getStoreCredit() != null ? customer.getStoreCredit() : 0.0;
        double updatedCredit = Math.max(0.0, currentCredit + amount);
        customer.setStoreCredit(Math.round(updatedCredit * 100.0) / 100.0);

        return customerRepository.save(customer);
    }
}

