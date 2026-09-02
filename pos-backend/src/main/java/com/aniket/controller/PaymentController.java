package com.aniket.controller;
import com.aniket.exception.PaymentException;
import com.aniket.exception.UserException;
import com.aniket.payload.dto.PaymentDTO;
import com.aniket.payload.request.PaymentInitiateRequest;
import com.aniket.payload.request.PaymentVerifyRequest;
import com.aniket.payload.response.PaymentInitiateResponse;
import com.aniket.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * 🔹 Initiate payment for store subscription
     */
    @PostMapping("/initiate")
    @PreAuthorize("hasAnyRole('STORE_ADMIN', 'STORE_MANAGER', 'ADMIN')")
    public ResponseEntity<PaymentInitiateResponse> initiatePayment(
            @Valid @RequestBody PaymentInitiateRequest request) throws PaymentException {
        PaymentInitiateResponse response = paymentService.initiatePayment(request);
        return ResponseEntity.ok(response);
    }

    /**
     * 🔹 Verify payment after gateway callback
     */
    
    @PostMapping("/verify")
    @PreAuthorize("hasAnyRole('STORE_ADMIN', 'STORE_MANAGER', 'ADMIN')")
    public ResponseEntity<PaymentDTO> verifyPayment(
            @RequestBody PaymentVerifyRequest request) throws PaymentException {
        PaymentDTO paymentDTO = paymentService.verifyPayment(request);
        return ResponseEntity.ok(paymentDTO);
    }

    /**
     * 🔹 Get all payments for current store
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('STORE_ADMIN', 'STORE_MANAGER', 'ADMIN')")
    public ResponseEntity<Page<PaymentDTO>> getAllPayments(Pageable pageable) throws UserException {
        Page<PaymentDTO> payments = paymentService.getAllPayments(pageable);
        return ResponseEntity.ok(payments);
    }
}

