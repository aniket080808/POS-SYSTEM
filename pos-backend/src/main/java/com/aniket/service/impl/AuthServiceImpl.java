package com.aniket.service.impl;

import com.aniket.configrations.JwtProvider;

import com.aniket.domain.UserRole;
import com.aniket.exception.UserException;
import com.aniket.mapper.UserMapper;
import com.aniket.modal.PasswordResetToken;
import com.aniket.modal.User;
import com.aniket.payload.dto.UserDTO;
import com.aniket.payload.response.AuthResponse;
import com.aniket.repository.PasswordResetTokenRepository;
import com.aniket.repository.UserRepository;
import com.aniket.service.ActivityLogService;
import com.aniket.service.AuthService;

import com.aniket.service.EmailService;
import com.aniket.service.EmailTemplateService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final CustomUserImplementation customUserImplementation;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;
    private final EmailTemplateService emailTemplateService;
    private final ActivityLogService activityLogService;

    @Value("${app.frontend.reset-url:http://localhost:5173/auth/reset-password?token=}")
    private String frontendResetUrl;



    @Override
    public AuthResponse signup(UserDTO req) throws UserException {

        User user = userRepository.findByEmail(req.getEmail());
        if(user != null) {
            throw new UserException("Email id already registered ");
        }

        if (req.getRole() != null && !req.getRole().equals(UserRole.ROLE_CUSTOMER)) {
            throw new UserException("Public registration is only available for customer accounts. Store administrators must register via Onboarding, and staff accounts must be created by their administrator.");
        }

        User createdUser = new User();
        createdUser.setEmail(req.getEmail());
        createdUser.setPassword(passwordEncoder.encode(req.getPassword()));
        createdUser.setCreatedAt(LocalDateTime.now());
        createdUser.setPhone(req.getPhone());
        createdUser.setFullName(req.getFullName());
        createdUser.setLastLogin(LocalDateTime.now());
        createdUser.setRole(UserRole.ROLE_CUSTOMER);

        User savedUser = userRepository.save(createdUser);
//        UserDTO userDTO=new UserDTO();
//        userDTO.setEmail(savedUser.getEmail());
//        userDTO.setFullName(savedUser.getFullName());
//        userDTO.setId(savedUser.getId());

//        userEventProducer.userCreatedEvent(userDTO);

        java.util.List<GrantedAuthority> authorities = java.util.Collections.singletonList(
                new org.springframework.security.core.authority.SimpleGrantedAuthority(savedUser.getRole().toString())
        );
        Authentication authentication = new UsernamePasswordAuthenticationToken(savedUser.getEmail(), savedUser.getPassword(), authorities);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtProvider.generateToken(authentication);

        AuthResponse response = new AuthResponse();
        response.setTitle("Welcome " + createdUser.getEmail());
        response.setMessage("Register success");
        response.setUser(UserMapper.toDTO(savedUser));
        response.setJwt(jwt);
        return response;
    }

    @Override
    public AuthResponse login(String username, String password) throws UserException {
        Authentication authentication = authenticate(username, password);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        String role =  authorities.iterator().next().getAuthority();
        String token = jwtProvider.generateToken(authentication);

        User user = userRepository.findByEmail(username);

//        update last Login and last activity
        LocalDateTime now = LocalDateTime.now();
        user.setLastLogin(now);
        user.setLastActivity(now);
        userRepository.save(user);

        // Log admin login activity
        if (user.getRole() == UserRole.ROLE_ADMIN) {
            activityLogService.log(
                    "ADMIN_LOGIN",
                    "Admin \"" + user.getFullName() + "\" logged in",
                    "User",
                    user.getId(),
                    user.getFullName(),
                    "SUCCESS"
            );
        }

        AuthResponse response = new AuthResponse();
        response.setTitle("Login success");
        response.setMessage("Welcome Back" + username);
        response.setJwt(token);
        response.setUser(UserMapper.toDTO(user));
        if (user.getStore() != null) {
            response.setStore(com.aniket.mapper.StoreMapper.toDto(user.getStore()));
        }

        return response;
    }

    public Authentication authenticate(String email, String password) throws UserException {

        UserDetails userDetails = customUserImplementation.loadUserByUsername(email);
        if(userDetails == null) {
            throw new UserException("email id doesn't exist "+ email);
        }
        if(!userDetails.isEnabled()) {
            throw new UserException("Your account has been deactivated. Please contact your administrator.");
        }
        if(!passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new UserException("Wrong Password ");
        }
        return new UsernamePasswordAuthenticationToken(email, null, userDetails.getAuthorities());
    }

    @Transactional
    public void createPasswordResetToken(String email) throws UserException {
        // Clean up globally expired tokens
        try {
            passwordResetTokenRepository.deleteAllByExpiryDateBefore(LocalDateTime.now());
        } catch (Exception ignored) {
        }

        User user = userRepository.findByEmail(email);

        // Always return silently to caller to avoid account enumeration attacks.
        if (user == null) {
            return;
        }

        // Delete any existing tokens for this user so only one valid token exists at a time
        passwordResetTokenRepository.deleteAllByUser(user);

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusMinutes(5)) // 5 minutes expiry
                .build();

        passwordResetTokenRepository.save(resetToken);

        String baseUrl = frontendResetUrl != null ? frontendResetUrl : "http://localhost:5173/auth/reset-password?token=";
        if (!baseUrl.endsWith("=") && !baseUrl.contains("?token=")) {
            baseUrl = baseUrl.endsWith("/") ? baseUrl + "reset-password?token=" : baseUrl + "?token=";
        }
        String resetLink = baseUrl + token;
        String subject = "Reset Your NexPOS Password";
        String body = emailTemplateService.buildPasswordResetEmail(user.getFullName(), resetLink, 5);

        try {
            emailService.sendEmail(user.getEmail(), subject, body);
        } catch (Exception e) {
            // Log error silently without failing or exposing account existence
            log.warn("Failed to send password reset email to {}: {}", email, e.getMessage());
        }
    }


    @Transactional
    public void resetPassword(String token, String newPassword) {
        Optional<PasswordResetToken> optionalToken = passwordResetTokenRepository.findByToken(token);
        if (optionalToken.isEmpty()) {
            throw new BadCredentialsException("Invalid or expired token");
        }

        PasswordResetToken resetToken = optionalToken.get();

        if (resetToken.isExpired()) {
            // token expired — delete it
            passwordResetTokenRepository.delete(resetToken);
            throw new BadCredentialsException("Invalid or expired token");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordChangedAt(LocalDateTime.now());
        userRepository.save(user);

        // delete token after successful reset
        passwordResetTokenRepository.delete(resetToken);

        activityLogService.log(
                "PASSWORD_CHANGED",
                "Password changed for user \"" + user.getFullName() + "\"",
                "User",
                user.getId(),
                user.getFullName(),
                "SUCCESS"
        );
    }


}
