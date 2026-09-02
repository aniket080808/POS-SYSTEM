package com.aniket.service;

import java.util.Map;

public interface EmailTemplateService {

    /**
     * Builds a password reset email with secure 5-minute action button and security notice.
     */
    String buildPasswordResetEmail(String recipientName, String resetLink, int expiryMinutes);

    /**
     * Builds a welcome email sent to merchants right after submitting onboarding.
     */
    String buildStoreSubmittedEmail(String recipientName, String storeBrand, String storeType);

    /**
     * Builds an approval notification email sent when a store registration is approved.
     */
    String buildStoreApprovedEmail(String recipientName, String storeBrand, String planName, String loginUrl);

    /**
     * Builds a rejection notification email with the admin's rejection reason and resubmission guidance.
     */
    String buildStoreRejectedEmail(String recipientName, String storeBrand, String reason, String resubmitUrl);

    /**
     * Builds a suspension/block notification email sent when a store account is blocked.
     */
    String buildStoreBlockedEmail(String recipientName, String storeBrand, String reason, String supportEmail);

    /**
     * Builds an email notification when a requested subscription plan change is approved.
     */
    String buildSubscriptionApprovedEmail(String recipientName, String storeBrand, String planName, Double price, String manageUrl);

    /**
     * Builds an email notification when a requested subscription plan change is rejected.
     */
    String buildSubscriptionRejectedEmail(String recipientName, String storeBrand, String planName, String reason, String upgradeUrl);

    /**
     * Builds an invitation email for new staff/cashier members with login credentials and access info.
     */
    String buildStaffInviteEmail(String staffName, String roleName, String storeBrand, String branchName, String email, String temporaryPassword, String loginUrl);

    /**
     * Builds a general styled notification email.
     */
    String buildGeneralNotificationEmail(String recipientName, String title, String badgeText, String badgeType, String message, Map<String, String> details, String actionText, String actionUrl);
}
