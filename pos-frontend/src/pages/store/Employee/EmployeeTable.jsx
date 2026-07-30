import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

const EmployeeTable = ({ employees, onEdit, onDelete, showBranchColumn = false }) => {
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
          {employeeList.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="font-medium">{employee.fullName}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{employee.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{employee.phone}</span>
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(employee)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onDelete(employee.id);
                    toast.success("Employee deleted successfully!");
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EmployeeTable;