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

export const getRoleDisplayName = (role) => {
  switch (role) {
    case "ROLE_SUPER_ADMIN":
    case "ROLE_ADMIN":
      return "Super Admin";
    case "ROLE_STORE_ADMIN":
      return "Store Admin";
    case "ROLE_STORE_MANAGER":
      return "Store Manager";
    case "ROLE_BRANCH_ADMIN":
      return "Branch Admin";
    case "ROLE_BRANCH_MANAGER":
      return "Branch Manager";
    case "ROLE_BRANCH_CASHIER":
      return "Cashier";
    case "ROLE_CUSTOMER":
      return "Customer";
    default:
      if (!role) return "User";
      return role
        .replace("ROLE_", "")
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
  }
};

/**
 * Role hierarchy level for management permission checks.
 * Higher number = higher privilege.
 */
const ROLE_LEVEL = {
  ROLE_ADMIN: 100,
  ROLE_SUPER_ADMIN: 100,
  ROLE_STORE_ADMIN: 80,
  ROLE_STORE_MANAGER: 70,
  ROLE_BRANCH_ADMIN: 60,
  ROLE_BRANCH_MANAGER: 50,
  ROLE_BRANCH_CASHIER: 40,
  ROLE_CUSTOMER: 10,
};

/**
 * Check if a user with `currentRole` can manage (edit/toggle/reset) a user with `targetRole`.
 * Rules:
 * - Cannot manage yourself (check by ID separately)
 * - Can only manage strictly lower roles
 * - Branch Manager can only manage Cashier
 * - Branch Admin can manage Manager + Cashier
 */
export const canManageEmployee = (currentRole, targetRole) => {
  const currentLevel = ROLE_LEVEL[currentRole] || 0;
  const targetLevel = ROLE_LEVEL[targetRole] || 0;
  return currentLevel > targetLevel;
};