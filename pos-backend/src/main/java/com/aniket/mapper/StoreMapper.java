package com.aniket.mapper;

import com.aniket.modal.Store;
import com.aniket.modal.User;
import com.aniket.payload.dto.StoreDTO;

public class StoreMapper {

        public static StoreDTO toDto(Store store) {
            return StoreDTO.builder()
                    .id(store.getId())
                    .brand(store.getBrand())
                    .storeAdminId(store.getStoreAdmin() != null ? store.getStoreAdmin().getId() : null)
                    .storeAdmin(UserMapper.toDTO(store.getStoreAdmin()))
                    .storeType(store.getStoreType())
                    .description(store.getDescription())
                    .contact(store.getContact())
                    .gstNumber(store.getGstNumber())
                    .panNumber(store.getPanNumber())
                    .createdAt(store.getCreatedAt())
                    .updatedAt(store.getUpdatedAt())
                    .status(store.getStatus())
                    .registrationRejectionReason(store.getRegistrationRejectionReason())
                    .currency(store.getCurrency())
                    .taxRate(store.getTaxRate())
                    .timezone(store.getTimezone())
                    .dateFormat(store.getDateFormat())
                    .receiptFooter(store.getReceiptFooter())
                    .acceptedPaymentMethods(store.getAcceptedPaymentMethods())
                    .build();
        }

        public static Store toEntity(StoreDTO dto, User storeAdmin) {
            return Store.builder()
                    .id(dto.getId())
                    .brand(dto.getBrand())
                    .storeAdmin(storeAdmin)
                    .createdAt(dto.getCreatedAt())
                    .updatedAt(dto.getUpdatedAt())
                    .storeType(dto.getStoreType())
                    .description(dto.getDescription())
                    .contact(dto.getContact())
                    .gstNumber(dto.getGstNumber())
                    .panNumber(dto.getPanNumber())
                    .registrationRejectionReason(dto.getRegistrationRejectionReason())
                    .currency(dto.getCurrency())
                    .taxRate(dto.getTaxRate())
                    .timezone(dto.getTimezone())
                    .dateFormat(dto.getDateFormat())
                    .receiptFooter(dto.getReceiptFooter())
                    .acceptedPaymentMethods(dto.getAcceptedPaymentMethods())
                    .build();
        }
    }