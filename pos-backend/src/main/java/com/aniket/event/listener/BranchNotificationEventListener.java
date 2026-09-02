package com.aniket.event.listener;

import com.aniket.domain.NotificationType;
import com.aniket.domain.Priority;
import com.aniket.domain.UserRole;
import com.aniket.event.*;
import com.aniket.modal.User;
import com.aniket.repository.UserRepository;
import com.aniket.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;

@Component
@RequiredArgsConstructor
@Slf4j
public class BranchNotificationEventListener {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    private List<User> getBranchManagementUsers(Long branchId) {
        if (branchId == null) return List.of();
        List<User> users = userRepository.findByBranchId(branchId);
        log.info("🔔 Branch {} has total {} users in repository", branchId, users.size());
        return users.stream()
                .filter(u -> u.getRole() == UserRole.ROLE_BRANCH_ADMIN || u.getRole() == UserRole.ROLE_BRANCH_MANAGER)
                .toList();
    }

    @Async
    @EventListener
    public void handleBranchOrderCreated(BranchOrderCreatedEvent event) {
        try {
            log.info("🔔 Processing async BranchOrderCreatedEvent for order: {}, branch: {}", event.getOrderId(), event.getBranchId());
            List<User> managers = getBranchManagementUsers(event.getBranchId());
            log.info("🔔 Found {} branch management recipients for branch {}", managers.size(), event.getBranchId());
            String message = String.format("Order #%d (%d items) placed for ₹%.2f%s.",
                    event.getOrderId(),
                    event.getItemCount() != null ? event.getItemCount() : 1,
                    event.getTotalAmount() != null ? event.getTotalAmount() : 0.0,
                    event.getCashierName() != null ? " by " + event.getCashierName() : "");

            for (User user : managers) {
                log.info("🔔 Sending ORDER_CREATED notification to user ID: {} ({})", user.getId(), user.getEmail());
                notificationService.createNotification(
                        NotificationType.ORDER_CREATED,
                        Priority.INFO,
                        "New Order Placed",
                        message,
                        "Order",
                        event.getOrderId(),
                        "/branch/orders",
                        user.getId()
                );
            }
        } catch (Exception e) {
            log.error("Error sending notification for BranchOrderCreatedEvent", e);
        }
    }

    @Async
    @EventListener
    public void handleLowStockAlert(LowStockAlertEvent event) {
        try {
            log.info("Processing async LowStockAlertEvent for product: {}, stock: {}, branch: {}",
                    event.getProductName(), event.getCurrentStock(), event.getBranchId());
            List<User> managers = getBranchManagementUsers(event.getBranchId());
            String message = String.format("Product \"%s\" has only %d units remaining in branch inventory (threshold: %d).",
                    event.getProductName(),
                    event.getCurrentStock(),
                    event.getThreshold() != null ? event.getThreshold() : 10);

            for (User user : managers) {
                notificationService.createNotification(
                        NotificationType.LOW_STOCK_ALERT,
                        Priority.WARNING,
                        "Low Stock Alert",
                        message,
                        "Product",
                        event.getProductId(),
                        "/branch/inventory",
                        user.getId()
                );
            }
        } catch (Exception e) {
            log.error("Error sending notification for LowStockAlertEvent", e);
        }
    }

    @Async
    @EventListener
    public void handleRefundCreated(RefundCreatedEvent event) {
        try {
            log.info("Processing async RefundCreatedEvent for refund: {}, order: {}, branch: {}",
                    event.getRefundId(), event.getOrderId(), event.getBranchId());
            List<User> managers = getBranchManagementUsers(event.getBranchId());
            String message = String.format("Refund of ₹%.2f processed for Order #%d%s. Reason: %s",
                    event.getAmount() != null ? event.getAmount() : 0.0,
                    event.getOrderId(),
                    event.getCashierName() != null ? " by " + event.getCashierName() : "",
                    event.getReason() != null ? event.getReason() : "Customer return");

            for (User user : managers) {
                notificationService.createNotification(
                        NotificationType.REFUND_CREATED,
                        Priority.WARNING,
                        "Refund Processed",
                        message,
                        "Refund",
                        event.getRefundId(),
                        "/branch/refunds",
                        user.getId()
                );
            }
        } catch (Exception e) {
            log.error("Error sending notification for RefundCreatedEvent", e);
        }
    }

    @Async
    @EventListener
    public void handleShiftStarted(ShiftStartedEvent event) {
        try {
            log.info("Processing async ShiftStartedEvent for cashier: {}, shift: {}, branch: {}",
                    event.getCashierName(), event.getShiftId(), event.getBranchId());

            // 1. Self-scoped confirmation for the cashier
            if (event.getCashierId() != null) {
                notificationService.createNotification(
                        NotificationType.SHIFT_STARTED,
                        Priority.SUCCESS,
                        "Shift Started",
                        "Your shift has started successfully" + (event.getBranchName() != null ? " at " + event.getBranchName() : "") + ".",
                        "ShiftReport",
                        event.getShiftId(),
                        "/branch/dashboard",
                        event.getCashierId()
                );
            }

            // 2. Notification to branch management
            List<User> managers = getBranchManagementUsers(event.getBranchId()).stream()
                    .filter(u -> !Objects.equals(u.getId(), event.getCashierId()))
                    .toList();

            for (User user : managers) {
                notificationService.createNotification(
                        NotificationType.SHIFT_STARTED,
                        Priority.INFO,
                        "Cashier Shift Started",
                        String.format("Cashier %s started a shift.", event.getCashierName() != null ? event.getCashierName() : "Staff"),
                        "ShiftReport",
                        event.getShiftId(),
                        "/branch/dashboard",
                        user.getId()
                );
            }
        } catch (Exception e) {
            log.error("Error sending notification for ShiftStartedEvent", e);
        }
    }

    @Async
    @EventListener
    public void handleShiftEnded(ShiftEndedEvent event) {
        try {
            log.info("Processing async ShiftEndedEvent for cashier: {}, shift: {}, branch: {}",
                    event.getCashierName(), event.getShiftId(), event.getBranchId());

            // 1. Self-scoped shift summary for the cashier
            if (event.getCashierId() != null) {
                String cashierSummary = String.format("Your shift has ended. Total Sales: ₹%.2f%s.",
                        event.getTotalSales() != null ? event.getTotalSales() : 0.0,
                        event.getTotalOrders() != null ? " across " + event.getTotalOrders() + " orders" : "");

                notificationService.createNotification(
                        NotificationType.SHIFT_ENDED,
                        Priority.INFO,
                        "Shift Completed",
                        cashierSummary,
                        "ShiftReport",
                        event.getShiftId(),
                        "/branch/dashboard",
                        event.getCashierId()
                );
            }

            // 2. Summary notification for branch management
            List<User> managers = getBranchManagementUsers(event.getBranchId()).stream()
                    .filter(u -> !Objects.equals(u.getId(), event.getCashierId()))
                    .toList();

            String managementSummary = String.format("Cashier %s ended shift. Total Sales: ₹%.2f.",
                    event.getCashierName() != null ? event.getCashierName() : "Staff",
                    event.getTotalSales() != null ? event.getTotalSales() : 0.0);

            for (User user : managers) {
                notificationService.createNotification(
                        NotificationType.SHIFT_ENDED,
                        Priority.INFO,
                        "Cashier Shift Ended",
                        managementSummary,
                        "ShiftReport",
                        event.getShiftId(),
                        "/branch/dashboard",
                        user.getId()
                );
            }
        } catch (Exception e) {
            log.error("Error sending notification for ShiftEndedEvent", e);
        }
    }

    @Async
    @EventListener
    public void handleEmployeeAdded(EmployeeAddedEvent event) {
        try {
            log.info("Processing async EmployeeAddedEvent for employee: {}, role: {}, branch: {}",
                    event.getEmployeeName(), event.getRole(), event.getBranchId());

            List<User> managers = getBranchManagementUsers(event.getBranchId()).stream()
                    .filter(u -> !Objects.equals(u.getId(), event.getEmployeeId()))
                    .toList();

            String message = String.format("New employee %s (%s) assigned to branch.",
                    event.getEmployeeName() != null ? event.getEmployeeName() : "Staff",
                    event.getRole() != null ? event.getRole().name() : "Staff");

            for (User user : managers) {
                notificationService.createNotification(
                        NotificationType.EMPLOYEE_ADDED,
                        Priority.INFO,
                        "New Employee Assigned",
                        message,
                        "User",
                        event.getEmployeeId(),
                        "/branch/employees",
                        user.getId()
                );
            }
        } catch (Exception e) {
            log.error("Error sending notification for EmployeeAddedEvent", e);
        }
    }
}

