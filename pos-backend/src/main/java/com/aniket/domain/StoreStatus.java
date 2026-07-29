package com.aniket.domain;


public enum StoreStatus {

    ACTIVE,      // Approved and running
    PENDING,     // Awaiting approval
    BLOCKED,     // Blocked by super admin
    REJECTED     // Rejected by super admin
}
