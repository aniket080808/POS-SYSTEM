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
