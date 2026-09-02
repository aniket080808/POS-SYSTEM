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
import { Loader2, Check } from "lucide-react";

const branchValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Branch name is required")
    .min(2, "Must be at least 2 characters"),
  address: Yup.string()
    .required("Address is required")
    .min(3, "Must be at least 3 characters"),
  phone: Yup.string()
    .required("Phone number is required")
    .matches(/^[0-9+ -]{7,15}$/, "Enter a valid phone number"),
  manager: Yup.string().nullable(),
});

const BranchForm = ({ initialValues, onSubmit, onCancel, isEditing = false }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.branch);
  const { store } = useSelector((state) => state.store);
  const { employees = [] } = useSelector((state) => state.employee);

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

  const managerOptions = React.useMemo(() => {
    const base = Array.isArray(employees) ? employees : [];
    const branchManagers = base.filter((e) => e.role === "ROLE_BRANCH_MANAGER");

    return branchManagers.filter((e) => {
      const empBranchId = e.branchId ?? e.branch?.id;
      if (initialValues?.id) {
        return (
          (empBranchId != null && String(empBranchId) === String(initialValues.id)) ||
          !empBranchId
        );
      }
      return !empBranchId;
    });
  }, [employees, initialValues?.id]);

  const defaultValues = {
    name: initialValues?.name || "",
    address: initialValues?.address || "",
    phone: initialValues?.phone || "",
    manager: initialValues?.manager || "",
  };

  const handleFormSubmit = async (values, { setSubmitting }) => {
    try {
      const jwt = localStorage.getItem("jwt");
      const payloadDto = {
        name: values.name.trim(),
        address: values.address.trim(),
        phone: values.phone.trim(),
        manager: values.manager ? values.manager.trim() : null,
      };

      if (isEditing && initialValues?.id) {
        await dispatch(
          updateBranch({
            id: initialValues.id,
            dto: payloadDto,
            jwt,
          })
        ).unwrap();
        toast({ title: "Branch Updated", description: `Branch "${values.name}" updated successfully.` });
      } else {
        await dispatch(
          createBranch({
            dto: payloadDto,
            jwt,
          })
        ).unwrap();
        toast({ title: "Branch Created", description: `Branch "${values.name}" created successfully.` });
      }
      onSubmit();
    } catch (err) {
      const msg = typeof err === "string" ? err : err?.message || "Failed to save branch.";
      toast({
        title: "Action Failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={defaultValues}
      validationSchema={branchValidationSchema}
      onSubmit={handleFormSubmit}
      enableReinitialize
    >
      {({ isSubmitting, errors, touched, values, setFieldValue }) => (
        <Form className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="branch-name" className="text-sm font-semibold text-foreground">
              Branch Name *
            </Label>
            <Field
              as={Input}
              id="branch-name"
              name="name"
              placeholder="e.g. Downtown Outlet"
              className={`text-xs h-10 ${errors.name && touched.name ? "border-destructive" : ""}`}
            />
            <ErrorMessage name="name" component="div" className="text-destructive text-xs font-semibold mt-1" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="branch-address" className="text-sm font-semibold text-foreground">
              Physical Street Address *
            </Label>
            <Field
              as={Input}
              id="branch-address"
              name="address"
              placeholder="e.g. 42 MG Road, Sector 4"
              className={`text-xs h-10 ${errors.address && touched.address ? "border-destructive" : ""}`}
            />
            <ErrorMessage name="address" component="div" className="text-destructive text-xs font-semibold mt-1" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="branch-phone" className="text-sm font-semibold text-foreground">
                Branch Phone Line *
              </Label>
              <Field
                as={Input}
                id="branch-phone"
                name="phone"
                placeholder="+91 9876543210"
                className={`text-xs h-10 font-mono ${errors.phone && touched.phone ? "border-destructive" : ""}`}
              />
              <ErrorMessage name="phone" component="div" className="text-destructive text-xs font-semibold mt-1" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="branch-manager" className="text-sm font-semibold text-foreground">
                Assigned Branch Manager
              </Label>
              <Select
                value={values.manager || "none"}
                onValueChange={(val) => setFieldValue("manager", val === "none" ? "" : val)}
              >
                <SelectTrigger id="branch-manager" className="text-xs h-10">
                  <SelectValue placeholder="Assign Branch Manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Unassigned --</SelectItem>
                  {managerOptions.map((mgr) => (
                    <SelectItem key={mgr.id} value={mgr.fullName}>
                      {mgr.fullName} ({mgr.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="text-xs h-10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || loading}
              className="text-xs font-bold h-10 gap-1.5"
            >
              {isSubmitting || loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {isEditing ? "Save Changes" : "Create Branch"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default BranchForm;