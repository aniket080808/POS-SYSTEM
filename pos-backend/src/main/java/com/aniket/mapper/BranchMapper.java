package com.aniket.mapper;


import com.aniket.modal.Branch;
import com.aniket.modal.Store;
import com.aniket.payload.dto.BranchDTO;

public class BranchMapper {

    public static BranchDTO toDto(Branch branch) {
        if (branch == null) return null;
        java.util.List<String> workingDaysList = null;
        try {
            if (branch.getWorkingDays() != null && org.hibernate.Hibernate.isInitialized(branch.getWorkingDays())) {
                workingDaysList = new java.util.ArrayList<>(branch.getWorkingDays());
            }
        } catch (Exception ignored) {}

        return BranchDTO.builder()
                .id(branch.getId())
                .name(branch.getName())
                .address(branch.getAddress())
                .phone(branch.getPhone())
                .email(branch.getEmail())
                .closeTime(branch.getCloseTime())
                .openTime(branch.getOpenTime())
                .workingDays(workingDaysList)
                .storeId(branch.getStore() != null ? branch.getStore().getId() : null)
                .createdAt(branch.getCreatedAt())
                .updatedAt(branch.getUpdatedAt())
                .isActive(branch.getIsActive() != null ? branch.getIsActive() : true)
                .manager(branch.getManager()!=null?
                        branch.getManager().getFullName():null)
                .build();
    }

    public static Branch toEntity(BranchDTO dto, Store store) {
        if (dto == null) return null;
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
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();
    }
}
