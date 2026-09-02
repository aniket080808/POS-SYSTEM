package com.aniket.service;


import com.aniket.domain.UserRole;
import com.aniket.exception.UserException;
import com.aniket.modal.User;

import java.util.List;
import java.util.Set;
//import com.aniket.payload.request.UpdateUserDto;


public interface UserService {
	User getUserByEmail(String email) throws UserException;
	User getUserFromJwtToken(String jwt) throws UserException;
	User getUserById(Long id) throws UserException;
	Set<User> getUserByRole(UserRole role) throws UserException;
	Set<User> getUserByRoleForCurrentUser(UserRole role) throws UserException;
	List<User> getUsers() throws UserException;
	User getCurrentUser() throws UserException;
	User updateProfile(User user, String fullName, String phone, String email) throws UserException;
	void changePassword(User user, String currentPassword, String newPassword) throws UserException;

//	User updateUser(UpdateUserDto updateData, User user);
//	String sendForgotPasswordOtp(String email) throws UserException, MessagingException;
//	User verifyForgotPasswordOtp(String otp, String updatedPassword) throws Exception;
}
