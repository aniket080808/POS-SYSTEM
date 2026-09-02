import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllBranchesByStore } from "@/Redux Toolkit/features/branch/branchThunks";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BRANCH_LEVEL_ROLES, canManageEmployee, getRoleDisplayName } from "../../../utils/userRole";
import { Loader2, Save, Check } from "lucide-react";

const getValidationSchema = (isEdit) =>
  Yup.object({
    fullName: Yup.string().required("Full name is required"),
    email: Yup.string()
      .email("Enter a valid email address")
      .required("Email address is required"),
    phone: Yup.string().required("Phone number is required"),
    role: Yup.string().required("Role assignment is required"),
    branchId: Yup.string().when("role", {
      is: (role) => BRANCH_LEVEL_ROLES.includes(role),
      then: (schema) => schema.required("Branch location is required for this role"),
      otherwise: (schema) => schema.notRequired(),
    }),
    password: isEdit
      ? Yup.string().min(6, "Password must be at least 6 characters").notRequired()
      : Yup.string()
          .min(6, "Password must be at least 6 characters")
          .required("Login password is required"),
  });

const getInitialValues = (data, defaultBranchId) => ({
  fullName: data?.fullName || "",
  email: data?.email || "",
  password: data?.password || "",
  phone: data?.phone || "",
  role: data?.role || "",
  branchId: data?.branchId != null
    ? String(data.branchId)
    : data?.branch?.id != null
    ? String(data.branch.id)
    : defaultBranchId != null
    ? String(defaultBranchId)
    : "",
});

const EmployeeForm = ({ initialData, onSubmit, roles, defaultBranchId, onCancel }) => {
  const dispatch = useDispatch();
  const { branch, branches = [] } = useSelector((state) => state.branch || {});
  const { store } = useSelector((state) => state.store || {});
  const { userProfile, user: userFromUserSlice } = useSelector((state) => state.user || {});
  const { user: authUser } = useSelector((state) => state.auth || {});

  const currentRole = userProfile?.role || userFromUserSlice?.role || authUser?.role || "ROLE_STORE_ADMIN";
  const isEdit = Boolean(initialData && initialData.id);

  const activeStoreId = store?.id || userProfile?.storeId || userProfile?.store?.id || branch?.storeId || userProfile?.branch?.storeId;

  const effectiveBranches = useMemo(() => {
    if (branches && branches.length > 0) return branches;
    if (branch?.id) return [branch];
    if (userProfile?.branch?.id) return [userProfile.branch];
    if (initialData?.branch) return [initialData.branch];
    return [];
  }, [branches, branch, userProfile?.branch, initialData?.branch]);

  const availableRoles = useMemo(() => {
    if (!roles || !Array.isArray(roles)) return [];
    const normalized = roles
      .map((r) => {
        if (typeof r === "string") {
          return { value: r, label: getRoleDisplayName(r) };
        }
        if (r && typeof r === "object") {
          const val = r.value || r.id || r.role;
          return {
            value: val,
            label: r.label || r.name || getRoleDisplayName(val),
          };
        }
        return null;
      })
      .filter((r) => Boolean(r && r.value));

    if (!currentRole) return normalized;
    const filtered = normalized.filter((r) => canManageEmployee(currentRole, r.value));
    return filtered.length > 0 ? filtered : normalized;
  }, [roles, currentRole]);

  useEffect(() => {
    if (activeStoreId && branches.length === 0) {
      const jwt = localStorage.getItem("jwt");
      if (jwt) dispatch(getAllBranchesByStore({ storeId: activeStoreId, jwt }));
    }
  }, [dispatch, activeStoreId, branches.length]);

  const formik = useFormik({
    initialValues: getInitialValues(initialData, defaultBranchId),
    validationSchema: getValidationSchema(isEdit),
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = { ...values };
        if (!BRANCH_LEVEL_ROLES.includes(payload.role)) {
          delete payload.branchId;
        }
        if (isEdit && !payload.password) {
          delete payload.password;
        }
        await onSubmit(payload);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const showBranchSelect = BRANCH_LEVEL_ROLES.includes(formik.values.role);

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="emp-name" className="text-sm font-semibold text-foreground">
          Staff Member Full Name *
        </Label>
        <Input
          id="emp-name"
          name="fullName"
          placeholder="e.g. Rahul Sharma"
          value={formik.values.fullName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`text-xs h-10 ${formik.touched.fullName && formik.errors.fullName ? "border-destructive" : ""}`}
        />
        {formik.touched.fullName && formik.errors.fullName && (
          <div className="text-destructive text-xs font-semibold mt-1">{formik.errors.fullName}</div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="emp-email" className="text-sm font-semibold text-foreground">
            Work Email Address *
          </Label>
          <Input
            id="emp-email"
            name="email"
            type="email"
            placeholder="cashier@store.com"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`text-xs h-10 ${formik.touched.email && formik.errors.email ? "border-destructive" : ""}`}
          />
          {formik.touched.email && formik.errors.email && (
            <div className="text-destructive text-xs font-semibold mt-1">{formik.errors.email}</div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="emp-phone" className="text-sm font-semibold text-foreground">
            Contact Mobile Number *
          </Label>
          <Input
            id="emp-phone"
            name="phone"
            placeholder="+91 9876543210"
            value={formik.values.phone}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`text-xs h-10 font-mono ${formik.touched.phone && formik.errors.phone ? "border-destructive" : ""}`}
          />
          {formik.touched.phone && formik.errors.phone && (
            <div className="text-destructive text-xs font-semibold mt-1">{formik.errors.phone}</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="emp-role" className="text-sm font-semibold text-foreground">
            Role & Security Clearance *
          </Label>
          <Select
            value={formik.values.role}
            onValueChange={(val) => formik.setFieldValue("role", val)}
          >
            <SelectTrigger id="emp-role" className="text-xs h-10">
              <SelectValue placeholder="Select Staff Role" />
            </SelectTrigger>
            <SelectContent>
              {availableRoles.map((r, idx) => (
                <SelectItem key={r.value ? String(r.value) : `role-${idx}`} value={String(r.value)}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formik.touched.role && formik.errors.role && (
            <div className="text-destructive text-xs font-semibold mt-1">{formik.errors.role}</div>
          )}
        </div>

        {showBranchSelect && (
          <div className="space-y-1.5">
            <Label htmlFor="emp-branch" className="text-sm font-semibold text-foreground">
              Workstation Branch *
            </Label>
            <Select
              value={formik.values.branchId}
              onValueChange={(val) => formik.setFieldValue("branchId", val)}
            >
              <SelectTrigger id="emp-branch" className="text-xs h-10">
                <SelectValue placeholder="Assign Branch Location" />
              </SelectTrigger>
              <SelectContent>
                {effectiveBranches.map((b, idx) => (
                  <SelectItem key={b.id ? String(b.id) : `branch-${idx}`} value={String(b.id)}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.touched.branchId && formik.errors.branchId && (
              <div className="text-destructive text-xs font-semibold mt-1">{formik.errors.branchId}</div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="emp-password" className="text-sm font-semibold text-foreground">
          {isEdit ? "New Password (Leave blank to keep existing)" : "Terminal Password *"}
        </Label>
        <Input
          id="emp-password"
          name="password"
          type="password"
          placeholder="At least 6 characters"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`text-xs h-10 ${formik.touched.password && formik.errors.password ? "border-destructive" : ""}`}
        />
        {formik.touched.password && formik.errors.password && (
          <div className="text-destructive text-xs font-semibold mt-1">{formik.errors.password}</div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-border/60">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="text-xs h-10">
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={formik.isSubmitting}
          className="text-xs font-bold h-10 gap-1.5"
        >
          {formik.isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          {isEdit ? "Save Profile Changes" : "Create Staff Account"}
        </Button>
      </div>
    </form>
  );
};

export default EmployeeForm;