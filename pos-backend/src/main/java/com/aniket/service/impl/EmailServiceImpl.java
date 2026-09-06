package com.aniket.service.impl;

import com.aniket.service.EmailService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username:aniketmeshram445@gmail.com}")
    private String fromEmail;

    @Value("${mail.brevo.api-key:${BREVO_API_KEY:}}")
    private String brevoApiKey;

    @Value("${mail.resend.api-key:${RESEND_API_KEY:}}")
    private String resendApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    @Override
    public void sendEmailSync(String to, String subject, String body) throws Exception {
        if (to == null || to.trim().isEmpty()) {
            throw new IllegalArgumentException("Recipient address cannot be empty");
        }

        String recipient = to.trim();
        String sender = (fromEmail != null && !fromEmail.isBlank()) ? fromEmail.trim() : "aniketmeshram445@gmail.com";

        // Strategy 1: Brevo HTTP API (Port 443 - Bypasses Render Cloud SMTP Firewall)
        if (brevoApiKey != null && !brevoApiKey.isBlank()) {
            sendViaBrevo(recipient, sender, subject, body);
            return;
        }

        // Strategy 2: Resend HTTP API (Port 443 - Bypasses Render Cloud SMTP Firewall)
        if (resendApiKey != null && !resendApiKey.isBlank()) {
            sendViaResend(recipient, sender, subject, body);
            return;
        }

        // Strategy 3: Standard JavaMail SMTP (Used locally or on unrestricted servers)
        sendViaSmtp(recipient, sender, subject, body);
    }

    private void sendViaBrevo(String recipient, String sender, String subject, String body) throws Exception {
        log.info("[EmailService] Dispatching email via Brevo HTTPS API (Port 443) to {}", recipient);

        Map<String, Object> payload = new HashMap<>();
        payload.put("sender", Map.of("name", "NexPOS Platform", "email", sender));
        payload.put("to", List.of(Map.of("email", recipient)));
        payload.put("subject", subject);
        payload.put("htmlContent", body);

        String jsonPayload = objectMapper.writeValueAsString(payload);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                .header("api-key", brevoApiKey.trim())
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload, StandardCharsets.UTF_8))
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            log.info("[EmailService] Successfully sent email via Brevo to {}. Response: {}", recipient, response.body());
        } else {
            log.error("[EmailService] Brevo dispatch failed for {} (Status: {}). Response: {}", recipient, response.statusCode(), response.body());
            throw new RuntimeException("Brevo API error (" + response.statusCode() + "): " + response.body());
        }
    }

    private void sendViaResend(String recipient, String sender, String subject, String body) throws Exception {
        log.info("[EmailService] Dispatching email via Resend HTTPS API (Port 443) to {}", recipient);

        String fromField = (sender.endsWith("@resend.dev") || !sender.contains("@gmail.com"))
                ? "NexPOS <" + sender + ">"
                : "NexPOS <onboarding@resend.dev>";

        Map<String, Object> payload = new HashMap<>();
        payload.put("from", fromField);
        payload.put("to", List.of(recipient));
        payload.put("subject", subject);
        payload.put("html", body);

        String jsonPayload = objectMapper.writeValueAsString(payload);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.resend.com/emails"))
                .header("Authorization", "Bearer " + resendApiKey.trim())
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload, StandardCharsets.UTF_8))
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            log.info("[EmailService] Successfully sent email via Resend to {}. Response: {}", recipient, response.body());
        } else {
            log.error("[EmailService] Resend dispatch failed for {} (Status: {}). Response: {}", recipient, response.statusCode(), response.body());
            throw new RuntimeException("Resend API error (" + response.statusCode() + "): " + response.body());
        }
    }

    private void sendViaSmtp(String recipient, String sender, String subject, String body) throws Exception {
        log.info("[EmailService] Dispatching email via JavaMail SMTP to {}", recipient);

        if (javaMailSender instanceof org.springframework.mail.javamail.JavaMailSenderImpl impl) {
            if (impl.getPassword() != null && impl.getPassword().contains(" ")) {
                impl.setPassword(impl.getPassword().replace(" ", ""));
            }
        }

        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

        helper.setFrom(sender, "NexPOS");
        helper.setTo(recipient);
        helper.setSubject(subject);
        helper.setText(body, true);

        javaMailSender.send(mimeMessage);
        log.info("[EmailService] Successfully sent email via SMTP to {}", recipient);
    }

    @Async
    @Override
    public void sendEmail(String to, String subject, String body) {
        if (to == null || to.trim().isEmpty()) {
            log.warn("[Async Email] Recipient address is empty, skipping dispatch.");
            return;
        }

        String recipient = to.trim().toLowerCase();
        // Guard against test/dummy email domains that cause mailer-daemon delivery failure loops
        if (recipient.endsWith("@branch1.com")
                || recipient.endsWith("@test.com")
                || recipient.endsWith("@example.com")
                || recipient.endsWith("@teststore.com")
                || recipient.startsWith("live_audit")
                || recipient.startsWith("audit_test")) {
            log.info("[Async Email] Bypassing email dispatch for test/dummy recipient: {}", to);
            return;
        }

        try {
            sendEmailSync(to, subject, body);
        } catch (Exception e) {
            log.error("[Async Email] Failed to send email to {}: {}", to, e.getMessage(), e);
        }
    }
}
