package com.aniket.controller;

import com.razorpay.RazorpayException;
import com.stripe.exception.StripeException;
import com.aniket.domain.PaymentGateway;
import com.aniket.exception.UserException;
import com.aniket.modal.PaymentOrder;
import com.aniket.modal.User;
import com.aniket.payload.response.PaymentLinkResponse;
import com.aniket.service.PaymentService;
import com.aniket.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final UserService userService;


//    @PostMapping("/create")
//    public ResponseEntity<PaymentLinkResponse> createPaymentLink(
//            @RequestHeader("Authorization") String jwt,
//            @RequestParam Long planId,
//            @RequestParam PaymentGateway paymentMethod) throws UserException, RazorpayException, StripeException {
//
//
//            User user = userService.getUserFromJwtToken(jwt);
//
//
//
//            PaymentLinkResponse paymentLinkResponse =
//                    paymentService.initiatePayment(user, planId, paymentMethod);
//            return ResponseEntity.ok(paymentLinkResponse);
//
//
//    }



//    @PatchMapping("/proceed")
//    public ResponseEntity<Boolean> proceedPayment(
//            @RequestParam String paymentId,
//            @RequestParam String paymentLinkId) throws Exception {
//
//            PaymentOrder paymentOrder = paymentService.
//                    getPaymentOrderByPaymentId(paymentLinkId);
//            Boolean success = paymentService.ProceedPaymentOrder(
//                    paymentOrder,
//                    paymentId, paymentLinkId);
//            return ResponseEntity.ok(success);
//
//    }


}
