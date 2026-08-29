import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Mail, Phone, MapPin, UserCheck } from "lucide-react";
import { canManageEmployee } from "../../../utils/userRole";

const EmployeeTable = ({
  employees,
  onEdit,
  onDelete,
  currentUserRole,
  currentUserId,
  showBranchColumn = false,
  storePhone = "",
}) => {
  const employeeList = Array.isArray(employees) ? employees : [];

  if (employeeList.length === 0) {
    return <div className="text-center py-8 text-xs text-muted-foreground">No employees found.</div>;
  }

  // Helper to render a readable role label
  const formatRole = (role) => {
    if (!role) return "";
    return role.replace("ROLE_", "").replace(/_/g, " ");
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case "ROLE_STORE_ADMIN":
        return "bg-primary/10 text-primary border-primary/20";
      case "ROLE_STORE_MANAGER":
        return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20";
      case "ROLE_BRANCH_ADMIN":
        return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
      case "ROLE_BRANCH_MANAGER":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "ROLE_BRANCH_CASHIER":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border/60">
            <TableHead className="text-xs font-bold text-foreground py-3.5 pl-6">Employee</TableHead>
            <TableHead className="text-xs font-bold text-foreground py-3.5">Contact Details</TableHead>
            <TableHead className="text-xs font-bold text-foreground py-3.5">Assigned Role</TableHead>
            {showBranchColumn && <TableHead className="text-xs font-bold text-foreground py-3.5">Branch</TableHead>}
            <TableHead className="text-xs font-bold text-foreground py-3.5 pr-6 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employeeList.map((employee) => {
            const phone = employee.phone || (employee.role === "ROLE_STORE_ADMIN" ? storePhone : "") || (storePhone && !employee.phone ? storePhone : "");
            const isSelf = Boolean(currentUserId && employee.id === currentUserId);
            const canManage = !isSelf && canManageEmployee(currentUserRole, employee.role);
            const canDelete = canManage && (currentUserRole === "ROLE_STORE_ADMIN" || currentUserRole === "ROLE_ADMIN");

            return (
              <TableRow key={employee.id} className="hover:bg-muted/30 transition-colors border-b border-border/40">
                <TableCell className="pl-6 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                      {employee.fullName ? employee.fullName.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-foreground block">{employee.fullName}</span>
                        {isSelf && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-muted font-semibold">
                            You
                          </Badge>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">ID: #{employee.id}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3.5">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                      <span className="truncate">{employee.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
                      <Phone className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                      <span>{phone || "—"}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getRoleBadgeStyle(employee.role)}`}>
                    {formatRole(employee.role)}
                  </span>
                </TableCell>
                {showBranchColumn && (
                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{employee.branch?.name || "—"}</span>
                    </div>
                  </TableCell>
                )}
                <TableCell className="pr-6 py-3.5 text-right">
                  <div className="flex justify-end items-center gap-1.5">
                    {canManage ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary"
                          onClick={() => onEdit(employee)}
                          title="Edit Employee"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                            onClick={() => onDelete(employee)}
                            title="Delete Employee"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </>
                    ) : (
                      <span className="text-[11px] text-muted-foreground italic pr-2">
                        {isSelf ? "Active Session" : "Protected"}
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default EmployeeTable;