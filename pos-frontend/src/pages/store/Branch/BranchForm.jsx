import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { createBranch, updateBranch } from "@/Redux Toolkit/features/branch/branchThunks";
import { findStoreEmployees } from "@/Redux Toolkit/features/employee/employeeThunks";
import { Loader2, Save } from "lucide-react";

const BranchForm = ({ initialValues, onSubmit, onCancel, isEditing }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.branch || {});
  const { store } = useSelector((state) => state.store || {});
  const { employees } = useSelector((state) => state.employee || {});

  // Fetch employees with branch-level roles for the manager dropdown
  React.useEffect(() => {
    if (store?.id) {
      dispatch(
        findStoreEmployees({
          storeId: store.id,
          token: localStorage.getItem("jwt"),
        })
      );
    }
  }, [dispatch, store?.id]);

  // Filter to only Branch Managers belonging to this branch or unassigned
  const managerOptions = React.useMemo(() => {
    const base = Array.isArray(employees) ? employees : [];
    
    // 1. Only employees with role ROLE_BRANCH_MANAGER
    const branchManagers = base.filter((e) => e.role === "ROLE_BRANCH_MANAGER");

    // 2. Filter by branch
    const branchSpecificManagers = branchManagers.filter((e) => {
      const empBranchId = e.branchId ?? e.branch?.id;
      if (initialValues?.id) {
        return (
          (empBranchId != null && String(empBranchId) === String(initialValues.id)) ||
          !empBranchId
        );
      }
      return !empBranchId;
    });

    // 3. Keep current manager in options if editing
    if (initialValues?.manager) {
      const alreadyIncluded = branchSpecificManagers.some(
        (e) => e.fullName === initialValues.manager
      );
      if (!alreadyIncluded) {
        const existingEmp = base.find((e) => e.fullName === initialValues.manager);
        return [
          ...branchSpecificManagers,
          existingEmp || { id: null, fullName: initialValues.manager, email: "" },
        ];
      }
    }
    return branchSpecificManagers;
  }, [employees, initialValues?.id, initialValues?.manager]);

  const validationSchema = Yup.object({
    name: Yup.string().trim().required("Branch Name is required"),
    address: Yup.string().trim().required("Address is required"),
    manager: Yup.string().notRequired(),
    phone: Yup.string()
      .nullable()
      .notRequired()
      .test('valid-phone', 'Please enter a valid phone number (10-15 digits)', function(value) {
        if (!value || value.trim() === '') return true;
        return /^[\+]?[0-9]{10,15}$/.test(value.trim());
      }),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const jwt = localStorage.getItem("jwt");
      if (!store?.id) {
        toast({
          title: "Error",
          description: "Store information or authentication JWT missing!",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      const branchData = {
        ...values,
        storeId: store.id,
      };

      if (isEditing) {
        await dispatch(updateBranch({ id: initialValues.id, dto: branchData, jwt })).unwrap();
        toast({ title: "Success", description: "Branch updated successfully" });
      } else {
        await dispatch(createBranch({ dto: branchData, jwt })).unwrap();
        toast({ title: "Success", description: "Branch created successfully" });
      }
      onSubmit();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditing ? "update" : "create"} branch`,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const defaultValues = {
    name: initialValues?.name || "",
    address: initialValues?.address || "",
    manager: initialValues?.manager || "",
    phone: initialValues?.phone || "",
  };

  return (
    <Formik
      initialValues={defaultValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ isSubmitting, setFieldValue, values, errors, touched }) => {
        const selectedEmployee = managerOptions.find((e) => e.fullName === values.manager);

        React.useEffect(() => {
          if (selectedEmployee?.phone) {
            setFieldValue("phone", selectedEmployee.phone);
          }
        }, [selectedEmployee, setFieldValue]);

        return (
          <Form className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold text-foreground">Branch Name *</Label>
              <Field
                as={Input}
                id="name"
                name="name"
                placeholder="e.g. Downtown Flagship Store"
                className={`h-9 rounded-xl text-xs ${errors.name && touched.name ? "border-destructive" : ""}`}
              />
              <ErrorMessage name="name" component="div" className="text-destructive text-[11px] font-medium mt-1" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs font-semibold text-foreground">Physical Address *</Label>
              <Field
                as={Input}
                id="address"
                name="address"
                placeholder="Enter complete branch street address"
                className={`h-9 rounded-xl text-xs ${errors.address && touched.address ? "border-destructive" : ""}`}
              />
              <ErrorMessage name="address" component="div" className="text-destructive text-[11px] font-medium mt-1" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Assigned Branch Manager (Optional)</Label>
              <Select
                value={values.manager || "NONE_SELECTED"}
                onValueChange={(value) => {
                  setFieldValue("manager", value === "NONE_SELECTED" ? "" : value);
                }}
              >
                <SelectTrigger className="h-9 rounded-xl text-xs">
                  <SelectValue placeholder="Select manager (optional)" />
                </SelectTrigger>
                <SelectContent className="rounded-xl text-xs">
                  <SelectItem value="NONE_SELECTED">
                    <span className="text-muted-foreground italic">None (Unassigned)</span>
                  </SelectItem>
                  {managerOptions.length === 0 ? (
                    <div className="p-2 text-xs text-muted-foreground">No available branch managers found.</div>
                  ) : (
                    managerOptions.map((emp) => (
                      <SelectItem key={emp.id || emp.fullName} value={emp.fullName}>
                        <div className="flex flex-col text-left">
                          <span className="font-medium text-foreground">{emp.fullName}</span>
                          {emp.email && <span className="text-[10px] text-muted-foreground font-mono">{emp.email}</span>}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <ErrorMessage name="manager" component="div" className="text-destructive text-[11px] font-medium mt-1" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold text-foreground">Contact Phone (Optional)</Label>
              <Field
                as={Input}
                id="phone"
                name="phone"
                placeholder="+91 98765 43210"
                disabled={!!selectedEmployee}
                className="h-9 rounded-xl text-xs font-mono"
              />
              <ErrorMessage name="phone" component="div" className="text-destructive text-[11px] font-medium mt-1" />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border/60">
              <Button type="button" variant="outline" size="sm" onClick={onCancel} className="rounded-xl text-xs font-semibold h-9">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || loading} size="sm" className="rounded-xl text-xs font-semibold h-9 gap-1.5">
                {isSubmitting || loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{isEditing ? "Saving..." : "Creating..."}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>{isEditing ? "Save Changes" : "Create Branch"}</span>
                  </>
                )}
              </Button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default BranchForm;