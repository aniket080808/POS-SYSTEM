package com.aniket.service.impl;

import com.aniket.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import org.springframework.beans.factory.annotation.Value;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username:aniketmeshram445@gmail.com}")
    private String fromEmail;

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
            log.info("[Async Email] Starting email dispatch to {} with subject: '{}'", to, subject);
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            String sender = (fromEmail != null && !fromEmail.isBlank()) ? fromEmail.trim() : "aniketmeshram445@gmail.com";
            helper.setFrom(sender, "NexPOS");
            helper.setTo(to.trim());
            helper.setSubject(subject);
            helper.setText(body, true);

            javaMailSender.send(mimeMessage);
            log.info("[Async Email] Successfully sent email to {}", to);
        } catch (Exception e) {
            log.error("[Async Email] Failed to send email to {}: {}", to, e.getMessage(), e);
        }
    }
}
