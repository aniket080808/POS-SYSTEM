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
import { Plus, Users, Store as StoreIcon, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  const { employees, error } = useSelector((state) => state.employee);
  const { branches } = useSelector((state) => state.branch);
  const { store } = useSelector((state) => state.store);
  const { storeOverview } = useSelector((state) => state.storeAnalytics);
  const { statusResponse } = useSelector((state) => state.storeSubscription);
  const { user } = useSelector((state) => state.user);
  const { userProfile } = useSelector((state) => state.user);

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

  // Helper to re-fetch the full employee list (avoids "disappears after refresh" bug)
  const refreshEmployees = () => {
    if (activeStoreId) {
      const jwt = localStorage.getItem("jwt");
      if (jwt) {
        dispatch(findStoreEmployees({ storeId: activeStoreId, token: jwt }));
      }
    }
  };

  // Role priority weight for sorting (lower weight = higher priority / pinned to top)
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

  // Sort employees by role priority
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees]);

  // Group branch-level employees by branchId (preserve sort order within each branch)
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Employee Management
        </h1>
        <div className="flex items-center gap-3">
          {showEmployeeLimit && (
            <Badge variant="outline" className="text-xs">
              {totalEmployees}/{maxEmployees} employees
            </Badge>
          )}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="mr-2 h-4 w-4" /> Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
              </DialogHeader>
              <EmployeeForm
                onSubmit={handleAddEmployee}
                roles={storeAdminRole}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Employee</DialogTitle>
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
        <div className="text-red-500 text-sm">{error}</div>
      )}

      {/* Group A — Store-Level Staff (top section) */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <StoreIcon className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Store-Level Staff</CardTitle>
          <Badge variant="secondary" className="ml-1">
            {storeLevelEmployees.length}
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          {storeLevelEmployees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No store-level staff found.
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
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Branch-Level Staff</CardTitle>
          <Badge variant="secondary" className="ml-1">
            {branchLevelEmployees.length}
          </Badge>
        </CardHeader>
        <CardContent>
          {branches && branches.length > 0 ? (
            <Accordion type="multiple" className="w-full">
              {branches.map((branch) => {
                const branchEmployees = employeesByBranch[branch.id] || [];
                return (
                  <AccordionItem key={branch.id} value={`branch-${branch.id}`}>
                    <AccordionTrigger className="px-4 py-3 text-left hover:no-underline hover:bg-gray-50 text-gray-900 font-medium">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{branch.name}</span>
                        <Badge variant="outline" className="ml-1">
                          {branchEmployees.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-2">
                      {branchEmployees.length === 0 ? (
                        <div className="text-center py-6 text-gray-500">
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
            <div className="text-center py-8 text-gray-500">
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                "{employeeToDelete?.fullName}"
              </span>
              ? This action will permanently remove their access and profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteEmployee}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete Employee"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}