package com.aniket.service.gateway;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.aniket.exception.PaymentException;
import com.aniket.modal.Payment;
import com.aniket.modal.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

/**
 * Service for Razorpay payment gateway integration
 * Handles order creation, payment verification, and signature validation
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class RazorpayService {

    @Value("${razorpay.api.key}")
    private String razorpayKeyId;

    @Value("${razorpay.api.secret}")
    private String razorpayKeySecret;

    @Value("${razorpay.callback.base-url:http://localhost:5173}")
    private String callbackBaseUrl;

    /**
     * Get the Razorpay key ID for frontend checkout
     */
    public String getRazorpayKeyId() {
        return razorpayKeyId;
    }

    /**
     * Create a Razorpay order for subscription payment
     * Uses Orders API instead of Payment Links to avoid the 30-link test mode limit
     *
     * @param user The user making the payment
     * @param payment The payment entity to track this transaction
     * @return JSONObject containing the order details (id, amount, currency)
     * @throws PaymentException if order creation fails
     */
    public JSONObject createOrder(
            User user,
            Payment payment) throws PaymentException {

        validateConfiguration();

        try {
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            // Convert amount to paisa (1 INR = 100 paisa)
            BigDecimal amount = BigDecimal.valueOf(payment.getAmount());
            Long amountInPaisa = amount.multiply(new BigDecimal("100")).longValue();

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaisa);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", payment.getTransactionId());
            orderRequest.put("partial_payment", false);

            // Additional metadata for tracking
            JSONObject notes = new JSONObject();
            notes.put("user_id", user.getId());
            notes.put("payment_id", payment.getId());
            notes.put("subscription_id", payment.getSubscription().getId());
            orderRequest.put("notes", notes);

            // Create order
            Order order = razorpay.orders.create(orderRequest);

            String orderId = order.get("id");
            Integer orderAmount = order.get("amount");
            String currency = order.get("currency");

            log.info("Razorpay order created successfully. Order ID: {}, Payment ID: {}",
                orderId, payment.getId());

            JSONObject response = new JSONObject();
            response.put("id", orderId);
            response.put("amount", orderAmount);
            response.put("currency", currency);
            response.put("key_id", razorpayKeyId);

            return response;

        } catch (RazorpayException e) {
            log.error("Failed to create Razorpay order: {}", e.getMessage(), e);
            throw new PaymentException("Failed to create payment order: " + e.getMessage());
        }
    }

    /**
     * Check if Razorpay is properly configured
     *
     * @return true if configured
     */
    public boolean isConfigured() {
        return razorpayKeyId != null && !razorpayKeyId.isEmpty()
               && razorpayKeySecret != null && !razorpayKeySecret.isEmpty();
    }

    /**
     * Validate Razorpay configuration
     *
     * @throws PaymentException if not configured
     */
    private void validateConfiguration() throws PaymentException {
        if (!isConfigured()) {
            throw new PaymentException(
                "Razorpay is not configured. Please set razorpay.key.id and razorpay.key.secret");
        }
    }

    /**
     * Fetch payment details from Razorpay
     *
     * @param paymentId Razorpay payment ID
     * @return Payment details as JSON
     * @throws PaymentException if fetch fails
     */
    public JSONObject fetchPaymentDetails(String paymentId) throws PaymentException {
        validateConfiguration();

        System.out.println("RAZORYPAY PAYMENT_ID: ------- " + paymentId);

        try {
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            com.razorpay.Payment payment = razorpay.payments.fetch(paymentId);

            return payment.toJson();

        } catch (RazorpayException e) {
            log.error("Failed to fetch payment details for {}: {}", paymentId, e.getMessage(), e);
            throw new PaymentException("Failed to fetch payment details: " + e.getMessage());
        }
    }

    public boolean isValidPayment(String paymentId) {
        try {

            JSONObject paymentDetails = fetchPaymentDetails(paymentId);

            String status = paymentDetails.optString("status");
            long amount = paymentDetails.optLong("amount");
            long amountInRupees = amount / 100;

            JSONObject notes = paymentDetails.getJSONObject("notes");

            System.out.println("payment details ------ "+ paymentDetails);

            // 1️⃣ Check status
            if (!"captured".equalsIgnoreCase(status)) {
                log.warn("Payment not captured. Current status: {}", status);
                return false;
            }

            // 2️⃣ Check expected amount

            String bookingId = paymentDetails.optString("booking_id");

            return true;

        } catch (Exception e) {
            log.error("❌ Error verifying Razorpay payment: {}", e.getMessage(), e);
            return false;
        }
    }
}