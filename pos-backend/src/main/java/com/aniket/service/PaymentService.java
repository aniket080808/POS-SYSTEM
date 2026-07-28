package com.aniket.service;

import com.aniket.exception.PaymentException;
import com.aniket.exception.UserException;
import com.aniket.payload.dto.PaymentDTO;
import com.aniket.payload.request.PaymentInitiateRequest;
import com.aniket.payload.request.PaymentVerifyRequest;
import com.aniket.payload.response.PaymentInitiateResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PaymentService {
    /**
     * Initiate a new payment (creates order with payment gateway)
     */
    PaymentInitiateResponse initiatePayment(PaymentInitiateRequest request) throws PaymentException;

    /**
     * Verify payment after gateway callback
     */
    PaymentDTO verifyPayment(PaymentVerifyRequest request) throws PaymentException;


    /**
     * Get all payments (admin)
     */
    Page<PaymentDTO> getAllPayments(Pageable pageable) throws UserException;




}
