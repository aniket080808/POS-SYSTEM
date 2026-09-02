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
import { Search, Plus, RefreshCw, AlertCircle, Trash2, Users } from "lucide-react";
import { branchAdminRole } from "../../../utils/userRole";
import { Badge } from "@/components/ui/badge";

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
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [isPerformanceDialogOpen, setIsPerformanceDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: null,
    employee: null,
  });

  const dispatch = useDispatch();
  const branch = useSelector((state) => state.branch.branch);
  const { employees = [], loading } = useSelector((state) => state.employee);
  const currentUser = useSelector((state) => state.user.userProfile);

  const branchId = branch?.id || currentUser?.branchId || currentUser?.branch?.id;

  useEffect(() => {
    if (branchId) {
      dispatch(findBranchEmployees({ branchId }));
    }
  }, [branchId, dispatch]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearch =
        employee.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.phone?.includes(searchTerm);

      const matchesRole =
        roleFilter === "ALL" || employee.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [employees, searchTerm, roleFilter]);

  const handleAddEmployee = async (formData) => {
    try {
      const payload = {
        ...formData,
        branchId: branchId,
      };
      await dispatch(createBranchEmployee(payload)).unwrap();
      toast.success("Branch staff member created successfully.");
      setIsAddDialogOpen(false);
      if (branchId) dispatch(findBranchEmployees({ branchId }));
    } catch (err) {
      toast.error(err || "Failed to create staff account.");
    }
  };

  const handleEditEmployee = async (formData) => {
    if (!selectedEmployee) return;
    try {
      await dispatch(
        updateEmployee({
          id: selectedEmployee.id,
          employee: formData,
        })
      ).unwrap();
      toast.success("Staff profile updated successfully.");
      setIsEditDialogOpen(false);
      setSelectedEmployee(null);
      if (branchId) dispatch(findBranchEmployees({ branchId }));
    } catch (err) {
      toast.error(err || "Failed to update staff account.");
    }
  };

  const handleToggleAccessConfirmed = async () => {
    const emp = confirmDialog.employee;
    if (!emp) return;
    try {
      await dispatch(toggleEmployeeAccess(emp.id)).unwrap();
      toast.success(
        `Staff access ${emp.enabled !== false ? "revoked" : "granted"} for ${emp.fullName}.`
      );
      setConfirmDialog({ open: false, type: null, employee: null });
      if (branchId) dispatch(findBranchEmployees({ branchId }));
    } catch (err) {
      toast.error(err || "Failed to modify staff access.");
    }
  };

  const handleDeleteConfirmed = async () => {
    const emp = confirmDialog.employee;
    if (!emp) return;
    try {
      await dispatch(deleteEmployee(emp.id)).unwrap();
      toast.success(`Staff account for ${emp.fullName} permanently deleted.`);
      setConfirmDialog({ open: false, type: null, employee: null });
      if (branchId) dispatch(findBranchEmployees({ branchId }));
    } catch (err) {
      toast.error(err || "Failed to delete employee.");
    }
  };

  const handleResetPassword = async ({ employeeId, newPassword }) => {
    try {
      await dispatch(
        resetEmployeePassword({
          employeeId,
          newPassword,
        })
      ).unwrap();
      toast.success("Password reset successfully.");
      setIsResetPasswordDialogOpen(false);
    } catch (err) {
      toast.error(err || "Failed to reset password.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Branch Cashiers & Staff
            </h1>
            <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-mono font-bold">
              {employees.length} {employees.length === 1 ? "Member" : "Members"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage cashier terminal logins, shift authorizations, and operational security
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="text-xs h-10 gap-1.5"
            onClick={() => branchId && dispatch(findBranchEmployees({ branchId }))}
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Sync Staff
          </Button>

          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="text-xs font-bold h-10 gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Staff Member
          </Button>
        </div>
      </div>

      <EmployeeStats employees={employees} />

      {/* Filter Bar */}
      <div className="space-y-3 bg-card p-4 rounded-2xl border border-border shadow-2xs">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by Name, Email, or Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs h-10"
            />
          </div>

          <div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="text-xs h-10">
                <SelectValue placeholder="All Staff Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="ROLE_BRANCH_CASHIER">Cashier (Terminal Operator)</SelectItem>
                <SelectItem value="ROLE_BRANCH_MANAGER">Branch Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <EmployeeTable
        employees={filteredEmployees}
        loading={loading}
        currentUserRole={currentUser?.role}
        currentUserId={currentUser?.id}
        handleToggleAccess={(emp) =>
          setConfirmDialog({ open: true, type: "toggle", employee: emp })
        }
        handleDelete={(emp) =>
          setConfirmDialog({ open: true, type: "delete", employee: emp })
        }
        openResetPasswordDialog={(emp) => {
          setSelectedEmployee(emp);
          setIsResetPasswordDialogOpen(true);
        }}
        openPerformanceDialog={(emp) => {
          setSelectedEmployee(emp);
          setIsPerformanceDialogOpen(true);
        }}
        openEditDialog={(emp) => {
          setSelectedEmployee(emp);
          setIsEditDialogOpen(true);
        }}
      />

      {/* Dialogs */}
      <AddEmployeeDialog
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
        handleAddEmployee={handleAddEmployee}
        roles={branchAdminRole}
        defaultBranchId={branchId}
      />

      <EditEmployeeDialog
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        handleEditEmployee={handleEditEmployee}
        selectedEmployee={selectedEmployee}
        roles={branchAdminRole}
      />

      <ResetPasswordDialog
        isOpen={isResetPasswordDialogOpen}
        onClose={() => {
          setIsResetPasswordDialogOpen(false);
          setSelectedEmployee(null);
        }}
        onResetPassword={handleResetPassword}
        employee={selectedEmployee}
      />

      <PerformanceDialog
        isOpen={isPerformanceDialogOpen}
        onClose={() => {
          setIsPerformanceDialogOpen(false);
          setSelectedEmployee(null);
        }}
        employee={selectedEmployee}
      />

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => {
          if (!open) setConfirmDialog({ open: false, type: null, employee: null });
        }}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">
              {confirmDialog.type === "delete"
                ? "Confirm Staff Deletion"
                : confirmDialog.employee?.enabled !== false
                ? "Revoke Terminal Login Access"
                : "Grant Terminal Login Access"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {confirmDialog.type === "delete"
                ? `Are you sure you want to permanently delete the staff profile for ${confirmDialog.employee?.fullName}? This action cannot be undone.`
                : confirmDialog.employee?.enabled !== false
                ? `Revoking access will immediately disconnect ${confirmDialog.employee?.fullName} from logging into branch checkout stations.`
                : `Granting access will allow ${confirmDialog.employee?.fullName} to log in and process orders.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="text-xs h-9">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={
                confirmDialog.type === "delete"
                  ? handleDeleteConfirmed
                  : handleToggleAccessConfirmed
              }
              className={`text-xs font-bold h-9 ${
                confirmDialog.type === "delete" || confirmDialog.employee?.enabled !== false
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }`}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BranchEmployees;
