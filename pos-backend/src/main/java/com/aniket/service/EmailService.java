package com.aniket.service;

import org.springframework.scheduling.annotation.Async;

public interface EmailService {

    @Async
    void sendEmail(String to, String subject, String body);

//    void sendResetEmail(String to, String subject, String text);
}
