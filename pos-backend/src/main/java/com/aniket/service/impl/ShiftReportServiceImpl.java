package com.aniket.service.impl;



import com.aniket.domain.PaymentType;
import com.aniket.exception.UserException;
import com.aniket.modal.*;
import com.aniket.payload.dto.ProductDTO;
import com.aniket.mapper.ProductMapper;
import com.aniket.repository.*;
import com.aniket.service.ShiftReportService;
import com.aniket.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShiftReportServiceImpl implements ShiftReportService {

    private final ShiftReportRepository shiftReportRepository;
    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final OrderRepository orderRepository;
    private final RefundRepository refundRepository;
    private final UserService userService;
    private final com.aniket.util.SecurityUtil securityUtil;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public ShiftReport startShift(Long cashierId,
                                  Long branchId,
                                  LocalDateTime shiftStart
    ) throws UserException {
        User currentUser=userService.getCurrentUser();
        shiftStart=LocalDateTime.now();

        Branch branch = branchRepository.findById(branchId).orElseThrow(() ->
                new RuntimeException("Branch not found with ID: " + branchId));

        securityUtil.checkAuthority(branch);

        // Prevent duplicate shifts on the same day
        LocalDateTime startOfDay = shiftStart.withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = shiftStart.withHour(23).withMinute(59).withSecond(59);

        Optional<ShiftReport> existing = shiftReportRepository
                .findByCashierAndShiftStartBetween(currentUser, startOfDay, endOfDay);

        if (existing.isPresent()) {
            throw new RuntimeException("Shift already started today.");
        }

        ShiftReport shift = new ShiftReport();
        shift.setCashier(currentUser);
        shift.setBranch(branch);
        shift.setShiftStart(shiftStart);

        ShiftReport savedShift = shiftReportRepository.save(shift);

        // 🔔 Publish ShiftStartedEvent
        eventPublisher.publishEvent(com.aniket.event.ShiftStartedEvent.builder()
                .shiftId(savedShift.getId())
                .branchId(branch.getId())
                .branchName(branch.getName())
                .cashierId(currentUser.getId())
                .cashierName(currentUser.getFullName())
                .shiftStart(savedShift.getShiftStart())
                .build());

        return savedShift;
    }

    @Override
    @Transactional
    public ShiftReport endShift(Long shiftReportId, LocalDateTime shiftEnd) throws UserException {
        User currentUser=userService.getCurrentUser();

//        ShiftReport shift = shiftReportRepository.findById(shiftReportId)
//                .orElseThrow(() -> new RuntimeException("Shift report not found"));

        ShiftReport shift=shiftReportRepository
                .findTopByCashierAndShiftEndIsNullOrderByShiftStartDesc(currentUser)
                .orElseThrow(
                        ()-> new EntityNotFoundException("shift report not found")
                );

        shift.setShiftEnd(shiftEnd);

        List<Order> orders = orderRepository.findByCashierAndCreatedAtBetween(
                shift.getCashier(), shift.getShiftStart(), shiftEnd
        );

        List<Refund> refunds = refundRepository.findByCashierAndCreatedAtBetween(
                shift.getCashier(), shift.getShiftStart(), shiftEnd
        );

        double totalRefunds = refunds.stream()
                .mapToDouble(refund -> refund.getAmount() != null ? refund.getAmount() : 0.0)
                .sum();

        double totalSales = orders.stream().mapToDouble(Order::getTotalAmount).sum();
        int totalOrders = orders.size();
//        double totalRefunds = refunds.stream().mapToDouble(Refund::getAmount).sum();
        double netSales = totalSales - totalRefunds;

        shift.setTotalSales(totalSales);
        shift.setTotalOrders(totalOrders);
        shift.setTotalRefunds(totalRefunds);
        shift.setNetSales(netSales);
        shift.setRecentOrders(getRecentOrders(orders));
        shift.setTopSellingProducts(getTopSellingProducts(orders));
        shift.setPaymentSummaries(getPaymentSummaries(orders, totalSales));
        shift.setRefunds(refunds);

        ShiftReport savedShift = shiftReportRepository.save(shift);

        // 🔔 Publish ShiftEndedEvent
        eventPublisher.publishEvent(com.aniket.event.ShiftEndedEvent.builder()
                .shiftId(savedShift.getId())
                .branchId(savedShift.getBranch() != null ? savedShift.getBranch().getId() : null)
                .branchName(savedShift.getBranch() != null ? savedShift.getBranch().getName() : "")
                .cashierId(currentUser.getId())
                .cashierName(currentUser.getFullName())
                .totalSales(savedShift.getTotalSales())
                .totalOrders(savedShift.getTotalOrders())
                .shiftStart(savedShift.getShiftStart())
                .shiftEnd(savedShift.getShiftEnd())
                .build());

        return savedShift;
    }

    @Override
    public ShiftReport getShiftReportById(Long id) {
        ShiftReport report = shiftReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shift report not found"));
        if (report.getBranch() != null) {
            try {
                securityUtil.checkAuthority(report.getBranch());
            } catch (UserException e) {
                throw new com.aniket.exception.AccessDeniedException("Access denied: " + e.getMessage());
            }
        }
        return report;
    }

    @Override
    public List<ShiftReport> getAllShiftReports() {
        return shiftReportRepository.findAll();
    }

    @Override
    public List<ShiftReport> getShiftReportsByCashier(Long cashierId) {
        User cashier = userRepository.findById(cashierId)
                .orElseThrow(() -> new RuntimeException("Cashier not found"));
        if (cashier.getBranch() != null) {
            try {
                securityUtil.checkAuthority(cashier.getBranch());
            } catch (UserException e) {
                throw new com.aniket.exception.AccessDeniedException("Access denied: " + e.getMessage());
            }
        }
        return shiftReportRepository.findByCashier(cashier);
    }

    @Override
    public List<ShiftReport> getShiftReportsByBranch(Long branchId) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new RuntimeException("Branch not found"));
        try {
            securityUtil.checkAuthority(branch);
        } catch (UserException e) {
            throw new com.aniket.exception.AccessDeniedException("Access denied: " + e.getMessage());
        }
        return shiftReportRepository.findByBranch(branch);
    }

    @Override
    public ShiftReport getCurrentShiftProgress(Long cashierId) throws UserException {
        User cashier=userService.getCurrentUser();
//        User cashier = userRepository.findById(cashierId)
//                .orElseThrow(() -> new RuntimeException("Cashier not found"));

        ShiftReport shift = shiftReportRepository
                .findTopByCashierAndShiftEndIsNullOrderByShiftStartDesc(cashier)
                .orElseThrow(() -> new RuntimeException("No active shift found for this cashier"));

        LocalDateTime now = LocalDateTime.now();

        List<Order> orders = orderRepository.findByCashierAndCreatedAtBetween(
                cashier, shift.getShiftStart(), now
        );

        List<Refund> refunds = refundRepository.findByCashierAndCreatedAtBetween(
                cashier, shift.getShiftStart(), now
        );

        double totalSales = orders.stream().mapToDouble(Order::getTotalAmount).sum();
        int totalOrders = orders.size();
//        double totalRefunds = refunds.stream().mapToDouble(Refund::getAmount).sum();
        double totalRefunds = refunds.stream()
                .mapToDouble(refund -> refund.getAmount() != null ? refund.getAmount() : 0.0)
                .sum();

        double netSales = totalSales - totalRefunds;

        shift.setTotalSales(totalSales);
        shift.setTotalOrders(totalOrders);
        shift.setTotalRefunds(totalRefunds);
        shift.setNetSales(netSales);
        shift.setRecentOrders(getRecentOrders(orders));
        shift.setTopSellingProducts(getTopSellingProducts(orders));

        shift.setPaymentSummaries(getPaymentSummaries(orders, totalSales));
        shift.setRefunds(refunds);

        return shift;
    }

    @Override
    public ShiftReport getShiftReportByCashierAndDate(Long cashierId, LocalDateTime date) {
        User cashier = userRepository.findById(cashierId)
                .orElseThrow(() -> new RuntimeException("Cashier not found"));
        if (cashier.getBranch() != null) {
            try {
                securityUtil.checkAuthority(cashier.getBranch());
            } catch (UserException e) {
                throw new com.aniket.exception.AccessDeniedException("Access denied: " + e.getMessage());
            }
        }

        LocalDateTime start = date.withHour(0).withMinute(0).withSecond(0);
        LocalDateTime end = date.withHour(23).withMinute(59).withSecond(59);

        return shiftReportRepository.findByCashierAndShiftStartBetween(cashier, start, end)
                .orElseThrow(() -> new RuntimeException("No shift report found on this date"));
    }

    @Override
    public void deleteShiftReport(Long id) {
        ShiftReport shiftReport = shiftReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shift report not found"));
        if (shiftReport.getBranch() != null) {
            try {
                securityUtil.checkAuthority(shiftReport.getBranch());
            } catch (UserException e) {
                throw new com.aniket.exception.AccessDeniedException("Access denied to delete shift report: " + e.getMessage());
            }
        }
        shiftReportRepository.delete(shiftReport);
    }

    // ----------------- HELPER METHODS -----------------

    private List<Order> getRecentOrders(List<Order> orders) {
        return orders.stream()
                .sorted(Comparator.comparing(Order::getCreatedAt).reversed())
                .limit(5)
                .collect(Collectors.toList());
    }

    private List<ProductDTO> getTopSellingProducts(List<Order> orders) {
        Map<Long, Product> productMap = new HashMap<>();
        Map<Long, Integer> quantityMap = new HashMap<>();
        Map<Long, Double> priceMap = new HashMap<>();

        for (Order order : orders) {
            if (order.getItems() != null) {
                for (OrderItem item : order.getItems()) {
                    Product product = item.getProduct();
                    if (product != null) {
                        Long pid = product.getId();
                        productMap.put(pid, product);
                        quantityMap.put(pid, quantityMap.getOrDefault(pid, 0) + (item.getQuantity() != null ? item.getQuantity() : 1));
                        if (item.getPrice() != null) {
                            priceMap.put(pid, item.getPrice());
                        }
                    }
                }
            }
        }

        return quantityMap.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(5)
                .map(entry -> {
                    Long pid = entry.getKey();
                    Product p = productMap.get(pid);
                    ProductDTO dto = ProductMapper.toDto(p);
                    dto.setQuantity(entry.getValue());
                    Double itemTotalPrice = priceMap.get(pid);
                    if (itemTotalPrice != null && dto.getQuantity() != null && dto.getQuantity() > 0) {
                        dto.setSellingPrice(itemTotalPrice / dto.getQuantity());
                    } else if (p != null && p.getMrp() != null) {
                        dto.setSellingPrice(p.getMrp());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private List<PaymentSummary> getPaymentSummaries(List<Order> orders,
                                                     double totalSales) {
        Map<PaymentType, List<Order>> grouped = orders.stream()
                .collect(Collectors.groupingBy(
                        order -> order.getPaymentType() != null ?
                                order.getPaymentType() : PaymentType.CASH
                ));

        List<PaymentSummary> summaries = new ArrayList<>();

        for (Map.Entry<PaymentType, List<Order>> entry : grouped.entrySet()) {
            double amount = entry.getValue()
                    .stream()
                    .mapToDouble(Order::getTotalAmount)
                    .sum();
            int transactions = entry.getValue().size();
            double percent = totalSales > 0 ? (amount / totalSales) * 100 : 0.0;

            PaymentSummary ps = new PaymentSummary();
            ps.setType(entry.getKey());
            ps.setTotalAmount(amount);
            ps.setTransactionCount(transactions);
            ps.setPercentage(percent);
            summaries.add(ps);
        }

        return summaries;
    }
}

