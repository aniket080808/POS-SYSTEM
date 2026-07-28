package com.aniket.service;

import com.aniket.exception.UserException;
import com.aniket.payload.dto.UserDTO;
import com.aniket.payload.response.AuthResponse;

public interface AuthService {
    AuthResponse login(String username, String password) throws UserException;
    AuthResponse signup(UserDTO req) throws UserException;

    void createPasswordResetToken(String email) throws UserException;
    void resetPassword(String token, String newPassword);
}
