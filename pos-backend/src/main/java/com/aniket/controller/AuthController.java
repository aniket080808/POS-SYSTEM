package com.aniket.controller;


import com.aniket.configrations.JwtProvider;
import com.aniket.exception.UserException;
import com.aniket.payload.dto.UserDTO;
import com.aniket.payload.request.ForgotPasswordRequest;
import com.aniket.payload.request.LoginDto;
import com.aniket.payload.request.ResetPasswordRequest;
import com.aniket.payload.response.ApiResponse;
import com.aniket.payload.response.ApiResponseBody;

import com.aniket.payload.response.AuthResponse;
import com.aniket.repository.UserRepository;

import com.aniket.payload.request.OnboardingRequestDTO;
import com.aniket.service.AuthService;
import com.aniket.service.OnboardingService;
import com.aniket.service.UserService;
import com.aniket.service.impl.CustomUserImplementation;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {


    private final AuthService authService;
    private final OnboardingService onboardingService;

    // Rate limit: 5 login attempts per minute (brute-force protection)
    private final Bucket loginBucket = Bucket.builder()
            .addLimit(Bandwidth.classic(5, Refill.greedy(5, Duration.ofMinutes(1))))
            .build();

    @PostMapping("/onboarding")
    public ResponseEntity<ApiResponseBody<AuthResponse>> onboardingHandler(
            @RequestBody @Valid OnboardingRequestDTO req) throws UserException {

        AuthResponse response = onboardingService.completeOnboarding(req);

        return ResponseEntity.ok(new ApiResponseBody<>(true,
                "Onboarding completed successfully", response));
    }

    @PostMapping("/signup")
    public ResponseEntity<ApiResponseBody<AuthResponse>> signupHandler(
            @RequestBody @Valid UserDTO req) throws UserException {


        AuthResponse response=authService.signup(req);


        return ResponseEntity.ok(new ApiResponseBody<>(true,
                "User created successfully", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponseBody<AuthResponse>> loginHandler(
            @RequestBody LoginDto req) throws UserException {

        if (!loginBucket.tryConsume(1)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(new ApiResponseBody<>(false,
                            "Too many login attempts. Please try again later.", null));
        }

        AuthResponse response=authService.login(req.getEmail(), req.getPassword());

        return ResponseEntity.ok(new ApiResponseBody<>(
                true,
                "User logged in successfully",
                response));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(
            @RequestBody ForgotPasswordRequest request
    ) throws UserException {

        authService.createPasswordResetToken(request.getEmail());

        ApiResponse res= new ApiResponse(
                "A Reset link was sent to your email."
        );
        return ResponseEntity.ok(res);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(
            @RequestBody ResetPasswordRequest request) {
         authService.resetPassword(request.getToken(), request.getPassword());
        ApiResponse res= new ApiResponse(
                "Password reset successful"
        );
        return ResponseEntity.ok(res);
    }


}
