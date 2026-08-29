import React from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, UserX, UserCheck, Key, BarChart, Trash2, Phone } from "lucide-react";
import { getRoleDisplayName, canManageEmployee } from "@/utils/userRole";
import { formatDateTime } from "@/utils/formateDate";

const EmployeeTable = ({
  employees,
  loading,
  currentUserRole,
  currentUserId,
  handleToggleAccess,
  handleDelete,
  openResetPasswordDialog,
  openPerformanceDialog,
  openEditDialog,
}) => {
  const isBranchAdmin = currentUserRole === "ROLE_BRANCH_ADMIN" || currentUserRole === "ROLE_STORE_ADMIN";

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/40">
          <TableHead className="font-bold">Name</TableHead>
          <TableHead className="font-bold">Role</TableHead>
          <TableHead className="font-bold">Email & Phone</TableHead>
          <TableHead className="font-bold">Login Access</TableHead>
          <TableHead className="font-bold">Assigned Since</TableHead>
          <TableHead className="text-right font-bold">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading && (!employees || employees.length === 0) ? (
          [1, 2, 3, 4].map((n) => (
            <TableRow key={n} className="animate-pulse">
              <TableCell>
                <div className="h-4 w-32 bg-muted rounded" />
              </TableCell>
              <TableCell>
                <div className="h-5 w-24 bg-muted rounded-full" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-44 bg-muted rounded" />
              </TableCell>
              <TableCell>
                <div className="h-5 w-16 bg-muted rounded-full" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-28 bg-muted rounded" />
              </TableCell>
              <TableCell className="text-right">
                <div className="h-8 w-24 bg-muted rounded ml-auto" />
              </TableCell>
            </TableRow>
          ))
        ) : employees?.length > 0 ? (
          employees.map((employee) => {
            const isEnabled = employee.enabled !== false;
            const isSelf = currentUserId && employee.id === currentUserId;
            const canManage =
              !isSelf && canManageEmployee(currentUserRole, employee.role);

            return (
              <TableRow key={employee.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-semibold text-foreground">
                  {employee.fullName}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-semibold text-xs border-border/80">
                    {getRoleDisplayName(employee.role)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    <p className="text-xs text-foreground font-medium">{employee.email}</p>
                    {employee.phone && (
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        {employee.phone}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      isEnabled
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                    }
                    variant="secondary"
                  >
                    {isEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {employee.createdAt ? formatDateTime(employee.createdAt) : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center gap-1">
                    {canManage ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => handleToggleAccess(employee)}
                          title={isEnabled ? "Disable Access" : "Enable Access"}
                        >
                          {isEnabled ? (
                            <UserX className="h-4 w-4 text-muted-foreground hover:text-red-600" />
                          ) : (
                            <UserCheck className="h-4 w-4 text-emerald-600 hover:text-emerald-700" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => openResetPasswordDialog(employee)}
                          title="Reset Password"
                        >
                          <Key className="h-4 w-4 text-muted-foreground hover:text-amber-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => openPerformanceDialog(employee)}
                          title="View Performance"
                        >
                          <BarChart className="h-4 w-4 text-muted-foreground hover:text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => openEditDialog(employee)}
                          title="Edit Employee"
                        >
                          <Edit className="h-4 w-4 text-muted-foreground hover:text-emerald-600" />
                        </Button>
                        {isBranchAdmin && handleDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-500/10"
                            onClick={() => handleDelete(employee)}
                            title="Delete Employee"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground font-medium italic pr-2">
                        {isSelf ? "You" : "—"}
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
              No employees found matching your criteria
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default EmployeeTable;