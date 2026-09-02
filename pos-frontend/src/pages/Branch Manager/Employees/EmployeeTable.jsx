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
import { Edit, UserX, UserCheck, Key, BarChart, Trash2, Phone, Loader2 } from "lucide-react";
import { getRoleDisplayName, canManageEmployee } from "@/utils/userRole";
import { formatDateTime } from "@/utils/formateDate";

const EmployeeTable = ({
  employees = [],
  loading,
  currentUserRole,
  currentUserId,
  handleToggleAccess,
  handleDelete,
  openResetPasswordDialog,
  openPerformanceDialog,
  openEditDialog,
}) => {
  return (
    <div className="border border-border rounded-2xl bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Staff Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Contact Info</TableHead>
            <TableHead>Access Status</TableHead>
            <TableHead>Assigned Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && (!employees || employees.length === 0) ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10 text-xs font-semibold text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin inline-block mr-2 text-[#B8860B]" />
                Loading branch staff roster...
              </TableCell>
            </TableRow>
          ) : employees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10 text-xs font-semibold text-muted-foreground">
                No staff members found matching criteria.
              </TableCell>
            </TableRow>
          ) : (
            employees.map((emp) => {
              const isEnabled = emp.enabled !== false;
              const canManage = canManageEmployee(currentUserRole, emp.role);
              const isSelf = currentUserId && emp.id === currentUserId;

              return (
                <TableRow key={emp.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-xs text-foreground">
                        {emp.fullName?.[0] || "E"}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                          {emp.fullName}
                          {isSelf && (
                            <span className="text-[10px] text-muted-foreground font-normal">(You)</span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          ID: #{emp.id}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary" className="text-[10px] font-bold">
                      {getRoleDisplayName(emp.role)}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-0.5 text-xs">
                      <div className="text-foreground font-medium">{emp.email}</div>
                      {emp.phone && (
                        <div className="text-muted-foreground text-[11px] font-mono flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#B8860B]" />
                          {emp.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant={isEnabled ? "active" : "error"} className="text-[10px] font-bold">
                      {isEnabled ? "Active Shift" : "Access Revoked"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {emp.createdAt ? formatDateTime(emp.createdAt) : "—"}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-1">
                      {emp.role === "ROLE_BRANCH_CASHIER" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                          onClick={() => openPerformanceDialog(emp)}
                          title="View Sales Performance"
                        >
                          <BarChart className="h-3.5 w-3.5" />
                        </Button>
                      )}

                      {canManage && !isSelf && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                            onClick={() => openEditDialog(emp)}
                            title="Edit Staff Info"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                            onClick={() => openResetPasswordDialog(emp)}
                            title="Reset Terminal Password"
                          >
                            <Key className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 rounded-lg ${
                              isEnabled
                                ? "text-muted-foreground hover:text-destructive"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                            onClick={() => handleToggleAccess(emp)}
                            title={isEnabled ? "Revoke Access" : "Grant Access"}
                          >
                            {isEnabled ? (
                              <UserX className="h-3.5 w-3.5" />
                            ) : (
                              <UserCheck className="h-3.5 w-3.5" />
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(emp)}
                            title="Delete Staff Account"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default EmployeeTable;