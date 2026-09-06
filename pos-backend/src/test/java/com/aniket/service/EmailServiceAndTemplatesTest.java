package com.aniket.service;

import com.aniket.service.impl.EmailServiceImpl;
import com.aniket.service.impl.EmailTemplateServiceImpl;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EmailServiceAndTemplatesTest {

    @Mock
    private JavaMailSender javaMailSender;

    private EmailServiceImpl emailService;
    private EmailTemplateServiceImpl templateService;

    @BeforeEach
    void setUp() {
        emailService = new EmailServiceImpl(javaMailSender);
        ReflectionTestUtils.setField(emailService, "fromEmail", "aniketmeshram445@gmail.com");

        templateService = new EmailTemplateServiceImpl();
        ReflectionTestUtils.setField(templateService, "frontendBaseUrl", "https://pos-system-97v.pages.dev");
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 1. Template Generation Tests (All 9 Methods)
    // ─────────────────────────────────────────────────────────────────────────────

    @Test
    void testBuildPasswordResetEmail() {
        String html = templateService.buildPasswordResetEmail(
                "Aniket Meshram",
                "https://pos-system-97v.pages.dev/auth/reset-password?token=sample-token-123",
                5
        );

        assertNotNull(html);
        assertTrue(html.contains("Hello Aniket Meshram,"));
        assertTrue(html.contains("https://pos-system-97v.pages.dev/auth/reset-password?token=sample-token-123"));
        assertTrue(html.contains("Reset Password"));
        assertTrue(html.contains("5 minutes"));
        assertTrue(html.contains("SECURITY"));
    }

    @Test
    void testBuildPasswordResetEmail_NullRecipient() {
        String html = templateService.buildPasswordResetEmail(
                null,
                "https://pos-system-97v.pages.dev/auth/reset-password?token=sample-token-123",
                5
        );

        assertNotNull(html);
        assertTrue(html.contains("Hello,"));
        assertTrue(html.contains("https://pos-system-97v.pages.dev/auth/reset-password?token=sample-token-123"));
    }

    @Test
    void testBuildStoreSubmittedEmail() {
        String html = templateService.buildStoreSubmittedEmail("Swapnil Jadhav", "Swapnil Mega Mart", "Supermarket");

        assertNotNull(html);
        assertTrue(html.contains("Swapnil Mega Mart"));
        assertTrue(html.contains("Supermarket"));
        assertTrue(html.contains("Pending Super Admin Verification"));
        assertTrue(html.contains("https://pos-system-97v.pages.dev/auth/login"));
    }

    @Test
    void testBuildStoreApprovedEmail() {
        String html = templateService.buildStoreApprovedEmail("Swapnil Jadhav", "Swapnil Mega Mart", "Enterprise Plan", null);

        assertNotNull(html);
        assertTrue(html.contains("Swapnil Mega Mart"));
        assertTrue(html.contains("Enterprise Plan"));
        assertTrue(html.contains("Active &amp; Approved"));
        assertTrue(html.contains("https://pos-system-97v.pages.dev/auth/login"));
    }

    @Test
    void testBuildStoreRejectedEmail() {
        String html = templateService.buildStoreRejectedEmail("Swapnil Jadhav", "Swapnil Mega Mart", "Invalid GST Certificate", null);

        assertNotNull(html);
        assertTrue(html.contains("Swapnil Mega Mart"));
        assertTrue(html.contains("Invalid GST Certificate"));
        assertTrue(html.contains("https://pos-system-97v.pages.dev/auth/onboarding"));
    }

    @Test
    void testBuildStoreBlockedEmail() {
        String html = templateService.buildStoreBlockedEmail("Swapnil Jadhav", "Swapnil Mega Mart", "Compliance audit failure", null);

        assertNotNull(html);
        assertTrue(html.contains("Swapnil Mega Mart"));
        assertTrue(html.contains("Compliance audit failure"));
        assertTrue(html.contains("support@nexpos.com"));
        assertTrue(html.contains("SUSPENDED"));
    }

    @Test
    void testBuildSubscriptionApprovedEmail() {
        String html = templateService.buildSubscriptionApprovedEmail("Swapnil Jadhav", "Swapnil Mega Mart", "Pro Tier", 2999.0, null);

        assertNotNull(html);
        assertTrue(html.contains("Swapnil Mega Mart"));
        assertTrue(html.contains("Pro Tier"));
        assertTrue(html.contains("₹2,999 / month"));
        assertTrue(html.contains("https://pos-system-97v.pages.dev/store/settings"));
    }

    @Test
    void testBuildSubscriptionRejectedEmail() {
        String html = templateService.buildSubscriptionRejectedEmail("Swapnil Jadhav", "Swapnil Mega Mart", "Enterprise Tier", "Invalid UTR", null);

        assertNotNull(html);
        assertTrue(html.contains("Swapnil Mega Mart"));
        assertTrue(html.contains("Enterprise Tier"));
        assertTrue(html.contains("Invalid UTR"));
        assertTrue(html.contains("https://pos-system-97v.pages.dev/store/upgrade"));
    }

    @Test
    void testBuildStaffInviteEmail() {
        String html = templateService.buildStaffInviteEmail(
                "Rakesh Kamble",
                "ROLE_BRANCH_CASHIER",
                "Swapnil Mega Mart",
                "Downtown Branch",
                "rakesh@gmail.com",
                "TempPass123!",
                null
        );

        assertNotNull(html);
        assertTrue(html.contains("Rakesh Kamble"));
        assertTrue(html.contains("BRANCH CASHIER"));
        assertTrue(html.contains("Swapnil Mega Mart"));
        assertTrue(html.contains("Downtown Branch"));
        assertTrue(html.contains("rakesh@gmail.com"));
        assertTrue(html.contains("TempPass123!"));
        assertTrue(html.contains("https://pos-system-97v.pages.dev/auth/login"));
    }

    @Test
    void testBuildGeneralNotificationEmail() {
        String html = templateService.buildGeneralNotificationEmail(
                "Store Admin",
                "System Maintenance Alert",
                "SCHEDULED MAINTENANCE",
                "warning",
                "Routine maintenance is scheduled at 2:00 AM IST.",
                Map.of("Duration", "30 Minutes", "Impact", "Zero Downtime"),
                "View Status",
                "https://pos-system-97v.pages.dev/store/dashboard"
        );

        assertNotNull(html);
        assertTrue(html.contains("System Maintenance Alert"));
        assertTrue(html.contains("SCHEDULED MAINTENANCE"));
        assertTrue(html.contains("Routine maintenance is scheduled"));
        assertTrue(html.contains("Duration"));
        assertTrue(html.contains("30 Minutes"));
        assertTrue(html.contains("https://pos-system-97v.pages.dev/store/dashboard"));
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 2. Email Service Logic & Dispatch Tests
    // ─────────────────────────────────────────────────────────────────────────────

    @Test
    void testSendEmail_ValidRecipient() {
        MimeMessage mimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendEmail("aniketmeshram445@gmail.com", "Test Subject", "<p>Test Content</p>");

        verify(javaMailSender, times(1)).createMimeMessage();
        verify(javaMailSender, times(1)).send(mimeMessage);
    }

    @Test
    void testSendEmail_BypassTestAndDummyRecipients() {
        emailService.sendEmail("dummy@branch1.com", "Test Subject", "<p>Test Content</p>");
        emailService.sendEmail("tester@test.com", "Test Subject", "<p>Test Content</p>");
        emailService.sendEmail("sample@example.com", "Test Subject", "<p>Test Content</p>");
        emailService.sendEmail("live_audit_emp_99@branch1.com", "Test Subject", "<p>Test Content</p>");
        emailService.sendEmail("", "Test Subject", "<p>Test Content</p>");
        emailService.sendEmail(null, "Test Subject", "<p>Test Content</p>");

        verify(javaMailSender, never()).createMimeMessage();
        verify(javaMailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    void testSendEmailSync_Success() throws Exception {
        MimeMessage mimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);

        assertDoesNotThrow(() -> emailService.sendEmailSync("aniketmeshram445@gmail.com", "Subject", "<p>Body</p>"));
        verify(javaMailSender, times(1)).createMimeMessage();
    }
}
