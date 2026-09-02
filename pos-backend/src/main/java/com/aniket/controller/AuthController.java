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

    // Per-IP Rate limit: 20 login attempts per minute per client IP (production-grade brute-force protection)
    private final java.util.Map<String, Bucket> ipBuckets = new java.util.concurrent.ConcurrentHashMap<>();

    // Per-IP Rate limit: 5 forgot-password requests per minute per client IP (abuse & email-bombing protection)
    private final java.util.Map<String, Bucket> forgotPasswordIpBuckets = new java.util.concurrent.ConcurrentHashMap<>();

    private String extractClientIp(jakarta.servlet.http.HttpServletRequest request) {
        String clientIp = request.getHeader("X-Forwarded-For");
        if (clientIp == null || clientIp.isBlank()) {
            clientIp = request.getRemoteAddr();
        } else {
            clientIp = clientIp.split(",")[0].trim();
        }
        if (clientIp == null || clientIp.isBlank()) {
            clientIp = "UNKNOWN";
        }
        return clientIp;
    }

    private Bucket resolveBucket(jakarta.servlet.http.HttpServletRequest request) {
        String clientIp = extractClientIp(request);
        return ipBuckets.computeIfAbsent(clientIp, k -> Bucket.builder()
                .addLimit(Bandwidth.classic(20, Refill.greedy(20, Duration.ofMinutes(1))))
                .build());
    }

    private Bucket resolveForgotPasswordBucket(jakarta.servlet.http.HttpServletRequest request) {
        String clientIp = extractClientIp(request);
        return forgotPasswordIpBuckets.computeIfAbsent(clientIp, k -> Bucket.builder()
                .addLimit(Bandwidth.classic(5, Refill.greedy(5, Duration.ofMinutes(1))))
                .build());
    }

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
            jakarta.servlet.http.HttpServletRequest request,
            @RequestBody LoginDto req) throws UserException {

        Bucket clientBucket = resolveBucket(request);
        if (!clientBucket.tryConsume(1)) {
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
            jakarta.servlet.http.HttpServletRequest request,
            @RequestBody @Valid ForgotPasswordRequest forgotPasswordReq
    ) throws UserException {

        Bucket clientBucket = resolveForgotPasswordBucket(request);
        if (!clientBucket.tryConsume(1)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(new ApiResponse("Too many password reset requests. Please try again later."));
        }

        authService.createPasswordResetToken(forgotPasswordReq.getEmail());

        ApiResponse res= new ApiResponse(
                "A Reset link was sent to your email."
        );
        return ResponseEntity.ok(res);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(
            @RequestBody @Valid ResetPasswordRequest request) {
         authService.resetPassword(request.getToken(), request.getPassword());
        ApiResponse res= new ApiResponse(
                "Password reset successful"
        );
        return ResponseEntity.ok(res);
    }


}
