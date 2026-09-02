package com.aniket.service.impl;

import com.aniket.service.EmailTemplateService;
import org.springframework.stereotype.Service;

import java.time.Year;
import java.util.Map;

@Service
public class EmailTemplateServiceImpl implements EmailTemplateService {

    private static final String APP_NAME = "NexPOS";
    private static final String BRAND_TAGLINE = "Platform Master Console & Retail Intelligence";
    private static final String DEFAULT_LOGIN_URL = "http://localhost:5173/auth/login";
    private static final String DEFAULT_SUPPORT_EMAIL = "support@nexpos.com";

    @Override
    public String buildPasswordResetEmail(String recipientName, String resetLink, int expiryMinutes) {
        String greeting = (recipientName != null && !recipientName.isBlank()) ? "Hello " + escapeHtml(recipientName) + "," : "Hello,";
        String content = ""
                + "<p style='margin:0 0 16px 0;font-size:15px;line-height:24px;color:#E4E4E7;'>" + greeting + "</p>"
                + "<p style='margin:0 0 20px 0;font-size:15px;line-height:24px;color:#A1A1AA;'>We received a request to reset the password for your NexPOS account. Click the secure button below to set a new password:</p>"
                + "<div style='text-align:center;margin:30px 0;'>"
                + "  <a href='" + escapeHtml(resetLink) + "' target='_blank' style='display:inline-block;background:linear-gradient(135deg,#F59E0B 0%,#D97706 100%);color:#09090B;font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:8px;letter-spacing:0.3px;box-shadow:0 4px 14px rgba(245,158,11,0.35);'>Reset Password</a>"
                + "</div>"
                + renderAlertBox("Security Notice", "This password reset link is valid for <strong>" + expiryMinutes + " minutes</strong> only. If you did not initiate this request, you can safely ignore this email — your account remains secure.", "warning")
                + "<p style='margin:24px 0 8px 0;font-size:13px;line-height:20px;color:#71717A;'>If the button doesn't work, copy and paste this URL directly into your browser:</p>"
                + "<p style='margin:0;font-size:12px;line-height:18px;word-break:break-all;color:#F59E0B;'><a href='" + escapeHtml(resetLink) + "' style='color:#F59E0B;text-decoration:underline;'>" + escapeHtml(resetLink) + "</a></p>";

        return buildBaseLayout(
                "Reset Your Password",
                "SECURITY",
                "info",
                "Password Reset Request",
                content
        );
    }

    @Override
    public String buildStoreSubmittedEmail(String recipientName, String storeBrand, String storeType) {
        String greeting = (recipientName != null && !recipientName.isBlank()) ? "Hello " + escapeHtml(recipientName) + "," : "Hello,";
        String detailsHtml = ""
                + renderDetailRow("Store Brand", storeBrand)
                + renderDetailRow("Store Category", storeType != null ? storeType : "Retail Store")
                + renderDetailRow("Application Status", "Pending Super Admin Verification");

        String content = ""
                + "<p style='margin:0 0 16px 0;font-size:15px;line-height:24px;color:#E4E4E7;'>" + greeting + "</p>"
                + "<p style='margin:0 0 20px 0;font-size:15px;line-height:24px;color:#A1A1AA;'>Thank you for registering your retail business with NexPOS! Your store application has been successfully submitted and is currently being reviewed by our platform administrators.</p>"
                + renderDetailsTable(detailsHtml)
                + renderAlertBox("What happens next?", "1. Our verification team reviews your store profile within 24 hours.<br/>2. You will receive an email confirmation as soon as your store is approved.<br/>3. Once approved, you can log in, select a plan, and start billing immediately.", "info")
                + "<div style='text-align:center;margin:28px 0 10px 0;'>"
                + "  <a href='" + DEFAULT_LOGIN_URL + "' target='_blank' style='display:inline-block;background:linear-gradient(135deg,#F59E0B 0%,#D97706 100%);color:#09090B;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:8px;'>Visit Store Console</a>"
                + "</div>";

        return buildBaseLayout(
                "Store Application Received",
                "UNDER REVIEW",
                "warning",
                "Welcome to NexPOS",
                content
        );
    }

    @Override
    public String buildStoreApprovedEmail(String recipientName, String storeBrand, String planName, String loginUrl) {
        String greeting = (recipientName != null && !recipientName.isBlank()) ? "Hello " + escapeHtml(recipientName) + "," : "Hello,";
        String targetLogin = (loginUrl != null && !loginUrl.isBlank()) ? loginUrl : DEFAULT_LOGIN_URL;
        String detailsHtml = ""
                + renderDetailRow("Store Brand", storeBrand)
                + renderDetailRow("Account Status", "Active & Approved")
                + renderDetailRow("Assigned Plan", planName != null ? planName : "Starter");

        String content = ""
                + "<p style='margin:0 0 16px 0;font-size:15px;line-height:24px;color:#E4E4E7;'>" + greeting + "</p>"
                + "<p style='margin:0 0 20px 0;font-size:15px;line-height:24px;color:#A1A1AA;'>Great news! Your store account for <strong style='color:#FAFAFA;'>" + escapeHtml(storeBrand) + "</strong> has been verified and approved by the NexPOS platform administrators. Your store terminal is now live!</p>"
                + renderDetailsTable(detailsHtml)
                + "<div style='text-align:center;margin:30px 0;'>"
                + "  <a href='" + escapeHtml(targetLogin) + "' target='_blank' style='display:inline-block;background:linear-gradient(135deg,#10B981 0%,#059669 100%);color:#FFFFFF;font-size:15px;font-weight:700;text-decoration:none;padding:14px 34px;border-radius:8px;box-shadow:0 4px 14px rgba(16,185,129,0.35);'>Launch Store Dashboard</a>"
                + "</div>"
                + renderAlertBox("Quick Start Tip", "Add your branches, create staff/cashier accounts, and start processing point-of-sale transactions with live inventory tracking.", "success");

        return buildBaseLayout(
                "Store Registration Approved",
                "ACTIVE & APPROVED",
                "success",
                "Your Store is Ready!",
                content
        );
    }

    @Override
    public String buildStoreRejectedEmail(String recipientName, String storeBrand, String reason, String resubmitUrl) {
        String greeting = (recipientName != null && !recipientName.isBlank()) ? "Hello " + escapeHtml(recipientName) + "," : "Hello,";
        String targetResubmit = (resubmitUrl != null && !resubmitUrl.isBlank()) ? resubmitUrl : "http://localhost:5173/auth/onboarding";
        String note = (reason != null && !reason.isBlank()) ? reason : "Store information did not meet verification criteria.";

        String content = ""
                + "<p style='margin:0 0 16px 0;font-size:15px;line-height:24px;color:#E4E4E7;'>" + greeting + "</p>"
                + "<p style='margin:0 0 20px 0;font-size:15px;line-height:24px;color:#A1A1AA;'>We reviewed your registration request for <strong style='color:#FAFAFA;'>" + escapeHtml(storeBrand) + "</strong>, but unfortunately, it could not be approved at this time.</p>"
                + renderAlertBox("Administrator Rejection Reason", escapeHtml(note), "danger")
                + "<p style='margin:20px 0;font-size:14px;line-height:22px;color:#A1A1AA;'>You can update your store details and submit your application for review again by clicking the button below:</p>"
                + "<div style='text-align:center;margin:28px 0;'>"
                + "  <a href='" + escapeHtml(targetResubmit) + "' target='_blank' style='display:inline-block;background:linear-gradient(135deg,#F59E0B 0%,#D97706 100%);color:#09090B;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:8px;'>Resubmit Application</a>"
                + "</div>";

        return buildBaseLayout(
                "Store Application Update",
                "NEEDS REVISION",
                "danger",
                "Registration Update",
                content
        );
    }

    @Override
    public String buildStoreBlockedEmail(String recipientName, String storeBrand, String reason, String supportEmail) {
        String greeting = (recipientName != null && !recipientName.isBlank()) ? "Hello " + escapeHtml(recipientName) + "," : "Hello,";
        String contactEmail = (supportEmail != null && !supportEmail.isBlank()) ? supportEmail : DEFAULT_SUPPORT_EMAIL;
        String note = (reason != null && !reason.isBlank()) ? reason : "Administrative policy enforcement or compliance review.";

        String content = ""
                + "<p style='margin:0 0 16px 0;font-size:15px;line-height:24px;color:#E4E4E7;'>" + greeting + "</p>"
                + "<p style='margin:0 0 20px 0;font-size:15px;line-height:24px;color:#A1A1AA;'>This is an official notice that your store account <strong style='color:#FAFAFA;'>" + escapeHtml(storeBrand) + "</strong> has been suspended by the platform administration.</p>"
                + renderAlertBox("Suspension Reason", escapeHtml(note), "danger")
                + "<p style='margin:20px 0;font-size:14px;line-height:22px;color:#A1A1AA;'>During suspension, point-of-sale terminals and staff logins for this store will remain locked. If you believe this is in error or wish to appeal, please contact platform support at <a href='mailto:" + escapeHtml(contactEmail) + "' style='color:#F59E0B;text-decoration:underline;'>" + escapeHtml(contactEmail) + "</a>.</p>";

        return buildBaseLayout(
                "Store Account Suspended",
                "SUSPENDED",
                "danger",
                "Account Status Notice",
                content
        );
    }

    @Override
    public String buildSubscriptionApprovedEmail(String recipientName, String storeBrand, String planName, Double price, String manageUrl) {
        String greeting = (recipientName != null && !recipientName.isBlank()) ? "Hello " + escapeHtml(recipientName) + "," : "Hello,";
        String targetUrl = (manageUrl != null && !manageUrl.isBlank()) ? manageUrl : "http://localhost:5173/store/settings";
        String priceStr = price != null ? String.format("₹%,.0f / month", price) : "Active Tier";

        String detailsHtml = ""
                + renderDetailRow("Store Brand", storeBrand)
                + renderDetailRow("Upgraded Plan", planName != null ? planName : "Business")
                + renderDetailRow("Billing Amount", priceStr)
                + renderDetailRow("Subscription Status", "Active");

        String content = ""
                + "<p style='margin:0 0 16px 0;font-size:15px;line-height:24px;color:#E4E4E7;'>" + greeting + "</p>"
                + "<p style='margin:0 0 20px 0;font-size:15px;line-height:24px;color:#A1A1AA;'>Your subscription plan upgrade request for <strong style='color:#FAFAFA;'>" + escapeHtml(storeBrand) + "</strong> has been approved! All new features and capacity limits are now fully unlocked on your account.</p>"
                + renderDetailsTable(detailsHtml)
                + "<div style='text-align:center;margin:30px 0;'>"
                + "  <a href='" + escapeHtml(targetUrl) + "' target='_blank' style='display:inline-block;background:linear-gradient(135deg,#F59E0B 0%,#D97706 100%);color:#09090B;font-size:15px;font-weight:700;text-decoration:none;padding:14px 34px;border-radius:8px;box-shadow:0 4px 14px rgba(245,158,11,0.35);'>Manage Subscription</a>"
                + "</div>";

        return buildBaseLayout(
                "Subscription Plan Activated",
                "PLAN ACTIVE",
                "success",
                "Plan Upgrade Approved",
                content
        );
    }

    @Override
    public String buildSubscriptionRejectedEmail(String recipientName, String storeBrand, String planName, String reason, String upgradeUrl) {
        String greeting = (recipientName != null && !recipientName.isBlank()) ? "Hello " + escapeHtml(recipientName) + "," : "Hello,";
        String targetUrl = (upgradeUrl != null && !upgradeUrl.isBlank()) ? upgradeUrl : "http://localhost:5173/store/upgrade";
        String note = (reason != null && !reason.isBlank()) ? reason : "Payment verification failed or invalid reference provided.";

        String content = ""
                + "<p style='margin:0 0 16px 0;font-size:15px;line-height:24px;color:#E4E4E7;'>" + greeting + "</p>"
                + "<p style='margin:0 0 20px 0;font-size:15px;line-height:24px;color:#A1A1AA;'>Your request to switch to the <strong style='color:#FAFAFA;'>" + escapeHtml(planName) + "</strong> plan for <strong style='color:#FAFAFA;'>" + escapeHtml(storeBrand) + "</strong> could not be processed.</p>"
                + renderAlertBox("Reason for Rejection", escapeHtml(note), "danger")
                + "<p style='margin:20px 0;font-size:14px;line-height:22px;color:#A1A1AA;'>You can submit a new plan request with valid payment details at any time:</p>"
                + "<div style='text-align:center;margin:28px 0;'>"
                + "  <a href='" + escapeHtml(targetUrl) + "' target='_blank' style='display:inline-block;background:linear-gradient(135deg,#F59E0B 0%,#D97706 100%);color:#09090B;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:8px;'>Choose Subscription Plan</a>"
                + "</div>";

        return buildBaseLayout(
                "Subscription Request Update",
                "UPGRADE REJECTED",
                "danger",
                "Subscription Notice",
                content
        );
    }

    @Override
    public String buildStaffInviteEmail(String staffName, String roleName, String storeBrand, String branchName, String email, String temporaryPassword, String loginUrl) {
        String greeting = (staffName != null && !staffName.isBlank()) ? "Hello " + escapeHtml(staffName) + "," : "Hello,";
        String targetUrl = (loginUrl != null && !loginUrl.isBlank()) ? loginUrl : DEFAULT_LOGIN_URL;
        String formattedRole = roleName != null ? roleName.replace("ROLE_", "").replace("_", " ") : "Staff Member";

        String detailsHtml = ""
                + renderDetailRow("Store", storeBrand)
                + renderDetailRow("Branch Assignment", branchName != null ? branchName : "Main Store Terminal")
                + renderDetailRow("Assigned Role", formattedRole)
                + renderDetailRow("Login Email", email);

        String credentialsBox = ""
                + "<div style='background:#18181B;border:1px dashed #F59E0B;border-radius:8px;padding:16px;margin:20px 0;text-align:center;'>"
                + "  <div style='font-size:11px;font-weight:700;letter-spacing:1px;color:#A1A1AA;text-transform:uppercase;'>Your Temporary Password</div>"
                + "  <div style='font-family:monospace;font-size:20px;font-weight:700;color:#F59E0B;margin-top:6px;letter-spacing:2px;'>" + escapeHtml(temporaryPassword) + "</div>"
                + "</div>";

        String content = ""
                + "<p style='margin:0 0 16px 0;font-size:15px;line-height:24px;color:#E4E4E7;'>" + greeting + "</p>"
                + "<p style='margin:0 0 20px 0;font-size:15px;line-height:24px;color:#A1A1AA;'>You have been invited to join the <strong style='color:#FAFAFA;'>" + escapeHtml(storeBrand) + "</strong> team on NexPOS as a <strong style='color:#F59E0B;'>" + escapeHtml(formattedRole) + "</strong>.</p>"
                + renderDetailsTable(detailsHtml)
                + credentialsBox
                + renderAlertBox("Important Security Advice", "Please log in using your temporary password and update it immediately from your profile settings.", "info")
                + "<div style='text-align:center;margin:30px 0;'>"
                + "  <a href='" + escapeHtml(targetUrl) + "' target='_blank' style='display:inline-block;background:linear-gradient(135deg,#F59E0B 0%,#D97706 100%);color:#09090B;font-size:15px;font-weight:700;text-decoration:none;padding:14px 34px;border-radius:8px;box-shadow:0 4px 14px rgba(245,158,11,0.35);'>Log In to Terminal</a>"
                + "</div>";

        return buildBaseLayout(
                "Welcome to NexPOS Team",
                "TEAM INVITATION",
                "info",
                "You're Invited to NexPOS",
                content
        );
    }

    @Override
    public String buildGeneralNotificationEmail(String recipientName, String title, String badgeText, String badgeType, String message, Map<String, String> details, String actionText, String actionUrl) {
        String greeting = (recipientName != null && !recipientName.isBlank()) ? "Hello " + escapeHtml(recipientName) + "," : "Hello,";

        StringBuilder detailsHtml = new StringBuilder();
        if (details != null && !details.isEmpty()) {
            for (Map.Entry<String, String> entry : details.entrySet()) {
                detailsHtml.append(renderDetailRow(entry.getKey(), entry.getValue()));
            }
        }

        StringBuilder content = new StringBuilder();
        content.append("<p style='margin:0 0 16px 0;font-size:15px;line-height:24px;color:#E4E4E7;'>").append(greeting).append("</p>");
        content.append("<p style='margin:0 0 20px 0;font-size:15px;line-height:24px;color:#A1A1AA;'>").append(escapeHtml(message)).append("</p>");

        if (detailsHtml.length() > 0) {
            content.append(renderDetailsTable(detailsHtml.toString()));
        }

        if (actionText != null && !actionText.isBlank() && actionUrl != null && !actionUrl.isBlank()) {
            content.append("<div style='text-align:center;margin:30px 0;'>")
                   .append("  <a href='").append(escapeHtml(actionUrl)).append("' target='_blank' style='display:inline-block;background:linear-gradient(135deg,#F59E0B 0%,#D97706 100%);color:#09090B;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:8px;'>")
                   .append(escapeHtml(actionText))
                   .append("</a></div>");
        }

        return buildBaseLayout(
                title != null ? title : "NexPOS Notification",
                badgeText != null ? badgeText : "NOTIFICATION",
                badgeType != null ? badgeType : "info",
                title != null ? title : "System Notification",
                content.toString()
        );
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Internal Helper Methods for Base Structure & Theming
    // ─────────────────────────────────────────────────────────────────────────────

    private String buildBaseLayout(String previewText, String badgeText, String badgeType, String mainHeading, String innerBodyHtml) {
        String badgeColors = getBadgeStyles(badgeType);

        return "<!DOCTYPE html>"
                + "<html lang='en' xmlns='http://www.w3.org/1999/xhtml'>"
                + "<head>"
                + "  <meta charset='utf-8'/>"
                + "  <meta name='viewport' content='width=device-width, initial-scale=1.0'/>"
                + "  <meta http-equiv='X-UA-Compatible' content='IE=edge'/>"
                + "  <title>" + escapeHtml(mainHeading) + "</title>"
                + "  <!--[if mso]><style type='text/css'>body, table, td {font-family: Arial, Helvetica, sans-serif !important;}</style><![endif]-->"
                + "</head>"
                + "<body style='margin:0;padding:0;background-color:#09090B;font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif;color:#FAFAFA;-webkit-font-smoothing:antialiased;'>"
                + "  <!-- Preheader text for email clients -->"
                + "  <div style='display:none;font-size:1px;color:#09090B;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;'>"
                + "    " + escapeHtml(previewText) + " — NexPOS Platform Intelligence"
                + "  </div>"
                + "  <table role='presentation' width='100%' cellpadding='0' cellspacing='0' border='0' style='background-color:#09090B;padding:32px 16px;'>"
                + "    <tr>"
                + "      <td align='center'>"
                + "        <!-- Main Email Container -->"
                + "        <table role='presentation' width='100%' cellpadding='0' cellspacing='0' border='0' style='max-width:580px;background-color:#18181B;border:1px solid #27272A;border-radius:16px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.6);'>"
                + "          <!-- Header / Brand Section -->"
                + "          <tr>"
                + "            <td style='padding:32px 32px 24px 32px;background:linear-gradient(180deg,#18181B 0%,#131316 100%);border-bottom:1px solid #27272A;text-align:center;'>"
                + "              <table role='presentation' cellpadding='0' cellspacing='0' border='0' align='center'>"
                + "                <tr>"
                + "                  <td style='vertical-align:middle;padding-right:12px;'>"
                + "                    <div style='width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#27272A 0%,#18181B 100%);border:1px solid #F59E0B;display:inline-block;line-height:40px;text-align:center;box-shadow:0 0 16px rgba(245,158,11,0.25);'>"
                + "                      <span style='font-size:20px;font-weight:900;color:#F59E0B;'>⚡</span>"
                + "                    </div>"
                + "                  </td>"
                + "                  <td style='vertical-align:middle;text-align:left;'>"
                + "                    <span style='font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#FFFFFF;'>" + APP_NAME + "</span>"
                + "                    <span style='margin-left:6px;font-size:10px;font-weight:800;background:#F59E0B;color:#09090B;padding:2px 6px;border-radius:4px;letter-spacing:0.5px;text-transform:uppercase;vertical-align:middle;'>POS</span>"
                + "                    <div style='font-size:11px;color:#71717A;letter-spacing:0.2px;margin-top:2px;font-weight:500;'>" + BRAND_TAGLINE + "</div>"
                + "                  </td>"
                + "                </tr>"
                + "              </table>"
                + "            </td>"
                + "          </tr>"
                + "          <!-- Main Content Body -->"
                + "          <tr>"
                + "            <td style='padding:32px 32px 28px 32px;'>"
                + "              <!-- Status Badge -->"
                + "              <div style='margin-bottom:16px;text-align:left;'>"
                + "                <span style='display:inline-block;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;" + badgeColors + "'>"
                + "                  " + escapeHtml(badgeText)
                + "                </span>"
                + "              </div>"
                + "              <!-- Subject Heading -->"
                + "              <h1 style='margin:0 0 20px 0;font-size:22px;font-weight:700;line-height:28px;color:#FAFAFA;letter-spacing:-0.3px;'>"
                + "                " + escapeHtml(mainHeading)
                + "              </h1>"
                + "              <!-- Dynamic Body -->"
                + "              " + innerBodyHtml
                + "            </td>"
                + "          </tr>"
                + "          <!-- Footer Section -->"
                + "          <tr>"
                + "            <td style='padding:24px 32px;background-color:#121214;border-top:1px solid #27272A;text-align:center;'>"
                + "              <p style='margin:0 0 6px 0;font-size:12px;color:#71717A;line-height:18px;'>"
                + "                This is an automated notification from the <strong>NexPOS Platform Master Console</strong>."
                + "              </p>"
                + "              <p style='margin:0;font-size:11px;color:#52525B;line-height:16px;'>"
                + "                © " + Year.now().getValue() + " NexPOS Systems. All rights reserved. • High-Performance Retail Infrastructure"
                + "              </p>"
                + "            </td>"
                + "          </tr>"
                + "        </table>"
                + "      </td>"
                + "    </tr>"
                + "  </table>"
                + "</body>"
                + "</html>";
    }

    private String renderDetailRow(String label, String value) {
        String safeVal = (value != null && !value.isBlank()) ? escapeHtml(value) : "—";
        return "<tr>"
                + "<td style='padding:8px 12px;font-size:13px;color:#A1A1AA;border-bottom:1px solid #27272A;font-weight:500;width:40%;'>" + escapeHtml(label) + "</td>"
                + "<td style='padding:8px 12px;font-size:13px;color:#FAFAFA;border-bottom:1px solid #27272A;font-weight:600;width:60%;'>" + safeVal + "</td>"
                + "</tr>";
    }

    private String renderDetailsTable(String rowsHtml) {
        return "<table role='presentation' width='100%' cellpadding='0' cellspacing='0' border='0' style='margin:20px 0;background-color:#121214;border:1px solid #27272A;border-radius:10px;overflow:hidden;border-collapse:separate;'>"
                + rowsHtml
                + "</table>";
    }

    private String renderAlertBox(String title, String message, String type) {
        String border;
        String bg;
        String titleColor;

        switch (type.toLowerCase()) {
            case "success":
                bg = "#064E3B";
                border = "#059669";
                titleColor = "#6EE7B7";
                break;
            case "danger":
                bg = "#4C0519";
                border = "#E11D48";
                titleColor = "#FECDD3";
                break;
            case "warning":
                bg = "#451A03";
                border = "#D97706";
                titleColor = "#FDE68A";
                break;
            case "info":
            default:
                bg = "#18181B";
                border = "#3F3F46";
                titleColor = "#E4E4E7";
                break;
        }

        return "<div style='background:" + bg + ";border:1px solid " + border + ";border-radius:8px;padding:14px 16px;margin:20px 0;text-align:left;'>"
                + "  <div style='font-size:12px;font-weight:700;letter-spacing:0.5px;color:" + titleColor + ";text-transform:uppercase;margin-bottom:4px;'>" + escapeHtml(title) + "</div>"
                + "  <div style='font-size:13px;line-height:20px;color:#E4E4E7;'>" + message + "</div>"
                + "</div>";
    }

    private String getBadgeStyles(String type) {
        switch (type.toLowerCase()) {
            case "success":
                return "background-color:#064E3B;color:#6EE7B7;border:1px solid #059669;";
            case "danger":
                return "background-color:#4C0519;color:#FECDD3;border:1px solid #E11D48;";
            case "warning":
                return "background-color:#451A03;color:#FDE68A;border:1px solid #D97706;";
            case "info":
            default:
                return "background-color:#27272A;color:#F59E0B;border:1px solid #D97706;";
        }
    }

    private String escapeHtml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
                    .replace("\"", "&quot;")
                    .replace("'", "&#39;");
    }
}
