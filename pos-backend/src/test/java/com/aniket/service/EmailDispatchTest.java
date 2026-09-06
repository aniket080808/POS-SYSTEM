package com.aniket.service;

import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;

import java.util.Properties;

public class EmailDispatchTest {

    @Test
    @Disabled("Manual verification only")
    public void testDirectSend() throws Exception {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost("smtp.gmail.com");
        sender.setPort(587);
        sender.setUsername("aniketmeshram445@gmail.com");
        sender.setPassword("otah jlph xjrd jzwq");

        Properties props = sender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.smtp.ssl.trust", "smtp.gmail.com");

        MimeMessage msg = sender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
        helper.setFrom("aniketmeshram445@gmail.com", "NexPOS Platform");
        helper.setTo("aniketmeshram445@gmail.com");
        helper.setSubject("NexPOS Email Verification Test");
        helper.setText("<h1>NexPOS Email Test</h1><p>Testing JavaMailSender directly.</p>", true);

        sender.send(msg);
        System.out.println(">>> Direct send SUCCESSFUL!");
    }
}
