package com.aniket.service.impl;

import com.aniket.modal.Customer;
import com.aniket.modal.HeldOrder;
import com.aniket.modal.HeldOrderItem;
import com.aniket.modal.Product;
import com.aniket.payload.dto.HeldOrderDTO;
import com.aniket.payload.dto.HeldOrderItemDTO;
import com.aniket.repository.CustomerRepository;
import com.aniket.repository.HeldOrderRepository;
import com.aniket.repository.ProductRepository;
import com.aniket.service.HeldOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HeldOrderServiceImpl implements HeldOrderService {

    private final HeldOrderRepository heldOrderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public HeldOrderDTO saveHeldOrder(HeldOrderDTO dto) {
        Customer customer = null;
        if (dto.getCustomerId() != null) {
            customer = customerRepository.findById(dto.getCustomerId()).orElse(null);
        }

        HeldOrder order = HeldOrder.builder()
                .branchId(dto.getBranchId())
                .storeId(dto.getStoreId())
                .cashierId(dto.getCashierId())
                .cashierName(dto.getCashierName())
                .customer(customer)

                .note(dto.getNote())
                .subtotal(dto.getSubtotal())
                .tax(dto.getTax())
                .discountAmount(dto.getDiscountAmount())
                .totalAmount(dto.getTotalAmount())
                .referenceTag(dto.getReferenceTag() != null ? dto.getReferenceTag() : "Hold #" + (System.currentTimeMillis() % 10000))
                .items(new ArrayList<>())
                .build();

        if (dto.getItems() != null) {
            for (HeldOrderItemDTO itemDto : dto.getItems()) {
                Product product = null;
                if (itemDto.getProductId() != null) {
                    product = productRepository.findById(itemDto.getProductId()).orElse(null);
                }

                HeldOrderItem item = HeldOrderItem.builder()
                        .product(product)
                        .productName(itemDto.getProductName())
                        .sku(itemDto.getSku())
                        .price(itemDto.getPrice())
                        .sellingPrice(itemDto.getSellingPrice())
                        .quantity(itemDto.getQuantity() != null ? itemDto.getQuantity() : 1)
                        .image(itemDto.getImage())
                        .build();

                order.addItem(item);
            }
        }

        HeldOrder saved = heldOrderRepository.save(order);
        log.info("Held order #{} saved for branch {}", saved.getId(), saved.getBranchId());
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HeldOrderDTO> getHeldOrdersByBranch(Long branchId) {
        List<HeldOrder> list = heldOrderRepository.findByBranchIdOrderByCreatedAtDesc(branchId);
        return list.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HeldOrderDTO> getHeldOrdersByCashier(Long cashierId) {
        List<HeldOrder> list = heldOrderRepository.findByCashierIdOrderByCreatedAtDesc(cashierId);
        return list.stream().map(this::mapToDTO).collect(Collectors.toList());
    }


    @Override
    @Transactional
    public void deleteHeldOrder(Long id) {
        if (heldOrderRepository.existsById(id)) {
            heldOrderRepository.deleteById(id);
            log.info("Held order #{} recalled and removed from parking queue", id);
        }
    }

    private HeldOrderDTO mapToDTO(HeldOrder o) {
        List<HeldOrderItemDTO> itemDtos = o.getItems().stream().map(i -> HeldOrderItemDTO.builder()
                .id(i.getId())
                .productId(i.getProduct() != null ? i.getProduct().getId() : null)
                .productName(i.getProductName())
                .sku(i.getSku())
                .price(i.getPrice())
                .sellingPrice(i.getSellingPrice())
                .quantity(i.getQuantity())
                .image(i.getImage())
                .build()
        ).collect(Collectors.toList());

        return HeldOrderDTO.builder()
                .id(o.getId())
                .branchId(o.getBranchId())
                .storeId(o.getStoreId())
                .cashierId(o.getCashierId())
                .cashierName(o.getCashierName())

                .customerId(o.getCustomer() != null ? o.getCustomer().getId() : null)
                .customerName(o.getCustomer() != null ? o.getCustomer().getFullName() : null)
                .customerPhone(o.getCustomer() != null ? o.getCustomer().getPhone() : null)
                .note(o.getNote())
                .subtotal(o.getSubtotal())
                .tax(o.getTax())
                .discountAmount(o.getDiscountAmount())
                .totalAmount(o.getTotalAmount())
                .referenceTag(o.getReferenceTag())
                .items(itemDtos)
                .createdAt(o.getCreatedAt())
                .build();
    }
}
