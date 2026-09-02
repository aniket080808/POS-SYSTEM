import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus, Users, Store as StoreIcon, MapPin, ShieldCheck, UserCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
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
import { storeAdminRole, storeManagerRole, STORE_LEVEL_ROLES, BRANCH_LEVEL_ROLES } from "../../../utils/userRole";
import { useToast } from "@/components/ui/use-toast";
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
  const { employees = [], loading, error } = useSelector((state) => state.employee);
  const { branches = [] } = useSelector((state) => state.branch);
  const { store } = useSelector((state) => state.store);
  const { storeOverview } = useSelector((state) => state.storeAnalytics);
  const { statusResponse } = useSelector((state) => state.storeSubscription);
  const { userProfile, user } = useSelector((state) => state.user);
  const { toast } = useToast();

  const activeStoreId = store?.id || userProfile?.store?.id;

  useEffect(() => {
    if (!store?.id) {
      const jwt = localStorage.getItem("jwt");
      if (jwt) dispatch(getStoreByAdmin(jwt));
    }
  }, [dispatch, store?.id]);

  useEffect(() => {
    if (activeStoreId) {
      const token = localStorage.getItem("jwt");
      dispatch(findStoreEmployees({ storeId: activeStoreId, token }));
      dispatch(getAllBranchesByStore({ storeId: activeStoreId, jwt: token }));
    }
  }, [dispatch, activeStoreId]);

  useEffect(() => {
    if (userProfile?.id && !storeOverview) {
      dispatch(getStoreOverview(userProfile.id));
    }
  }, [dispatch, userProfile?.id, storeOverview]);

  const [isAddStoreEmployeeOpen, setIsAddStoreEmployeeOpen] = useState(false);
  const [isAddBranchEmployeeOpen, setIsAddBranchEmployeeOpen] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  const currentUserRole = userProfile?.role || user?.role;
  const currentUserId = userProfile?.id || user?.id;
  const canManageStore = currentUserRole === "ROLE_STORE_ADMIN" || currentUserRole === "ROLE_ADMIN";
  const canAddStaff =
    currentUserRole === "ROLE_STORE_ADMIN" ||
    currentUserRole === "ROLE_STORE_MANAGER" ||
    currentUserRole === "ROLE_ADMIN";

  const selectableRoles =
    currentUserRole === "ROLE_STORE_MANAGER" ? storeManagerRole : storeAdminRole;

  const maxUsers = statusResponse?.currentPlan?.maxUsers;
  const totalEmployees = storeOverview?.totalEmployees || employees.length;
  const showUserLimit = maxUsers != null && maxUsers > 0;

  const storeLevelEmployees = useMemo(() => {
    return employees.filter((emp) => STORE_LEVEL_ROLES.includes(emp.role));
  }, [employees]);

  const employeesByBranch = useMemo(() => {
    const map = {};
    branches.forEach((b) => {
      map[b.id] = [];
    });
    map["unassigned"] = [];

    employees
      .filter((emp) => BRANCH_LEVEL_ROLES.includes(emp.role))
      .forEach((emp) => {
        const bId = emp.branchId ?? emp.branch?.id;
        if (bId && map[bId]) {
          map[bId].push(emp);
        } else {
          map["unassigned"].push(emp);
        }
      });
    return map;
  }, [employees, branches]);

  const handleCreateEmployee = async (values) => {
    try {
      const token = localStorage.getItem("jwt");
      const targetStoreId = activeStoreId || store?.id || userProfile?.storeId;
      await dispatch(
        createStoreEmployee({
          employee: values,
          employeeData: values,
          storeId: targetStoreId,
          token,
        })
      ).unwrap();
      toast({ title: "Staff Account Created", description: `Account for ${values.fullName} created successfully.` });
      setIsAddStoreEmployeeOpen(false);
      setIsAddBranchEmployeeOpen(false);
      if (targetStoreId) {
        dispatch(findStoreEmployees({ storeId: targetStoreId, token }));
        if (userProfile?.id) {
          dispatch(getStoreOverview(userProfile.id));
        }
      }
    } catch (err) {
      toast({
        title: "Creation Error",
        description: err.message || err || "Failed to create staff member.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateEmployee = async (values) => {
    try {
      const token = localStorage.getItem("jwt");
      await dispatch(
        updateEmployee({
          employeeId: editingEmployee.id,
          id: editingEmployee.id,
          employeeDetails: values,
          employeeData: values,
          token,
        })
      ).unwrap();
      toast({ title: "Staff Updated", description: "Employee profile updated successfully." });
      setIsEditDialogOpen(false);
      setEditingEmployee(null);
      if (activeStoreId) {
        dispatch(findStoreEmployees({ storeId: activeStoreId, token }));
      }
    } catch (err) {
      toast({
        title: "Update Error",
        description: err.message || err || "Failed to update employee.",
        variant: "destructive",
      });
    }
  };

  const confirmDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    try {
      const token = localStorage.getItem("jwt");
      await dispatch(deleteEmployee({ employeeId: employeeToDelete.id, id: employeeToDelete.id, token })).unwrap();
      toast({ title: "Staff Deleted", description: `Account for ${employeeToDelete.fullName} deleted.` });
      setEmployeeToDelete(null);
      if (activeStoreId) {
        dispatch(findStoreEmployees({ storeId: activeStoreId, token }));
        if (userProfile?.id) {
          dispatch(getStoreOverview(userProfile.id));
        }
      }
    } catch (err) {
      toast({
        title: "Delete Failed",
        description: err.message || err || "Failed to delete employee.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Staff & Cashier Account Governance
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage Store Administrators, Branch Managers, and authorized Cashier terminal logins
          </p>
        </div>

        <div className="flex items-center gap-3">
          {showUserLimit && (
            <Badge variant="outline" className="font-mono text-xs px-2.5 py-1">
              Quota: {totalEmployees} / {maxUsers} staff
            </Badge>
          )}
          {canAddStaff && (
            <Dialog
              open={isAddStoreEmployeeOpen}
              onOpenChange={(open) => {
                setIsAddStoreEmployeeOpen(open);
                if (!open) setSelectedBranchId(null);
              }}
            >
              <DialogTrigger asChild>
                <Button className="text-xs font-bold h-10 gap-1.5 cursor-pointer">
                  <Plus className="w-4 h-4" /> Add Staff Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold">Add Staff Member</DialogTitle>
                  <DialogDescription className="text-xs">
                    Create a new role-based staff login for store backoffice or cashier terminal
                  </DialogDescription>
                </DialogHeader>
                <EmployeeForm
                  onSubmit={handleCreateEmployee}
                  roles={selectableRoles}
                  defaultBranchId={selectedBranchId}
                  onCancel={() => {
                    setIsAddStoreEmployeeOpen(false);
                    setSelectedBranchId(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Edit Staff Profile</DialogTitle>
            <DialogDescription className="text-xs">
              Update credentials, contact information, role, or workstation assignment
            </DialogDescription>
          </DialogHeader>
          <EmployeeForm
            initialData={editingEmployee}
            onSubmit={handleUpdateEmployee}
            roles={selectableRoles}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={Boolean(employeeToDelete)} onOpenChange={(open) => !open && setEmployeeToDelete(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-destructive">Delete Staff Member</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to delete <strong>"{employeeToDelete?.fullName}"</strong>?
              This will revoke login credentials immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs h-9">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteEmployee}
              className="text-xs font-bold h-9 bg-destructive hover:bg-destructive/90 text-white"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Section 1: Store-Level Administrators */}
      <Card>
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#B8860B]" />
              <CardTitle className="text-base">Store-Level Administrators</CardTitle>
            </div>
            <Badge variant="secondary" className="text-xs font-mono">
              {storeLevelEmployees.length} {storeLevelEmployees.length === 1 ? "Admin" : "Admins"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <EmployeeTable
            employees={storeLevelEmployees}
            onEdit={(emp) => {
              setEditingEmployee(emp);
              setIsEditDialogOpen(true);
            }}
            onDelete={setEmployeeToDelete}
            currentUserRole={currentUserRole}
            currentUserId={currentUserId}
            storePhone={store?.contact?.phone || store?.phone || ""}
          />
        </CardContent>
      </Card>

      {/* Section 2: Branch-Level Staff & Cashiers */}
      <Card>
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#B8860B]" />
              <CardTitle className="text-base">Branch Workstation Cashiers & Managers</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              {branches.length} {branches.length === 1 ? "Branch" : "Branches"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {branches.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground font-semibold">
              No branch workstations configured yet.
            </div>
          ) : (
            <Accordion type="multiple" defaultValue={branches.map((b) => String(b.id))} className="space-y-3">
              {branches.map((branch) => {
                const branchStaff = employeesByBranch[branch.id] || [];
                return (
                  <AccordionItem
                    key={branch.id}
                    value={String(branch.id)}
                    className="border border-border/70 rounded-2xl overflow-hidden bg-card"
                  >
                    <AccordionTrigger className="px-4 py-3 hover:no-underline bg-secondary/30">
                      <div className="flex items-center justify-between w-full pr-4 text-left">
                        <div className="flex items-center gap-2">
                          <StoreIcon className="w-4 h-4 text-[#B8860B]" />
                          <span className="font-bold text-sm text-foreground">{branch.name}</span>
                          <span className="text-xs text-muted-foreground font-mono">({branch.address})</span>
                        </div>
                        <Badge variant="secondary" className="text-xs font-mono">
                          {branchStaff.length} Staff
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 pt-3 space-y-3">
                      {canAddStaff && (
                        <div className="flex items-center justify-between pb-2 border-b border-border/50">
                          <span className="text-xs text-muted-foreground font-medium">
                            Manage staff assigned to <strong>{branch.name}</strong>
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2.5 text-[11px] font-semibold gap-1 cursor-pointer hover:bg-primary/10"
                            onClick={() => {
                              setSelectedBranchId(branch.id);
                              setIsAddStoreEmployeeOpen(true);
                            }}
                          >
                            <Plus className="w-3 h-3" /> Add Staff to Branch
                          </Button>
                        </div>
                      )}
                      <EmployeeTable
                        employees={branchStaff}
                        onEdit={(emp) => {
                          setEditingEmployee(emp);
                          setIsEditDialogOpen(true);
                        }}
                        onDelete={setEmployeeToDelete}
                        currentUserRole={currentUserRole}
                        currentUserId={currentUserId}
                      />
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}