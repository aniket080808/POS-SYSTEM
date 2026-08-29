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
import { BRANCH_LEVEL_ROLES, canManageEmployee } from "../../../utils/userRole";

const getValidationSchema = (isEdit) =>
  Yup.object({
    fullName: Yup.string().required("Employee name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    phone: Yup.string().required("Phone number is required"),
    role: Yup.string().required("Role is required"),
    branchId: Yup.string().when("role", {
      is: (role) => BRANCH_LEVEL_ROLES.includes(role),
      then: (schema) => schema.required("Branch is required for branch-level roles"),
      otherwise: (schema) => schema.notRequired(),
    }),
    password: isEdit
      ? Yup.string().min(8, "Password must be at least 8 characters").notRequired()
      : Yup.string()
          .min(8, "Password must be at least 8 characters")
          .required("Password is required"),
  });

const getInitialValues = (data, defaultBranchId) => ({
  fullName: data?.fullName || "",
  email: data?.email || "",
  password: data?.password || "",
  phone: data?.phone || "",
  role: data?.role || "",
  branchId: data?.branchId
    ? String(data.branchId)
    : defaultBranchId
    ? String(defaultBranchId)
    : "",
});

const EmployeeForm = ({ initialData, onSubmit, roles, defaultBranchId }) => {
  const dispatch = useDispatch();
  const { branches, branch } = useSelector((state) => state.branch);
  const { store } = useSelector((state) => state.store);
  const { userProfile } = useSelector((state) => state.user);

  const isEdit = Boolean(initialData && initialData.id);

  // 🔒 Filter roles to only those the current user can manage (defense-in-depth)
  const filteredRoles = useMemo(() => {
    if (!roles || !userProfile?.role) return roles || [];
    return roles.filter((role) => canManageEmployee(userProfile.role, role));
  }, [roles, userProfile?.role]);

  // Active store resolution from multiple potential sources
  const activeStoreId =
    store?.id ||
    userProfile?.store?.id ||
    userProfile?.storeId ||
    userProfile?.branch?.store?.id ||
    branch?.store?.id ||
    branch?.storeId;

  // Fetch branches by store if storeId is known
  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (activeStoreId && jwt) {
      dispatch(
        getAllBranchesByStore({
          storeId: activeStoreId,
          jwt,
        })
      );
    }
  }, [dispatch, activeStoreId]);

  // Consolidate available branches from all state sources
  const availableBranches = useMemo(() => {
    const branchMap = new Map();

    // 1. From branches list in Redux
    (branches || []).forEach((b) => {
      if (b && b.id) {
        branchMap.set(String(b.id), { id: b.id, name: b.name || `Branch #${b.id}` });
      }
    });

    // 2. From active branch in Redux state
    if (branch && branch.id) {
      branchMap.set(String(branch.id), { id: branch.id, name: branch.name || `Branch #${branch.id}` });
    }

    // 3. From user profile branch
    if (userProfile?.branch && userProfile.branch.id) {
      branchMap.set(String(userProfile.branch.id), {
        id: userProfile.branch.id,
        name: userProfile.branch.name || `Branch #${userProfile.branch.id}`,
      });
    } else if (userProfile?.branchId) {
      if (!branchMap.has(String(userProfile.branchId))) {
        branchMap.set(String(userProfile.branchId), {
          id: userProfile.branchId,
          name: userProfile.branchName || branch?.name || `Branch #${userProfile.branchId}`,
        });
      }
    }

    // 4. From initialData branch or explicit defaultBranchId
    if (initialData?.branch && initialData.branch.id) {
      branchMap.set(String(initialData.branch.id), {
        id: initialData.branch.id,
        name: initialData.branch.name || `Branch #${initialData.branch.id}`,
      });
    }
    if (defaultBranchId && !branchMap.has(String(defaultBranchId))) {
      branchMap.set(String(defaultBranchId), {
        id: defaultBranchId,
        name: branch?.name || userProfile?.branch?.name || `Branch #${defaultBranchId}`,
      });
    }

    return Array.from(branchMap.values());
  }, [branches, branch, userProfile, initialData, defaultBranchId]);

  const isBranchUser =
    userProfile?.role === "ROLE_BRANCH_ADMIN" ||
    userProfile?.role === "ROLE_BRANCH_MANAGER";

  // 🔒 Restrict available branches to current branch if caller is branch admin/manager (Bug #2 Prevention)
  const scopedBranches = useMemo(() => {
    if (isBranchUser || defaultBranchId) {
      const bId = defaultBranchId || userProfile?.branchId || branch?.id;
      if (bId) {
        const matching = availableBranches.find((b) => String(b.id) === String(bId));
        return matching
          ? [matching]
          : [{ id: bId, name: branch?.name || userProfile?.branch?.name || `Branch #${bId}` }];
      }
    }
    return availableBranches;
  }, [isBranchUser, defaultBranchId, availableBranches, userProfile, branch]);

  // Determine fallback branch ID if single branch or default provided
  const resolvedDefaultBranchId = useMemo(() => {
    if (defaultBranchId) return String(defaultBranchId);
    if (userProfile?.branchId) return String(userProfile.branchId);
    if (branch?.id) return String(branch.id);
    if (scopedBranches.length === 1) return String(scopedBranches[0].id);
    return "";
  }, [defaultBranchId, userProfile, branch, scopedBranches]);

  const formik = useFormik({
    initialValues: getInitialValues(initialData, resolvedDefaultBranchId),
    validationSchema: getValidationSchema(isEdit),
    onSubmit: (values) => {
      // If role is store-level, don't send branchId
      const payload = { ...values };
      if (!BRANCH_LEVEL_ROLES.includes(values.role)) {
        delete payload.branchId;
      }
      if (isEdit && !payload.password) {
        delete payload.password;
      }
      onSubmit(payload);
    },
  });

  useEffect(() => {
    if (initialData && initialData.id) {
      formik.setValues(getInitialValues(initialData, resolvedDefaultBranchId));
    } else {
      formik.resetForm();
      if (resolvedDefaultBranchId) {
        formik.setFieldValue("branchId", resolvedDefaultBranchId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, resolvedDefaultBranchId]);

  // Auto-set branchId when a branch-level role is selected and there's a default/single branch available
  useEffect(() => {
    if (BRANCH_LEVEL_ROLES.includes(formik.values.role)) {
      if (!formik.values.branchId && resolvedDefaultBranchId) {
        formik.setFieldValue("branchId", resolvedDefaultBranchId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.role, formik.values.branchId, resolvedDefaultBranchId]);

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4 py-2 pr-2">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          value={formik.values.fullName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="Enter employee name"
        />
        {formik.touched.fullName && formik.errors.fullName ? (
          <div className="text-red-500 text-sm">{formik.errors.fullName}</div>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="Enter email address"
        />
        {formik.touched.email && formik.errors.email ? (
          <div className="text-red-500 text-sm">{formik.errors.email}</div>
        ) : null}
      </div>
      {!isEdit && (
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Enter password (min 8 chars)"
          />
          {formik.touched.password && formik.errors.password ? (
            <div className="text-red-500 text-sm">{formik.errors.password}</div>
          ) : null}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          value={formik.values.phone}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="Enter phone number"
        />
        {formik.touched.phone && formik.errors.phone ? (
          <div className="text-red-500 text-sm">{formik.errors.phone}</div>
        ) : null}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select
            value={formik.values.role}
            onValueChange={(value) => {
              formik.setFieldValue("role", value);
              // Clear branchId when a store-level role is selected, or set default if branch-level
              if (!BRANCH_LEVEL_ROLES.includes(value)) {
                formik.setFieldValue("branchId", "");
              } else if (!formik.values.branchId && resolvedDefaultBranchId) {
                formik.setFieldValue("branchId", resolvedDefaultBranchId);
              }
            }}
            onOpenChange={() => formik.setFieldTouched("role", true)}
            className="w-full"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {filteredRoles?.map((role) => (
                <SelectItem key={role} value={role}>
                  {role.replace("ROLE_", "").replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formik.touched.role && formik.errors.role ? (
            <div className="text-red-500 text-sm">{formik.errors.role}</div>
          ) : null}
        </div>
        {BRANCH_LEVEL_ROLES.includes(formik.values.role) && (
          <div className="space-y-2">
            <Label htmlFor="branchId">Branch</Label>
            {scopedBranches && scopedBranches.length > 0 ? (
              <Select
                value={formik.values.branchId}
                onValueChange={(value) => formik.setFieldValue("branchId", value)}
                onOpenChange={() => formik.setFieldTouched("branchId", true)}
                disabled={isBranchUser || scopedBranches.length === 1}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {scopedBranches.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-md">
                No branches found. Please create a branch first before assigning branch-level staff, or select <strong>Store Manager</strong> above.
              </div>
            )}
            {formik.touched.branchId && formik.errors.branchId ? (
              <div className="text-red-500 text-sm">{formik.errors.branchId}</div>
            ) : null}
          </div>
        )}
      </div>
      <div className="flex justify-end pt-4">
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
          {isEdit ? "Save Changes" : "Add Employee"}
        </Button>
      </div>
    </form>
  );
};

export default EmployeeForm;