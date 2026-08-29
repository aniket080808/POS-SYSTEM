import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Search, Plus, RefreshCw, AlertCircle, Trash2 } from "lucide-react";
import { branchAdminRole } from "../../../utils/userRole";

import EmployeeStats from "./EmployeeStats";
import EmployeeTable from "./EmployeeTable";
import {
  AddEmployeeDialog,
  EditEmployeeDialog,
  ResetPasswordDialog,
  PerformanceDialog,
} from "./EmployeeDialogs";
import { useDispatch, useSelector } from "react-redux";
import {
  createBranchEmployee,
  findBranchEmployees,
  updateEmployee,
  deleteEmployee,
  toggleEmployeeAccess,
  resetEmployeePassword,
} from "../../../Redux Toolkit/features/employee/employeeThunks";
import { toast } from "sonner";

const BranchEmployees = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] =
    useState(false);
  const [isPerformanceDialogOpen, setIsPerformanceDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Confirmation dialog state for toggle access and deletion
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: null, // "toggle" | "delete"
    employee: null,
  });

  const dispatch = useDispatch();
  const { branch } = useSelector((state) => state.branch);
  const { employees, loading, error } = useSelector((state) => state.employee);
  const { userProfile } = useSelector((state) => state.user);

  const activeBranchId =
    branch?.id || userProfile?.branchId || userProfile?.branch?.id;

  // Filter roles based on caller's permission
  const allowedRoles = useMemo(() => {
    if (userProfile?.role === "ROLE_BRANCH_MANAGER") {
      return ["ROLE_BRANCH_CASHIER"];
    }
    if (userProfile?.role === "ROLE_BRANCH_ADMIN") {
      return ["ROLE_BRANCH_MANAGER", "ROLE_BRANCH_CASHIER"];
    }
    return branchAdminRole;
  }, [userProfile?.role]);

  const fetchEmployees = React.useCallback(() => {
    if (activeBranchId) {
      dispatch(
        findBranchEmployees({
          branchId: activeBranchId,
        })
      );
    }
  }, [dispatch, activeBranchId]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddEmployee = async (newEmployeeData) => {
    const token = localStorage.getItem("jwt");
    if (activeBranchId && token) {
      try {
        await dispatch(
          createBranchEmployee({
            employee: {
              ...newEmployeeData,
              username: newEmployeeData.email.split("@")[0],
            },
            branchId: activeBranchId,
            token,
          })
        ).unwrap();
        toast.success("Employee added successfully!");
        setIsAddDialogOpen(false);
        fetchEmployees();
      } catch (err) {
        toast.error(err || "Failed to add employee");
      }
    }
  };

  const handleEditEmployee = async (updatedEmployeeData) => {
    const token = localStorage.getItem("jwt");
    if (selectedEmployee?.id && token) {
      try {
        await dispatch(
          updateEmployee({
            employeeId: selectedEmployee.id,
            employeeDetails: updatedEmployeeData,
            token,
          })
        ).unwrap();
        toast.success("Employee updated successfully!");
        setIsEditDialogOpen(false);
        fetchEmployees();
      } catch (err) {
        toast.error(err || "Failed to update employee");
      }
    }
  };

  const executeToggleAccess = async (employee) => {
    const token = localStorage.getItem("jwt");
    if (employee?.id && token) {
      try {
        const res = await dispatch(
          toggleEmployeeAccess({
            employeeId: employee.id,
            token,
          })
        ).unwrap();
        const status = res.enabled !== false ? "enabled" : "disabled";
        toast.success(`Access ${status} for ${employee.fullName}`);
        fetchEmployees();
      } catch (err) {
        toast.error(err || "Failed to toggle employee access");
      }
    }
  };

  const handleToggleAccessPrompt = (employee) => {
    const isCurrentlyEnabled = employee.enabled !== false;
    if (isCurrentlyEnabled) {
      // Prompt confirmation before disabling
      setConfirmDialog({
        open: true,
        type: "toggle",
        employee,
      });
    } else {
      // Re-enabling can happen immediately
      executeToggleAccess(employee);
    }
  };

  const handleDeletePrompt = (employee) => {
    setConfirmDialog({
      open: true,
      type: "delete",
      employee,
    });
  };

  const executeDeleteEmployee = async (employee) => {
    const token = localStorage.getItem("jwt");
    if (employee?.id && token) {
      try {
        await dispatch(
          deleteEmployee({
            employeeId: employee.id,
            token,
          })
        ).unwrap();
        toast.success(`Employee ${employee.fullName} deleted successfully`);
        fetchEmployees();
      } catch (err) {
        toast.error(err || "Failed to delete employee");
      }
    }
  };

  const handleConfirmAction = () => {
    if (!confirmDialog.employee) return;
    if (confirmDialog.type === "toggle") {
      executeToggleAccess(confirmDialog.employee);
    } else if (confirmDialog.type === "delete") {
      executeDeleteEmployee(confirmDialog.employee);
    }
    setConfirmDialog({ open: false, type: null, employee: null });
  };

  const handleResetPassword = async (newPassword) => {
    const token = localStorage.getItem("jwt");
    if (selectedEmployee?.id && token) {
      try {
        await dispatch(
          resetEmployeePassword({
            employeeId: selectedEmployee.id,
            newPassword,
            token,
          })
        ).unwrap();
        toast.success(
          `Password reset successfully for ${selectedEmployee.fullName}!`
        );
        setIsResetPasswordDialogOpen(false);
      } catch (err) {
        toast.error(err || "Failed to reset employee password");
      }
    }
  };

  const openEditDialog = (employee) => {
    setSelectedEmployee(employee);
    setIsEditDialogOpen(true);
  };

  const openResetPasswordDialog = (employee) => {
    setSelectedEmployee(employee);
    setIsResetPasswordDialogOpen(true);
  };

  const openPerformanceDialog = (employee) => {
    setSelectedEmployee(employee);
    setIsPerformanceDialogOpen(true);
  };

  const filteredEmployees = useMemo(() => {
    return (
      employees?.filter((emp) => {
        // Search term filter
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const matches =
            emp.fullName?.toLowerCase().includes(term) ||
            emp.email?.toLowerCase().includes(term) ||
            emp.phone?.includes(term) ||
            emp.role?.toLowerCase().includes(term);
          if (!matches) return false;
        }

        // Role dropdown filter
        if (roleFilter !== "ALL") {
          if (emp.role !== roleFilter) return false;
        }

        return true;
      }) || []
    );
  }, [employees, searchTerm, roleFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Employee Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage branch staff, roles, and access credentials
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEmployees}
            disabled={loading}
            className="text-xs h-9 rounded-xl"
            title="Refresh employees list"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <AddEmployeeDialog
            isAddDialogOpen={isAddDialogOpen}
            setIsAddDialogOpen={setIsAddDialogOpen}
            handleAddEmployee={handleAddEmployee}
            roles={allowedRoles}
            defaultBranchId={activeBranchId}
          />
        </div>
      </div>

      <EmployeeStats employees={employees || []} />

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEmployees}
            className="text-xs border-destructive/30 hover:bg-destructive/10"
          >
            Try Again
          </Button>
        </div>
      )}

      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, phone..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[170px] text-xs h-9">
                  <SelectValue placeholder="Filter by Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Roles</SelectItem>
                  <SelectItem value="ROLE_BRANCH_ADMIN">Branch Admin</SelectItem>
                  <SelectItem value="ROLE_BRANCH_MANAGER">Branch Manager</SelectItem>
                  <SelectItem value="ROLE_BRANCH_CASHIER">Cashier</SelectItem>
                </SelectContent>
              </Select>

              {(searchTerm || roleFilter !== "ALL") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setRoleFilter("ALL");
                  }}
                  className="text-xs text-muted-foreground h-9"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <EmployeeTable
              employees={filteredEmployees}
              loading={loading}
              currentUserRole={userProfile?.role}
              currentUserId={userProfile?.id}
              handleToggleAccess={handleToggleAccessPrompt}
              handleDelete={handleDeletePrompt}
              openEditDialog={openEditDialog}
              openResetPasswordDialog={openResetPasswordDialog}
              openPerformanceDialog={openPerformanceDialog}
            />
          </div>
        </CardContent>
      </Card>

      <EditEmployeeDialog
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        selectedEmployee={selectedEmployee}
        handleEditEmployee={handleEditEmployee}
        roles={allowedRoles}
        defaultBranchId={activeBranchId}
      />

      <ResetPasswordDialog
        isResetPasswordDialogOpen={isResetPasswordDialogOpen}
        setIsResetPasswordDialogOpen={setIsResetPasswordDialogOpen}
        selectedEmployee={selectedEmployee}
        handleResetPassword={handleResetPassword}
      />

      <PerformanceDialog
        isPerformanceDialogOpen={isPerformanceDialogOpen}
        setIsPerformanceDialogOpen={setIsPerformanceDialogOpen}
        selectedEmployee={selectedEmployee}
      />

      {/* Confirmation Dialog for Toggle Access & Delete */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => {
          if (!open) setConfirmDialog({ open: false, type: null, employee: null });
        }}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.type === "delete"
                ? "Delete Employee Account?"
                : "Disable Employee Access?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.type === "delete" ? (
                <>
                  Are you sure you want to permanently delete{" "}
                  <strong>{confirmDialog.employee?.fullName}</strong>? This action
                  cannot be undone.
                </>
              ) : (
                <>
                  Disabling access for{" "}
                  <strong>{confirmDialog.employee?.fullName}</strong> will
                  immediately prevent them from logging into the POS terminal.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={`rounded-xl text-white ${
                confirmDialog.type === "delete"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-amber-600 hover:bg-amber-700"
              }`}
            >
              {confirmDialog.type === "delete" ? "Delete Employee" : "Disable Access"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BranchEmployees;
