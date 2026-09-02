import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Mail, Phone, MapPin } from "lucide-react";
import { canManageEmployee } from "../../../utils/userRole";

const EmployeeTable = ({
  employees = [],
  onEdit,
  onDelete,
  currentUserRole,
  currentUserId,
  showBranchColumn = false,
  storePhone = "",
}) => {
  const employeeList = Array.isArray(employees) ? employees : [];

  if (employeeList.length === 0) {
    return (
      <div className="text-center py-8 text-xs font-semibold text-muted-foreground">
        No staff members assigned to this category.
      </div>
    );
  }

  const formatRole = (role) => {
    if (!role) return "";
    return role.replace("ROLE_", "").replace(/_/g, " ");
  };

  return (
    <div className="border border-border rounded-2xl bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Staff Member</TableHead>
            <TableHead>Contact Information</TableHead>
            <TableHead>System Role</TableHead>
            {showBranchColumn && <TableHead>Assigned Branch</TableHead>}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employeeList.map((employee) => {
            const phone =
              employee.phone ||
              (employee.role === "ROLE_STORE_ADMIN" ? storePhone : "") ||
              (storePhone && !employee.phone ? storePhone : "");
            const isSelf = Boolean(currentUserId && employee.id === currentUserId);
            const canManage = !isSelf && canManageEmployee(currentUserRole, employee.role);
            const canDelete =
              canManage && (currentUserRole === "ROLE_STORE_ADMIN" || currentUserRole === "ROLE_ADMIN");

            return (
              <TableRow key={employee.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{employee.fullName}</span>
                    {isSelf && (
                      <Badge variant="outline" className="text-[10px] font-mono uppercase px-1.5 py-0">
                        Current Session
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{employee.email}</span>
                    </div>
                    {phone && (
                      <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{phone}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize text-[11px] font-bold">
                    {formatRole(employee.role)}
                  </Badge>
                </TableCell>
                {showBranchColumn && (
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-[#B8860B]" />
                      <span>{employee.branch?.name || "—"}</span>
                    </div>
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <div className="flex justify-end items-center gap-1">
                    {canManage ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => onEdit(employee)}
                          title="Edit Staff Member"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10"
                            onClick={() => onDelete(employee)}
                            title="Delete Staff Member"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground font-mono pr-2">
                        {isSelf ? "Self" : "View"}
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