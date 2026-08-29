import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Mail, Phone, MapPin } from "lucide-react";
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
    return <div className="text-center py-8 text-gray-500">No employees found.</div>;
  }

  // Helper to render a readable role label
  const formatRole = (role) => {
    if (!role) return "";
    return role.replace("ROLE_", "").replace(/_/g, " ");
  };

  // Badge variant based on role
  const roleBadgeVariant = (role) => {
    if (role === "ROLE_STORE_ADMIN") return "default";
    if (role === "ROLE_STORE_MANAGER") return "secondary";
    if (role === "ROLE_BRANCH_ADMIN") return "default";
    if (role === "ROLE_BRANCH_MANAGER") return "secondary";
    if (role === "ROLE_BRANCH_CASHIER") return "outline";
    return "outline";
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Role</TableHead>
            {showBranchColumn && <TableHead>Branch</TableHead>}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employeeList.map((employee) => {
            const phone = employee.phone || (employee.role === "ROLE_STORE_ADMIN" ? storePhone : "") || (storePhone && !employee.phone ? storePhone : "");
            const isSelf = Boolean(currentUserId && employee.id === currentUserId);
            const canManage = !isSelf && canManageEmployee(currentUserRole, employee.role);
            const canDelete = canManage && (currentUserRole === "ROLE_STORE_ADMIN" || currentUserRole === "ROLE_ADMIN");

            return (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span>{employee.fullName}</span>
                    {isSelf && (
                      <Badge variant="outline" className="text-[10px] bg-muted font-normal">
                        You
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{employee.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{phone || "—"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={roleBadgeVariant(employee.role)} className="capitalize">
                    {formatRole(employee.role)}
                  </Badge>
                </TableCell>
                {showBranchColumn && (
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
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
                          size="sm"
                          onClick={() => onEdit(employee)}
                          title="Edit Employee"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(employee)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            title="Delete Employee"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground italic pr-2">
                        {isSelf ? "Self" : "—"}
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