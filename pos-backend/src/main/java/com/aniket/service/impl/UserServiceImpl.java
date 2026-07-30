package com.aniket.service.impl;


import com.aniket.configrations.JwtProvider;
import com.aniket.domain.UserRole;
import com.aniket.exception.UserException;

import com.aniket.modal.*;


import com.aniket.repository.PasswordResetTokenRepository;
import com.aniket.repository.UserRepository;

import com.aniket.service.ActivityLogService;
import com.aniket.service.UserService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;


import com.aniket.modal.User;
import com.aniket.repository.BranchRepository;
import com.aniket.repository.StoreRepository;


import java.util.Optional;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

//	private final OtpRepository otpRepository;
	private final UserRepository userRepository;
	private final StoreRepository storeRepository;
	private final BranchRepository branchRepository;
//	private final EmailUtil emailUtil;
	private final PasswordEncoder passwordEncoder;
	private final JwtProvider jwtProvider;
	private final PasswordResetTokenRepository passwordResetTokenRepository;


	@Override
	public User getUserByEmail(String email) throws UserException {
		User user=userRepository.findByEmail(email);
		if(user==null){
			throw new UserException("User not found with email: "+email);
		}
		return user;
	}

	@Override
	public User getUserFromJwtToken(String jwt) throws UserException {
		String email = jwtProvider.getEmailFromJwtToken(jwt);
		User user = userRepository.findByEmail(email);
		if(user==null) throw new UserException("user not exist with email "+email);
		return user;
	}

	@Override
	public User getUserById(Long id) throws UserException {
		return userRepository.findById(id).orElse(null);
	}

	@Override
	public Set<User> getUserByRole(UserRole role) throws UserException {
		return userRepository.findByRole(role);
	}

	@Override
	public User getCurrentUser() throws UserException {
		String email = SecurityContextHolder.getContext().getAuthentication().getName();
		User user= userRepository.findByEmail(email);
		if(user == null) {
			throw new UserException("User not found");
		}
		return user;
	}

	@Override
	public List<User> getUsers() throws UserException {
		return userRepository.findAll();
	}

	@Override
	@Transactional
	public User updateProfile(User user, String fullName, String phone, String email) throws UserException {
		if (email != null && !email.trim().isEmpty() && !email.equals(user.getEmail())) {
			User existing = userRepository.findByEmail(email);
			if (existing != null) {
				throw new UserException("Email already in use");
			}
			user.setEmail(email);
		}
		
		if (fullName != null && !fullName.trim().isEmpty()) user.setFullName(fullName);
		if (phone != null && !phone.trim().isEmpty()) user.setPhone(phone);
		
		return userRepository.save(user);
	}

	@Override
	@Transactional
	public void changePassword(User user, String currentPassword, String newPassword) throws UserException {
		if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
			throw new UserException("Incorrect current password");
		}
		
		// Simple minimum password strength validation (e.g. 8 chars)
		if (newPassword == null || newPassword.length() < 8) {
			throw new UserException("Password must be at least 8 characters long");
		}
		
		user.setPassword(passwordEncoder.encode(newPassword));
		userRepository.save(user);
	}


}
