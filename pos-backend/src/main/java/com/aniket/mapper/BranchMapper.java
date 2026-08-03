package com.aniket.mapper;


import com.aniket.modal.Branch;
import com.aniket.modal.Store;
import com.aniket.payload.dto.BranchDTO;

public class BranchMapper {

    public static BranchDTO toDto(Branch branch) {
        return BranchDTO.builder()
                .id(branch.getId())
                .name(branch.getName())
                .address(branch.getAddress())
                .phone(branch.getPhone())
                .email(branch.getEmail())
                .closeTime(branch.getCloseTime())
                .openTime(branch.getOpenTime())
                .workingDays(branch.getWorkingDays())
                .storeId(branch.getStore() != null ? branch.getStore().getId() : null)
                .createdAt(branch.getCreatedAt())
                .updatedAt(branch.getUpdatedAt())
                .manager(branch.getManager()!=null?
                        branch.getManager().getFullName():null)
                .build();
    }

    public static Branch toEntity(BranchDTO dto, Store store) {
        return Branch.builder()
                .id(dto.getId())
                .name(dto.getName())
                .address(dto.getAddress())
                .store(store)
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .closeTime(dto.getCloseTime())
                .openTime(dto.getOpenTime())
                .workingDays(dto.getWorkingDays())
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .build();
    }
}
