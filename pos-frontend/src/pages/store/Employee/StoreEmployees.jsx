import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus, Users, Store as StoreIcon, MapPin, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmployeeForm, EmployeeTable } from ".";
import {
  createStoreEmployee,
  findStoreEmployees,
  updateEmployee,
  deleteEmployee,
} from "@/Redux Toolkit/features/employee/employeeThunks";
import { getAllBranchesByStore } from "@/Redux Toolkit/features/branch/branchThunks";
import { getStoreOverview } from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";
import { getStoreByAdmin } from "@/Redux Toolkit/features/store/storeThunks";
import { storeAdminRole, STORE_LEVEL_ROLES, BRANCH_LEVEL_ROLES } from "../../../utils/userRole";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function StoreEmployees() {
  const dispatch = useDispatch();
  const { employees, loading, error } = useSelector((state) => state.employee || {});
  const { branches } = useSelector((state) => state.branch || {});
  const { store } = useSelector((state) => state.store || {});
  const { storeOverview } = useSelector((state) => state.storeAnalytics || {});
  const { statusResponse } = useSelector((state) => state.storeSubscription || {});
  const { user, userProfile } = useSelector((state) => state.user || {});

  const activeStoreId = store?.id || userProfile?.store?.id;

  // Fetch store if not already loaded
  useEffect(() => {
    if (!store) {
      const jwt = localStorage.getItem("jwt");
      if (jwt) {
        dispatch(getStoreByAdmin(jwt));
      }
    }
  }, [dispatch, store]);

  // Fetch employees + branches when component mounts or store/user changes
  useEffect(() => {
    if (activeStoreId) {
      const jwt = localStorage.getItem("jwt");
      if (jwt) {
        dispatch(findStoreEmployees({ storeId: activeStoreId, token: jwt }));
        dispatch(getAllBranchesByStore({ storeId: activeStoreId, jwt }));
      }
    }
  }, [dispatch, activeStoreId, user]);

  // Fetch store overview for usage-vs-limit badge if not already loaded
  useEffect(() => {
    if (userProfile?.id && !storeOverview) {
      dispatch(getStoreOverview(userProfile.id));
    }
  }, [dispatch, userProfile, storeOverview]);

  const maxEmployees = statusResponse?.currentPlan?.maxUsers;
  const totalEmployees = storeOverview?.totalEmployees;
  const showEmployeeLimit = storeOverview && maxEmployees != null && maxEmployees > 0;
  const currentUserRole = userProfile?.role || user?.role;
  const currentUserId = userProfile?.id || user?.id;

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const refreshEmployees = () => {
    if (activeStoreId) {
      const jwt = localStorage.getItem("jwt");
      if (jwt) {
        dispatch(findStoreEmployees({ storeId: activeStoreId, token: jwt }));
      }
    }
  };

  const rolePriority = (role) => {
    switch (role) {
      case "ROLE_STORE_ADMIN":
        return 0;
      case "ROLE_STORE_MANAGER":
        return 1;
      case "ROLE_BRANCH_ADMIN":
        return 2;
      case "ROLE_BRANCH_MANAGER":
        return 3;
      case "ROLE_BRANCH_CASHIER":
        return 4;
      default:
        return 99;
    }
  };

  const sortByRolePriority = (list) => {
    return [...list].sort((a, b) => {
      const pA = rolePriority(a.role);
      const pB = rolePriority(b.role);
      if (pA !== pB) return pA - pB;
      return (a.fullName || "").localeCompare(b.fullName || "");
    });
  };

  const handleAddEmployee = async (newEmployeeData) => {
    const jwt = localStorage.getItem("jwt");
    const targetStoreId = activeStoreId;
    if (targetStoreId && jwt) {
      try {
        await dispatch(
          createStoreEmployee({
            employee: {
              ...newEmployeeData,
              storeId: targetStoreId,
              username: newEmployeeData.email.split("@")[0],
            },
            storeId: targetStoreId,
            token: jwt,
          })
        ).unwrap();
        toast.success("Employee added successfully!");
        setIsAddDialogOpen(false);
        refreshEmployees();
      } catch (err) {
        toast.error(err || "Failed to add employee");
      }
    }
  };

  const handleEditEmployee = async (updatedEmployeeData) => {
    const jwt = localStorage.getItem("jwt");
    if (currentEmployee?.id && jwt) {
      try {
        await dispatch(
          updateEmployee({
            employeeId: currentEmployee.id,
            employeeDetails: updatedEmployeeData,
            token: jwt,
          })
        ).unwrap();
        toast.success("Employee updated successfully!");
        setIsEditDialogOpen(false);
        refreshEmployees();
        if (currentEmployee.role === "ROLE_STORE_ADMIN") {
          dispatch(getStoreByAdmin(jwt));
        }
      } catch (err) {
        toast.error(err || "Failed to update employee");
      }
    }
  };

  const confirmDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      setIsDeleting(true);
      try {
        await dispatch(deleteEmployee({ employeeId: employeeToDelete.id, token: jwt })).unwrap();
        toast.success(`Employee "${employeeToDelete.fullName}" deleted successfully!`);
        refreshEmployees();
      } catch (err) {
        toast.error(err?.message || err || "Failed to delete employee");
      } finally {
        setIsDeleting(false);
        setEmployeeToDelete(null);
      }
    }
  };

  const openEditDialog = (employee) => {
    const phone = employee.phone || (employee.role === "ROLE_STORE_ADMIN" ? store?.contact?.phone : "") || "";
    setCurrentEmployee({
      ...employee,
      phone,
    });
    setIsEditDialogOpen(true);
  };

  // Split employees into store-level and branch-level groups
  const { storeLevelEmployees, branchLevelEmployees } = useMemo(() => {
    const safeEmployees = Array.isArray(employees) ? employees : [];
    const storeLevel = safeEmployees.filter((emp) =>
      STORE_LEVEL_ROLES.includes(emp.role)
    );
    const branchLevel = safeEmployees.filter((emp) =>
      BRANCH_LEVEL_ROLES.includes(emp.role)
    );
    return {
      storeLevelEmployees: sortByRolePriority(storeLevel),
      branchLevelEmployees: sortByRolePriority(branchLevel),
    };
  }, [employees]);

  // Group branch-level employees by branchId
  const employeesByBranch = useMemo(() => {
    const map = {};
    branchLevelEmployees.forEach((emp) => {
      const branchId = emp.branchId || emp.branch?.id;
      if (branchId) {
        if (!map[branchId]) map[branchId] = [];
        map[branchId].push(emp);
      }
    });
    return map;
  }, [branchLevelEmployees]);

  return (
    <div className="space-y-6">
      {/* Header + Add Employee button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Employee Directory</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage store managers, branch managers, and terminal cashiers across all branches.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {showEmployeeLimit && (
            <Badge variant="outline" className="text-xs font-mono px-2.5 py-1 rounded-xl">
              {totalEmployees} / {maxEmployees} Quota
            </Badge>
          )}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-xl text-xs font-semibold h-9 gap-1.5 shadow-2xs">
                <UserPlus className="h-3.5 w-3.5" /> Add New Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[540px] max-h-[85vh] overflow-y-auto rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-foreground">Add New Employee</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Create credentials and assign administrative or cashier roles.
                </DialogDescription>
              </DialogHeader>
              <EmployeeForm
                onSubmit={handleAddEmployee}
                roles={storeAdminRole}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[540px] max-h-[85vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">Edit Employee Profile</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Update user credentials, contact details, or assigned branch.
              </DialogDescription>
            </DialogHeader>
            <EmployeeForm
              onSubmit={handleEditEmployee}
              roles={storeAdminRole}
              initialData={
                currentEmployee
                  ? {
                      ...currentEmployee,
                      branchId:
                        currentEmployee.branchId ||
                        currentEmployee.branch?.id ||
                        "",
                    }
                  : null
              }
            />
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="text-destructive text-xs font-medium">{error}</div>
      )}

      {/* Group A — Store-Level Staff (top section) */}
      <Card className="rounded-2xl border-border/80 shadow-2xs overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/60 py-3.5 px-6 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <StoreIcon className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-bold text-foreground">Store Executive & Management Staff</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs font-semibold rounded-lg">
            {storeLevelEmployees.length} Staff
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          {storeLevelEmployees.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No store-level administrative staff found.
            </div>
          ) : (
            <EmployeeTable
              employees={storeLevelEmployees}
              onEdit={openEditDialog}
              onDelete={(emp) => setEmployeeToDelete(emp)}
              currentUserRole={currentUserRole}
              currentUserId={currentUserId}
              showBranchColumn={false}
              storePhone={store?.contact?.phone || ""}
            />
          )}
        </CardContent>
      </Card>

      {/* Group B — Branch-Level Staff (accordion grouped by branch) */}
      <Card className="rounded-2xl border-border/80 shadow-2xs overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/60 py-3.5 px-6 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-bold text-foreground">Branch Staff & Cashier Terminals</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs font-semibold rounded-lg">
            {branchLevelEmployees.length} Staff
          </Badge>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {branches && branches.length > 0 ? (
            <Accordion type="multiple" className="w-full space-y-3">
              {branches.map((branch) => {
                const branchEmployees = employeesByBranch[branch.id] || [];
                return (
                  <AccordionItem key={branch.id} value={`branch-${branch.id}`} className="border border-border/60 rounded-xl overflow-hidden">
                    <AccordionTrigger className="px-4 py-3 text-left hover:no-underline bg-muted/20 hover:bg-muted/40 font-medium">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-bold text-foreground">{branch.name}</span>
                        <Badge variant="outline" className="text-[10px] ml-1">
                          {branchEmployees.length} Members
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-0 border-t border-border/40">
                      {branchEmployees.length === 0 ? (
                        <div className="text-center py-6 text-xs text-muted-foreground">
                          No staff assigned to this branch yet.
                        </div>
                      ) : (
                        <EmployeeTable
                          employees={branchEmployees}
                          onEdit={openEditDialog}
                          onDelete={(emp) => setEmployeeToDelete(emp)}
                          currentUserRole={currentUserRole}
                          currentUserId={currentUserId}
                          showBranchColumn={false}
                          storePhone={store?.contact?.phone || ""}
                        />
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No branches found. Create a branch first to assign branch-level staff.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog for Employee Deletion */}
      <AlertDialog
        open={Boolean(employeeToDelete)}
        onOpenChange={(open) => !open && setEmployeeToDelete(null)}
      >
        <AlertDialogContent className="rounded-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-foreground">Delete Employee Account</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete{" "}
              <strong className="text-foreground">
                "{employeeToDelete?.fullName}"
              </strong>
              ? This action will permanently revoke their POS login credentials.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2">
            <AlertDialogCancel disabled={isDeleting} className="rounded-xl text-xs font-semibold h-8">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteEmployee}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl text-xs font-semibold h-8"
            >
              {isDeleting ? "Deleting..." : "Delete Employee"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}