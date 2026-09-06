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
    private final com.aniket.service.EmailService emailService;
    private final com.aniket.service.EmailTemplateService emailTemplateService;

    // Per-IP Rate limit: 20 login attempts per minute per client IP (production-grade brute-force protection)
    private final java.util.Map<String, Bucket> ipBuckets = new java.util.concurrent.ConcurrentHashMap<>();

    // Per-IP Rate limit: 5 forgot-password requests per minute per client IP (abuse & email-bombing protection)
    private final java.util.Map<String, Bucket> forgotPasswordIpBuckets = new java.util.concurrent.ConcurrentHashMap<>();

    // Per-IP Rate limit: 10 signup attempts per minute per client IP (mass account creation protection)
    private final java.util.Map<String, Bucket> signupIpBuckets = new java.util.concurrent.ConcurrentHashMap<>();

    /**
     * Extract the real client IP address.
     * When behind a reverse proxy (e.g., Render, Cloudflare), the proxy appends the real
     * client IP to X-Forwarded-For. We take the LAST entry before the proxy to get the
     * actual client IP, rather than the first entry which is client-controlled and spoofable.
     * If no proxy header, fall back to request.getRemoteAddr().
     */
    private String extractClientIp(jakarta.servlet.http.HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            // Take the LAST IP in the chain — this is the one appended by the trusted proxy
            // and represents the actual connecting client IP
            String[] ips = xff.split(",");
            String clientIp = ips[ips.length - 1].trim();
            if (!clientIp.isBlank()) {
                return clientIp;
            }
        }
        String remoteAddr = request.getRemoteAddr();
        return (remoteAddr != null && !remoteAddr.isBlank()) ? remoteAddr : "UNKNOWN";
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

    private Bucket resolveSignupBucket(jakarta.servlet.http.HttpServletRequest request) {
        String clientIp = extractClientIp(request);
        return signupIpBuckets.computeIfAbsent(clientIp, k -> Bucket.builder()
                .addLimit(Bandwidth.classic(10, Refill.greedy(10, Duration.ofMinutes(1))))
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
            jakarta.servlet.http.HttpServletRequest request,
            @RequestBody @Valid UserDTO req) throws UserException {

        Bucket clientBucket = resolveSignupBucket(request);
        if (!clientBucket.tryConsume(1)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(new ApiResponseBody<>(false,
                            "Too many signup attempts. Please try again later.", null));
        }

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

    @org.springframework.web.bind.annotation.GetMapping("/diagnostic-email")
    public ResponseEntity<java.util.Map<String, Object>> diagnosticEmail(
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "aniketmeshram445@gmail.com") String to) {
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("version", "v5-multi-strategy-email");
        result.put("timestamp", java.time.LocalDateTime.now().toString());
        result.put("recipient", to);

        String brevoKey = System.getenv("BREVO_API_KEY");
        String resendKey = System.getenv("RESEND_API_KEY");
        String activeStrategy = "Standard JavaMail SMTP (Port 587 - blocked on Render Free Tier)";
        if (brevoKey != null && !brevoKey.isBlank()) {
            activeStrategy = "Brevo HTTP API (Port 443 - Cloud Compatible)";
        } else if (resendKey != null && !resendKey.isBlank()) {
            activeStrategy = "Resend HTTP API (Port 443 - Cloud Compatible)";
        }
        result.put("activeStrategy", activeStrategy);

        try {
            String testBody = emailTemplateService.buildPasswordResetEmail("Diagnostic Test User", "https://pos-system-97v.pages.dev/auth/reset-password?token=diag-token-12345", 5);
            emailService.sendEmailSync(to, "NexPOS Diagnostic Test", testBody);
            result.put("status", "SUCCESS");
            result.put("message", "Email successfully delivered via " + activeStrategy + " to " + to);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("status", "ERROR");
            result.put("error", e.getMessage());
            result.put("errorClass", e.getClass().getName());
            java.io.StringWriter sw = new java.io.StringWriter();
            e.printStackTrace(new java.io.PrintWriter(sw));
            result.put("stackTrace", sw.toString());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }

}
