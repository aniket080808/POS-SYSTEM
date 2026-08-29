import React, { useMemo, useEffect } from "react";
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

const BranchForm = ({ initialValues, onSubmit, onCancel, isEditing }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.branch);
  const { store } = useSelector((state) => state.store);
  const { employees } = useSelector((state) => state.employee);

  useEffect(() => {
    if (store?.id) {
      dispatch(
        findStoreEmployees({
          storeId: store.id,
          token: localStorage.getItem("jwt"),
        })
      );
    }
  }, [dispatch, store?.id]);

  const managerOptions = useMemo(() => {
    const base = Array.isArray(employees) ? employees : [];
    const branchManagers = base.filter((e) => e.role === "ROLE_BRANCH_MANAGER");

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
      .test("valid-phone", "Please enter a valid phone number (10-15 digits)", function (value) {
        if (!value || value.trim() === "") return true;
        return /^[+]?[0-9]{10,15}$/.test(value.trim());
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
      {({ isSubmitting, setFieldValue, values }) => {
        return (
          <Form className="space-y-4 py-2 pr-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs font-bold text-foreground">
                Branch Outlet Name <span className="text-red-500">*</span>
              </Label>
              <Field
                as={Input}
                id="name"
                name="name"
                placeholder="e.g. Bandra West Outlet"
                className="h-10 text-xs"
              />
              <ErrorMessage name="name" component="div" className="text-red-500 text-[11px]" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="address" className="text-xs font-bold text-foreground">
                Physical Address <span className="text-red-500">*</span>
              </Label>
              <Field
                as={Input}
                id="address"
                name="address"
                placeholder="e.g. Linking Road, Bandra West, Mumbai"
                className="h-10 text-xs"
              />
              <ErrorMessage name="address" component="div" className="text-red-500 text-[11px]" />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-foreground">Assigned Branch Manager (Optional)</Label>
              <Select
                value={values.manager || "NONE_SELECTED"}
                onValueChange={(value) => {
                  const val = value === "NONE_SELECTED" ? "" : value;
                  setFieldValue("manager", val);
                  const emp = managerOptions.find((e) => e.fullName === val);
                  if (emp?.phone) {
                    setFieldValue("phone", emp.phone);
                  }
                }}
              >
                <SelectTrigger className="h-10 text-xs">
                  <SelectValue placeholder="Select branch manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE_SELECTED" className="text-xs">
                    <span className="text-muted-foreground italic">None (Unassigned)</span>
                  </SelectItem>
                  {managerOptions.map((emp) => (
                    <SelectItem key={emp.id || emp.fullName} value={emp.fullName} className="text-xs">
                      <div className="flex flex-col">
                        <span className="font-semibold">{emp.fullName}</span>
                        {emp.email && <span className="text-[10px] text-muted-foreground font-mono">{emp.email}</span>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ErrorMessage name="manager" component="div" className="text-red-500 text-[11px]" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone" className="text-xs font-bold text-foreground">
                Contact Phone (Optional)
              </Label>
              <Field
                as={Input}
                id="phone"
                name="phone"
                placeholder="e.g. 9876543210"
                className="h-10 text-xs font-mono"
              />
              <ErrorMessage name="phone" component="div" className="text-red-500 text-[11px]" />
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-border/60">
              <Button type="button" variant="outline" onClick={onCancel} className="h-10 text-xs">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || loading}
                className="h-10 text-xs bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-xs"
              >
                {isSubmitting || loading
                  ? isEditing
                    ? "Updating..."
                    : "Adding..."
                  : isEditing
                  ? "Update Outlet"
                  : "Create Outlet"}
              </Button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default BranchForm;