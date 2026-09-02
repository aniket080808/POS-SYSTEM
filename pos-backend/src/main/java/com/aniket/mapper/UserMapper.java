package com.aniket.mapper;

import com.aniket.modal.User;
import com.aniket.payload.dto.UserDTO;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserMapper {

    public static UserDTO toDTO(User user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setEmail(user.getEmail());
        userDTO.setFullName(user.getFullName());
        userDTO.setBranchId(user.getBranch()==null?null:user.getBranch().getId());
        userDTO.setBranch(user.getBranch()==null?null: BranchMapper.toDto(user.getBranch()));
        userDTO.setRole(user.getRole());
        userDTO.setStoreId(user.getStore()==null?null:user.getStore().getId());
        String phone = user.getPhone();
        if ((phone == null || phone.trim().isEmpty()) && user.getRole() == com.aniket.domain.UserRole.ROLE_STORE_ADMIN && user.getStore() != null && user.getStore().getContact() != null) {
            phone = user.getStore().getContact().getPhone();
        }
        userDTO.setPhone(phone);
        userDTO.setCreatedAt(user.getCreatedAt());
        userDTO.setUpdatedAt(user.getUpdatedAt());
        userDTO.setEnabled(user.getEnabled() != null ? user.getEnabled() : true);
        userDTO.setVerified(user.getVerified() != null ? user.getVerified() : false);
        userDTO.setPasswordChangedAt(user.getPasswordChangedAt());
        userDTO.setLastLogin(user.getLastLogin());

        return userDTO;
    }

    public static List<UserDTO> toDTOList(List<User> users) {
        return users.stream()
                .map(UserMapper::toDTO)
                .collect(Collectors.toList());
    }

    public static Set<UserDTO> toDTOSet(Set<User> users) {
        return users.stream()
                .map(UserMapper::toDTO)
                .collect(Collectors.toSet());
    }

    public static User toEntity(UserDTO userDTO) {
        User createdUser = new User();
        createdUser.setEmail(userDTO.getEmail());
        createdUser.setPassword(userDTO.getPassword());
        createdUser.setCreatedAt(LocalDateTime.now());
        createdUser.setPhone(userDTO.getPhone());
        createdUser.setFullName(userDTO.getFullName());
        createdUser.setRole(userDTO.getRole());

        return createdUser;
    }
}
