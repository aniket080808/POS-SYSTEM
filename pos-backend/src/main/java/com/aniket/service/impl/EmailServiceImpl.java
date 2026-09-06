package com.aniket.service.impl;

import com.aniket.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender javaMailSender;

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

        CompletableFuture.runAsync(() -> {
            String threadName = Thread.currentThread().getName();
            log.info("[Async Email] Starting email dispatch to {} on thread: {}", to, threadName);
            try {
                MimeMessage mimeMessage = javaMailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

                helper.setSubject(subject);
                helper.setText(body, true);
                helper.setTo(to);
                javaMailSender.send(mimeMessage);
                log.info("[Async Email] Successfully sent email to {} on thread: {}", to, threadName);
            } catch (Exception e) {
                log.error("[Async Email] Failed to send email to {}: {}", to, e.getMessage());
            }
        });
    }
}
