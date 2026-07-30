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

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<String> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
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
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ExceptionResponse> ResourceNotFoundExceptionHandler(
            ResourceNotFoundException ex, WebRequest req) {
        ExceptionResponse response = new ExceptionResponse(
                ex.getMessage(),
                req.getDescription(false),
                LocalDateTime.now()
        );
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
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