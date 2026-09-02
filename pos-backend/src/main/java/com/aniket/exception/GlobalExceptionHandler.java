package com.aniket.exception;

import com.aniket.payload.response.ExceptionResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(UserException.class)
    public ResponseEntity<ExceptionResponse> UserExceptionHandler(
            UserException ex, WebRequest req) {
        ExceptionResponse response = new ExceptionResponse(
                ex.getMessage(),
                req.getDescription(false), LocalDateTime.now());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(InsufficientStockException.class)
    public ResponseEntity<ExceptionResponse> handleInsufficientStockException(
            InsufficientStockException ex, WebRequest req) {
        ExceptionResponse response = new ExceptionResponse(
                ex.getMessage(),
                req.getDescription(false),
                LocalDateTime.now()
        );
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    public ResponseEntity<ExceptionResponse> handleIllegalArgumentException(
            RuntimeException ex, WebRequest req) {
        ExceptionResponse response = new ExceptionResponse(
                ex.getMessage(),
                req.getDescription(false),
                LocalDateTime.now()
        );
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler({AccessDeniedException.class, org.springframework.security.access.AccessDeniedException.class})
    public ResponseEntity<ExceptionResponse> handleAccessDenied(Exception ex, WebRequest req) {
        String message = ex.getMessage();
        if (message == null || message.trim().isEmpty() || message.equalsIgnoreCase("Access is denied")) {
            message = "Access Denied: You do not have permission to access this resource";
        }
        ExceptionResponse response = new ExceptionResponse(
                message,
                req.getDescription(false),
                LocalDateTime.now()
        );
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler({ResourceNotFoundException.class, jakarta.persistence.EntityNotFoundException.class, NoSuchElementException.class})
    public ResponseEntity<ExceptionResponse> handleNotFoundException(Exception ex, WebRequest req) {
        ExceptionResponse response = new ExceptionResponse(
                ex.getMessage(),
                req.getDescription(false),
                LocalDateTime.now()
        );
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ExceptionResponse> AuthenticationExceptionHandler(
            AuthenticationException ex, WebRequest req) {
        ExceptionResponse response = new ExceptionResponse(
                ex.getMessage(),
                req.getDescription(false),
                LocalDateTime.now()
        );
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ExceptionResponse> BadCredentialsExceptionHandler(
            BadCredentialsException ex, WebRequest req) {
        ExceptionResponse response = new ExceptionResponse(
                ex.getMessage(),
                req.getDescription(false),
                LocalDateTime.now()
        );
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }


    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolationException(
            DataIntegrityViolationException ex, WebRequest req) {

        Map<String, Object> response = new HashMap<>();
        String message = ex.getMessage();
        
        // Log full error server-side only
        log.error("Data integrity violation: {}", message, ex);

        // Sanitize error message — never leak raw SQL to the client
        String sanitizedMessage;
        if (message != null) {
            String lower = message.toLowerCase();
            if (lower.contains("sku") && (lower.contains("unique") || lower.contains("duplicate") || lower.contains("already exists"))) {
                sanitizedMessage = "SKU already exists";
            } else if (lower.contains("value too long") || lower.contains("too long") || lower.contains("length")) {
                sanitizedMessage = "One or more input values exceed maximum allowed character length";
            } else if (lower.contains("unique") || lower.contains("duplicate")) {
                // Extract the constraint name if available
                if (lower.contains("uk_store_product")) {
                    sanitizedMessage = "This product is already linked to this store";
                } else {
                    sanitizedMessage = "Duplicate entry detected";
                }
            } else if (lower.contains("not null") || lower.contains("not-null") || lower.contains("null value")) {
                sanitizedMessage = "A required field is missing";
            } else if (lower.contains("foreign key")) {
                sanitizedMessage = "Referenced record not found";
            } else if (lower.contains("null")) {
                sanitizedMessage = "A required field is missing";
            } else {
                sanitizedMessage = "Data integrity error";
            }
        } else {
            sanitizedMessage = "Data integrity error";
        }

        response.put("message", sanitizedMessage);
        response.put("timestamp", LocalDateTime.now());
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(PlanLimitExceededException.class)
    public ResponseEntity<Map<String, Object>> handlePlanLimitExceeded(
            PlanLimitExceededException ex, WebRequest req) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", ex.getMessage());
        response.put("timestamp", LocalDateTime.now());
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(FeatureNotEnabledException.class)
    public ResponseEntity<Map<String, Object>> handleFeatureNotEnabled(
            FeatureNotEnabledException ex, WebRequest req) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", "ADVANCED_REPORTS_NOT_AVAILABLE");
        response.put("message", ex.getMessage());
        response.put("timestamp", LocalDateTime.now());
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(
            org.springframework.web.bind.MethodArgumentNotValidException ex, WebRequest req) {
        Map<String, Object> response = new HashMap<>();
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
            errors.put(error.getField(), error.getDefaultMessage())
        );
        String firstError = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .orElse("Validation failed");

        response.put("message", firstError);
        response.put("errors", errors);
        response.put("timestamp", LocalDateTime.now());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(jakarta.validation.ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolationException(
            jakarta.validation.ConstraintViolationException ex, WebRequest req) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", ex.getMessage());
        response.put("timestamp", LocalDateTime.now());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ExceptionResponse> ExceptionHandler(Exception ex,
                                                              WebRequest req) {
        // Log full stack trace server-side
        log.error("Unhandled exception: {}", ex.getMessage(), ex);

        ExceptionResponse response = new ExceptionResponse(
                "An internal error occurred",
                req.getDescription(false),
                LocalDateTime.now()
        );

        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}