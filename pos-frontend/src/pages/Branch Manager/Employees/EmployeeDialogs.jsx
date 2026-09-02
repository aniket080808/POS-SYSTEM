import React, { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Key,
  Copy,
  Check,
  ShoppingBag,
  Clock,
  ShieldCheck,
  TrendingUp,
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
    <DialogContent className="max-h-[85vh] overflow-y-auto rounded-2xl bg-card border-border sm:max-w-lg">
      <DialogHeader className="pb-3 border-b border-border/60">
        <DialogTitle className="text-base font-bold">Register Branch Staff Member</DialogTitle>
      </DialogHeader>
      <div className="pt-2">
        <EmployeeForm
          initialData={null}
          onSubmit={handleAddEmployee}
          roles={roles}
          defaultBranchId={defaultBranchId}
        />
      </div>
    </DialogContent>
  </Dialog>
);

export const EditEmployeeDialog = ({
  isEditDialogOpen,
  setIsEditDialogOpen,
  handleEditEmployee,
  selectedEmployee,
  roles,
}) => (
  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
    <DialogContent className="max-h-[85vh] overflow-y-auto rounded-2xl bg-card border-border sm:max-w-lg">
      <DialogHeader className="pb-3 border-b border-border/60">
        <DialogTitle className="text-base font-bold">Edit Staff Profile</DialogTitle>
      </DialogHeader>
      <div className="pt-2">
        <EmployeeForm
          initialData={selectedEmployee}
          onSubmit={handleEditEmployee}
          roles={roles}
          defaultBranchId={selectedEmployee?.branchId || selectedEmployee?.branch?.id}
        />
      </div>
    </DialogContent>
  </Dialog>
);

export const ResetPasswordDialog = ({
  isOpen,
  onClose,
  onResetPassword,
  employee,
}) => {
  const [newPassword, setNewPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pwd = "";
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pwd);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(newPassword);
    setCopied(true);
    toast.success("Password copied to clipboard.");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    onResetPassword({ employeeId: employee.id, newPassword });
    setNewPassword("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader className="pb-3 border-b border-border/60">
          <DialogTitle className="text-base font-bold">
            Reset Password: {employee?.fullName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-foreground">
                New Terminal Password
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={generateRandomPassword}
                className="text-[11px] h-6 px-2 text-muted-foreground hover:text-foreground"
              >
                Generate Random
              </Button>
            </div>
            <div className="relative">
              <Input
                type="text"
                placeholder="Enter or generate password..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="text-xs h-10 font-mono pr-10"
              />
              {newPassword && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-foreground" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2 border-t border-border/60">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs h-9">
              Cancel
            </Button>
            <Button type="submit" size="sm" className="text-xs font-bold h-9">
              Update Password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const PerformanceDialog = ({ isOpen, onClose, employee }) => {
  const dispatch = useDispatch();
  const { format: formatCurrency } = useCurrencyFormatter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && employee?.id) {
      setLoading(true);
      dispatch(getEmployeePerformance(employee.id))
        .unwrap()
        .then((res) => setStats(res))
        .catch(() => setStats(null))
        .finally(() => setLoading(false));
    }
  }, [isOpen, employee?.id, dispatch]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader className="pb-3 border-b border-border/60">
          <DialogTitle className="text-base font-bold">
            Cashier Performance: {employee?.fullName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-secondary/30 border border-border/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Total Orders Billed
              </span>
              <span className="text-xl font-black font-mono text-foreground mt-0.5 block">
                {stats?.totalOrders || 0}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-secondary/30 border border-border/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Gross Sales Settled
              </span>
              <span className="text-xl font-black font-mono text-foreground mt-0.5 block">
                {formatCurrency(stats?.totalSales || 0)}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-secondary/30 border border-border/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Shift Assigned Since
            </span>
            <span className="text-xs font-mono text-muted-foreground mt-0.5 block">
              {employee?.createdAt ? formatDateTime(employee.createdAt) : "—"}
            </span>
          </div>

          <DialogFooter className="pt-2 border-t border-border/60">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs h-9">
              Close
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
