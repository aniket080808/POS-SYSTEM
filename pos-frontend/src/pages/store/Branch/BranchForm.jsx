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

const BranchForm = ({ initialValues, onSubmit, onCancel, isEditing }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.branch);
  const { store } = useSelector((state) => state.store);
  const { employees } = useSelector((state) => state.employee);

  // Fetch employees with branch-level roles (Branch Manager + Branch Admin) for the manager dropdown
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

  // Filter to only branch-level roles for manager selection
  const managerOptions = React.useMemo(() => {
    const base = Array.isArray(employees) ? employees : [];
    const branchRoles = base.filter(
      (e) =>
        e.role === "ROLE_BRANCH_MANAGER" ||
        e.role === "ROLE_BRANCH_ADMIN"
    );
    // If editing and the currently assigned manager is NOT in the list
    // (e.g. their role changed), still include them for this edit session.
    if (initialValues?.manager) {
      const alreadyIncluded = branchRoles.some((e) => e.fullName === initialValues.manager);
      if (!alreadyIncluded) {
        return [...branchRoles, { id: null, fullName: initialValues.manager, email: "" }];
      }
    }
    return branchRoles;
  }, [employees, initialValues?.manager]);

  const validationSchema = Yup.object({
    name: Yup.string().required("Branch Name is required"),
    address: Yup.string().required("Address is required"),
    // Manager is optional — can be assigned later via Edit Branch
    manager: Yup.string().notRequired(),
    // Phone is optional — can be added/updated later via Edit Branch
    phone: Yup.string().notRequired(),
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

  return (
    <Formik
      initialValues={initialValues || { name: "", address: "", manager: "", phone: "" }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ isSubmitting, setFieldValue, values }) => {
        const selectedEmployee = managerOptions.find((e) => e.fullName === values.manager);

        React.useEffect(() => {
          if (selectedEmployee?.phone) {
            setFieldValue("phone", selectedEmployee.phone);
          }
        }, [selectedEmployee, setFieldValue]);

        return (
          <Form className="space-y-4 py-2 pr-2">
            <div className="space-y-2">
              <Label htmlFor="name">Branch Name</Label>
              <Field
                as={Input}
                id="name"
                name="name"
                placeholder="Enter branch name"
              />
              <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Field
                as={Input}
                id="address"
                name="address"
                placeholder="Enter branch address"
              />
              <ErrorMessage name="address" component="div" className="text-red-500 text-sm" />
            </div>

            <div className="space-y-2">
              <Label>Manager (optional)</Label>
              <Select
                value={values.manager}
                onValueChange={(value) => setFieldValue("manager", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select manager (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {managerOptions.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">No branch-level employees found. Create one first, then assign as manager here.</div>
                  ) : (
                    managerOptions.map((emp) => (
                      <SelectItem key={emp.id} value={emp.fullName}>
                        <div className="flex flex-col">
                          <span>{emp.fullName}</span>
                          <span className="text-xs text-gray-500">{emp.email}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <ErrorMessage name="manager" component="div" className="text-red-500 text-sm" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (optional)</Label>
              <Field
                as={Input}
                id="phone"
                name="phone"
                placeholder="Enter phone number"
                disabled={!!selectedEmployee}
              />
              <ErrorMessage name="phone" component="div" className="text-red-500 text-sm" />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || loading}>
                {isSubmitting || loading ? (isEditing ? "Updating..." : "Adding...") : (isEditing ? "Update Branch" : "Add Branch")}
              </Button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default BranchForm;