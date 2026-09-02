package com.aniket.payload.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerOverviewDTO {
    private long totalCustomers;
    private long goldMembersCount;
    private long silverMembersCount;
    private long bronzeMembersCount;
    private long totalOrders;
    private double avgOrdersPerCustomer;
}
