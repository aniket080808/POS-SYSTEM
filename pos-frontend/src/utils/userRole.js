export const userRoles = [
  "ROLE_STORE_ADMIN",
  "ROLE_STORE_MANAGER",
  "ROLE_BRANCH_MANAGER",
  "ROLE_BRANCH_ADMIN",
  "ROLE_BRANCH_CASHIER",
  "ROLE_CUSTOMER",
];

// Roles selectable in the Add/Edit Employee form (ROLE_STORE_ADMIN excluded — system-assigned only)
export const storeAdminRole = [
  "ROLE_STORE_MANAGER",
  "ROLE_BRANCH_MANAGER",
  "ROLE_BRANCH_ADMIN",
  "ROLE_BRANCH_CASHIER",
];

// Store-level roles — access across all branches, NOT tied to a specific branch
export const STORE_LEVEL_ROLES = [
  "ROLE_STORE_ADMIN",
  "ROLE_STORE_MANAGER",
];

// Branch-level roles — tied to a specific branch, require a branchId
export const BRANCH_LEVEL_ROLES = [
  "ROLE_BRANCH_ADMIN",
  "ROLE_BRANCH_MANAGER",
  "ROLE_BRANCH_CASHIER",
];

export const branchAdminRole = [
  "ROLE_BRANCH_MANAGER",
  "ROLE_BRANCH_ADMIN",
  "ROLE_BRANCH_CASHIER",
];