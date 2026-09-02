package com.aniket.controller;

import com.aniket.domain.NotificationType;
import com.aniket.domain.Priority;
import com.aniket.domain.UserRole;
import com.aniket.modal.ContactInquiry;
import com.aniket.modal.User;
import com.aniket.payload.response.ApiResponse;
import com.aniket.repository.ContactInquiryRepository;
import com.aniket.repository.UserRepository;
import com.aniket.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequiredArgsConstructor
@Slf4j
public class ContactInquiryController {

    private final ContactInquiryRepository contactInquiryRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    /**
     * 🔓 Public endpoint to submit contact inquiries from landing page
     */
    @PostMapping("/api/public/contact-inquiries")
    public ResponseEntity<ApiResponse<ContactInquiry>> submitInquiry(@RequestBody ContactInquiry inquiry) {
        try {
            if (inquiry.getName() == null || inquiry.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Name is required", null));
            }
            if (inquiry.getEmail() == null || inquiry.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Email is required", null));
            }
            if (inquiry.getMessage() == null || inquiry.getMessage().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Message is required", null));
            }

            inquiry.setStatus("PENDING");
            ContactInquiry saved = contactInquiryRepository.save(inquiry);

            // Notify all Super Admins about the new inquiry
            try {
                Set<User> admins = userRepository.findByRole(UserRole.ROLE_ADMIN);
                for (User admin : admins) {
                    notificationService.createNotification(
                            NotificationType.SYSTEM_ALERT,
                            Priority.INFO,
                            "New Contact Inquiry: " + saved.getName(),
                            "Store/Business: " + (saved.getStoreName() != null ? saved.getStoreName() : "N/A") +
                                    " | Email: " + saved.getEmail() + " | Message: " + saved.getMessage(),
                            "CONTACT_INQUIRY",
                            saved.getId(),
                            "/super-admin",
                            admin.getId()
                    );
                }
            } catch (Exception notifEx) {
                log.warn("Could not dispatch admin notification for contact inquiry: {}", notifEx.getMessage());
            }

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(true, "Your message has been received! Our support team will get in touch shortly.", saved));
        } catch (Exception e) {
            log.error("Error saving contact inquiry", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Failed to submit inquiry. Please try again.", null));
        }
    }

    /**
     * 🔒 Super Admin: list all contact inquiries
     */
    @GetMapping("/api/super-admin/contact-inquiries")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ContactInquiry>>> getAllInquiries() {
        List<ContactInquiry> inquiries = contactInquiryRepository.findByOrderByCreatedAtDesc();
        return ResponseEntity.ok(new ApiResponse<>(true, "Inquiries fetched successfully", inquiries));
    }

    /**
     * 🔒 Super Admin: pending inquiries count for badge
     */
    @GetMapping("/api/super-admin/contact-inquiries/pending-count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Long>> getPendingCount() {
        long count = contactInquiryRepository.countByStatus("PENDING") + contactInquiryRepository.countByStatus("NEW");
        return ResponseEntity.ok(new ApiResponse<>(true, "Pending inquiries count", count));
    }

    /**
     * 🔒 Super Admin: update inquiry status (e.g. PENDING, CONTACTED, RESOLVED, ARCHIVED)
     */
    @PatchMapping("/api/super-admin/contact-inquiries/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ContactInquiry>> updateInquiryStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        return contactInquiryRepository.findById(id)
                .map(inquiry -> {
                    inquiry.setStatus(status.toUpperCase());
                    ContactInquiry updated = contactInquiryRepository.save(inquiry);
                    return ResponseEntity.ok(new ApiResponse<>(true, "Inquiry status updated to " + status, updated));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, "Inquiry not found with ID: " + id, null)));
    }

    /**
     * 🔒 Super Admin: delete contact inquiry
     */
    @DeleteMapping("/api/super-admin/contact-inquiries/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteInquiry(@PathVariable Long id) {
        if (!contactInquiryRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, "Inquiry not found with ID: " + id, null));
        }
        contactInquiryRepository.deleteById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Inquiry deleted successfully", null));
    }
}
