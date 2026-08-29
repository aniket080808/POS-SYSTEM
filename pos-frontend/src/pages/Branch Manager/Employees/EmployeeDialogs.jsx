import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Key,
  Copy,
  Check,
  RefreshCw,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Clock,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { getRoleDisplayName } from "@/utils/userRole";
import { formatDateTime } from "@/utils/formateDate";
import { useCurrencyFormatter } from "@/utils/currencyUtils";
import { EmployeeForm } from "../../store/Employee";
import { useDispatch } from "react-redux";
import { getEmployeePerformance } from "@/Redux Toolkit/features/employee/employeeThunks";
import { toast } from "sonner";

export const AddEmployeeDialog = ({
  isAddDialogOpen,
  setIsAddDialogOpen,
  handleAddEmployee,
  roles,
  defaultBranchId,
}) => (
  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
    <DialogTrigger asChild>
      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20">
        <Plus className="mr-2 h-4 w-4" /> Add Employee
      </Button>
    </DialogTrigger>
    <DialogContent className="max-h-[85vh] overflow-y-auto rounded-2xl">
      <DialogHeader>
        <DialogTitle>Add New Employee</DialogTitle>
      </DialogHeader>
      <EmployeeForm
        initialData={null}
        onSubmit={handleAddEmployee}
        roles={roles}
        defaultBranchId={defaultBranchId}
      />
    </DialogContent>
  </Dialog>
);

export const EditEmployeeDialog = ({
  isEditDialogOpen,
  setIsEditDialogOpen,
  selectedEmployee,
  handleEditEmployee,
  roles,
  defaultBranchId,
}) =>
  selectedEmployee && (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>Edit Employee - {selectedEmployee.fullName}</DialogTitle>
        </DialogHeader>
        <EmployeeForm
          initialData={
            selectedEmployee
              ? {
                  ...selectedEmployee,
                  branchId:
                    selectedEmployee.branchId ||
                    selectedEmployee.branch?.id ||
                    defaultBranchId ||
                    "",
                }
              : null
          }
          onSubmit={handleEditEmployee}
          roles={roles}
          defaultBranchId={defaultBranchId}
        />
      </DialogContent>
    </Dialog>
  );

export const ResetPasswordDialog = ({
  isResetPasswordDialogOpen,
  setIsResetPasswordDialogOpen,
  selectedEmployee,
  handleResetPassword,
}) => {
  const [newPassword, setNewPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isResetPasswordDialogOpen) {
      setNewPassword("");
      setCopied(false);
      setError("");
    }
  }, [isResetPasswordDialogOpen]);

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    let pwd = "";
    for (let i = 0; i < 8; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const special = "@#$!";
    pwd += special.charAt(Math.floor(Math.random() * special.length)) + "1a";
    setNewPassword(pwd);
    setError("");
  };

  const copyToClipboard = async () => {
    if (newPassword) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(newPassword);
        } else {
          // Fallback for non-secure origin
          const textArea = document.createElement("textarea");
          textArea.value = newPassword;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
        }
        setCopied(true);
        toast.success("Password copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error("Failed to copy password");
      }
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    handleResetPassword(newPassword);
  };

  if (!selectedEmployee) return null;

  return (
    <Dialog
      open={isResetPasswordDialogOpen}
      onOpenChange={setIsResetPasswordDialogOpen}
    >
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-amber-600" />
            Reset Password
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-2">
          <div>
            <p className="text-sm text-foreground">
              Reset login password for{" "}
              <strong className="text-foreground">{selectedEmployee.fullName}</strong> (
              <span className="text-muted-foreground">{selectedEmployee.email}</span>)
            </p>
            <p className="text-xs text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 p-2.5 rounded-xl mt-2 border border-amber-200 dark:border-amber-800">
              ⚠️ Resetting the password will immediately invalidate all active sessions for this user.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="newPassword">New Password</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={generateRandomPassword}
                className="text-xs text-emerald-600 hover:text-emerald-700 h-7 px-2"
              >
                <RefreshCw className="h-3 w-3 mr-1" /> Auto-generate
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                id="newPassword"
                type="text"
                placeholder="Enter new password (min 8 chars)"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError("");
                }}
                className="font-mono"
              />
              {newPassword && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={copyToClipboard}
                  title="Copy to Clipboard"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsResetPasswordDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-xs">
              Reset Password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const PerformanceDialog = ({
  isPerformanceDialogOpen,
  setIsPerformanceDialogOpen,
  selectedEmployee,
}) => {
  const { format: formatCurrency } = useCurrencyFormatter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [perfData, setPerfData] = useState(null);
  const [error, setError] = useState(null);

  const fetchPerformance = useCallback(() => {
    if (selectedEmployee?.id) {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("jwt");
      dispatch(
        getEmployeePerformance({ employeeId: selectedEmployee.id, token })
      )
        .unwrap()
        .then((res) => {
          setPerfData(res);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load performance:", err);
          setError(err || "Failed to load employee performance metrics.");
          setLoading(false);
        });
    }
  }, [dispatch, selectedEmployee?.id]);

  useEffect(() => {
    if (isPerformanceDialogOpen && selectedEmployee?.id) {
      fetchPerformance();
    } else {
      setPerfData(null);
      setError(null);
    }
  }, [isPerformanceDialogOpen, selectedEmployee?.id, fetchPerformance]);

  if (!selectedEmployee) return null;

  const isCashier = selectedEmployee.role === "ROLE_BRANCH_CASHIER";

  return (
    <Dialog
      open={isPerformanceDialogOpen}
      onOpenChange={setIsPerformanceDialogOpen}
    >
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Performance Summary - {selectedEmployee.fullName}</span>
            <Badge variant="outline" className="border-border/80 text-xs">
              {getRoleDisplayName(selectedEmployee.role)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-16 text-center text-muted-foreground animate-pulse flex flex-col items-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />
            <p className="text-sm">Loading performance metrics...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center space-y-3">
            <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center justify-center gap-2 max-w-md mx-auto">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPerformance}
              className="text-xs rounded-xl"
            >
              Retry
            </Button>
          </div>
        ) : isCashier ? (
          <div className="space-y-6 py-2">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="rounded-2xl border-border/80">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center">
                    <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-2xl mb-2">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Orders Processed
                    </h3>
                    <p className="text-3xl font-black mt-1 text-foreground font-mono">
                      {perfData?.totalOrders != null ? perfData.totalOrders : 0}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">All time</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border/80">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center">
                    <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-2xl mb-2">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Total Revenue
                    </h3>
                    <p className="text-3xl font-black mt-1 text-emerald-600 dark:text-emerald-400 font-mono">
                      {formatCurrency(
                        perfData?.totalSales != null ? perfData.totalSales : 0
                      )}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Gross sales</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border/80">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center">
                    <div className="p-2.5 bg-purple-500/10 text-purple-600 rounded-2xl mb-2">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Avg. Order Value
                    </h3>
                    <p className="text-3xl font-black mt-1 text-purple-600 dark:text-purple-400 font-mono">
                      {formatCurrency(
                        perfData?.avgOrderValue != null ? perfData.avgOrderValue : 0
                      )}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Per transaction</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-2xl border-border/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-600" /> Shift & Activity Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="p-3 bg-muted/50 rounded-xl">
                  <span className="text-[11px] text-muted-foreground block">Total Shifts</span>
                  <span className="font-bold text-foreground font-mono">
                    {perfData?.totalShifts ?? 0}
                  </span>
                </div>
                <div className="p-3 bg-muted/50 rounded-xl">
                  <span className="text-[11px] text-muted-foreground block mb-1">Shift Status</span>
                  <Badge
                    variant={
                      perfData?.currentShiftStatus === "ACTIVE" ? "default" : "secondary"
                    }
                    className="text-[10px]"
                  >
                    {perfData?.currentShiftStatus || "CLOSED"}
                  </Badge>
                </div>
                <div className="p-3 bg-muted/50 rounded-xl">
                  <span className="text-[11px] text-muted-foreground block">Assigned Since</span>
                  <span className="font-medium text-foreground text-xs">
                    {perfData?.assignedSince
                      ? formatDateTime(perfData.assignedSince)
                      : "-"}
                  </span>
                </div>
                <div className="p-3 bg-muted/50 rounded-xl">
                  <span className="text-[11px] text-muted-foreground block">Last Activity</span>
                  <span className="font-medium text-foreground text-xs">
                    {perfData?.lastActivity
                      ? formatDateTime(perfData.lastActivity)
                      : "Active recently"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6 py-2">
            <Card className="rounded-2xl border-border/80">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> Role & Operational Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/50 rounded-xl">
                    <span className="text-[11px] text-muted-foreground block">Assigned Branch</span>
                    <span className="font-bold text-foreground">
                      {perfData?.branchName ||
                        selectedEmployee.branch?.name ||
                        "Main Branch"}
                    </span>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-xl">
                    <span className="text-[11px] text-muted-foreground block mb-1">Account Status</span>
                    <Badge
                      variant={
                        perfData?.enabled !== false ? "default" : "destructive"
                      }
                      className="text-[10px]"
                    >
                      {perfData?.enabled !== false ? "Active / Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-xl">
                    <span className="text-[11px] text-muted-foreground block">Assigned Since</span>
                    <span className="font-medium text-foreground text-xs">
                      {perfData?.assignedSince
                        ? formatDateTime(perfData.assignedSince)
                        : "-"}
                    </span>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-xl">
                    <span className="text-[11px] text-muted-foreground block">Email & Phone</span>
                    <span className="font-medium text-foreground block text-xs truncate">
                      {selectedEmployee.email}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {selectedEmployee.phone || "—"}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl border border-emerald-500/20">
                  ℹ️ Individual sales performance tracking applies directly to Cashier staff. Operational oversight, inventory audits, and store performance are tracked under branch reports.
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter>
          <Button
            onClick={() => setIsPerformanceDialogOpen(false)}
            className="rounded-xl text-xs"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
