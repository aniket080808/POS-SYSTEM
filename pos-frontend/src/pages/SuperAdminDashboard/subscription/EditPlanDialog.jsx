import React, { useState, memo } from "react";
import { useDispatch } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../../../components/ui/select";
import { Switch } from "../../../components/ui/switch";
import { Button } from "../../../components/ui/button";
import { updateSubscriptionPlan } from "@/Redux Toolkit/features/subscriptionPlan/subscriptionPlanThunks";

const BILLING_CYCLES = [
  { label: "Monthly", value: "MONTHLY" },
  { label: "Yearly", value: "YEARLY" },
];

const FEATURE_FIELDS = [
  { key: "enableAdvancedReports", label: "Advanced Reports" },
  { key: "enableInventory", label: "Inventory System" },
  { key: "enableIntegrations", label: "Integrations" },
  { key: "enableEcommerce", label: "eCommerce" },
  { key: "enableInvoiceBranding", label: "Invoice Branding" },
  { key: "prioritySupport", label: "Priority Support" },
  { key: "enableMultiLocation", label: "Multi-location" },
];

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  description: Yup.string().required("Description is required"),
  price: Yup.number().typeError("Price must be a number").required("Price is required").min(0),
  billingCycle: Yup.string().oneOf(["MONTHLY", "YEARLY"]).required("Billing cycle is required"),
  maxBranches: Yup.number().typeError("Branches must be a number").required("Branches is required").min(1),
  maxUsers: Yup.number().typeError("Users must be a number").required("Users is required").min(1),
  maxProducts: Yup.number().typeError("Products must be a number").required("Products is required").min(1),
  enableAdvancedReports: Yup.boolean().required(),
  enableInventory: Yup.boolean().required(),
  enableIntegrations: Yup.boolean().required(),
  enableEcommerce: Yup.boolean().required(),
  enableInvoiceBranding: Yup.boolean().required(),
  prioritySupport: Yup.boolean().required(),
  enableMultiLocation: Yup.boolean().required(),
  extraFeatures: Yup.array().of(Yup.string().required("Feature cannot be empty")).min(1, "At least one extra feature is required"),
});

const FeaturesSwitchGrid = memo(({ handleFeatureSwitch }) => (
  <div className="grid grid-cols-2 gap-2">
    {FEATURE_FIELDS.map((f) => (
      <label key={f.key} className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
        <Field name={f.key} type="checkbox">
          {({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={(val) => handleFeatureSwitch(f.key, val)}
              aria-label={f.label}
            />
          )}
        </Field>
        {f.label}
      </label>
    ))}
  </div>
));

FeaturesSwitchGrid.displayName = "FeaturesSwitchGrid";

const EditPlanDialog = ({ open, onOpenChange, plan }) => {
  const dispatch = useDispatch();
  const [extraFeatureInput, setExtraFeatureInput] = useState("");

  if (!plan) return null;

  const initialValues = {
    name: plan.name || "",
    description: plan.description || "",
    price: plan.price ?? "",
    billingCycle: plan.billingCycle || "MONTHLY",
    maxBranches: plan.maxBranches ?? 1,
    maxUsers: plan.maxUsers ?? 1,
    maxProducts: plan.maxProducts ?? 100,
    enableAdvancedReports: !!plan.enableAdvancedReports,
    enableInventory: !!plan.enableInventory,
    enableIntegrations: !!plan.enableIntegrations,
    enableEcommerce: !!plan.enableEcommerce,
    enableInvoiceBranding: !!plan.enableInvoiceBranding,
    prioritySupport: !!plan.prioritySupport,
    enableMultiLocation: !!plan.enableMultiLocation,
    extraFeatures: Array.isArray(plan.extraFeatures) && plan.extraFeatures.length > 0 ? plan.extraFeatures : [""],
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await dispatch(updateSubscriptionPlan({ id: plan.id, planData: values })).unwrap();
      onOpenChange(false);
    } catch {
      // Error handled by redux
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            Edit Subscription Tier
          </DialogTitle>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, setFieldValue, isSubmitting }) => (
            <Form className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Plan Name</label>
                <Field as={Input} name="name" placeholder="e.g. Enterprise Tier" className="h-9 text-xs" />
                <ErrorMessage name="name" component="div" className="text-red-500 text-[11px]" />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Description</label>
                <Field as={Input} name="description" placeholder="Short description" className="h-9 text-xs" />
                <ErrorMessage name="description" component="div" className="text-red-500 text-[11px]" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Price (₹ INR)</label>
                  <Field as={Input} name="price" type="number" placeholder="2499" className="h-9 text-xs font-mono" />
                  <ErrorMessage name="price" component="div" className="text-red-500 text-[11px]" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Billing Cycle</label>
                  <Select
                    value={values.billingCycle}
                    onValueChange={(val) => setFieldValue("billingCycle", val)}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select cycle" />
                    </SelectTrigger>
                    <SelectContent>
                      {BILLING_CYCLES.map((cycle) => (
                        <SelectItem key={cycle.value} value={cycle.value} className="text-xs">
                          {cycle.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ErrorMessage name="billingCycle" component="div" className="text-red-500 text-[11px]" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Max Branches</label>
                  <Field as={Input} name="maxBranches" type="number" className="h-9 text-xs font-mono" />
                  <ErrorMessage name="maxBranches" component="div" className="text-red-500 text-[11px]" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Max Users</label>
                  <Field as={Input} name="maxUsers" type="number" className="h-9 text-xs font-mono" />
                  <ErrorMessage name="maxUsers" component="div" className="text-red-500 text-[11px]" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Max Products</label>
                  <Field as={Input} name="maxProducts" type="number" className="h-9 text-xs font-mono" />
                  <ErrorMessage name="maxProducts" component="div" className="text-red-500 text-[11px]" />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/60">
                <label className="font-bold text-foreground block">Feature Entitlements</label>
                <FeaturesSwitchGrid
                  handleFeatureSwitch={(field, val) => setFieldValue(field, val)}
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-border/60">
                <label className="font-bold text-foreground block">Custom Bullet Features</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add bullet feature..."
                    value={extraFeatureInput}
                    onChange={(e) => setExtraFeatureInput(e.target.value)}
                    className="h-9 text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 text-xs"
                    onClick={() => {
                      if (extraFeatureInput.trim()) {
                        setFieldValue("extraFeatures", [...values.extraFeatures, extraFeatureInput.trim()]);
                        setExtraFeatureInput("");
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {values.extraFeatures.filter(Boolean).map((feat, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-foreground text-[11px] font-medium border border-border"
                    >
                      {feat}
                      <button
                        type="button"
                        onClick={() =>
                          setFieldValue(
                            "extraFeatures",
                            values.extraFeatures.filter((_, i) => i !== idx)
                          )
                        }
                        className="text-muted-foreground hover:text-red-500 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <ErrorMessage name="extraFeatures" component="div" className="text-red-500 text-[11px]" />
              </div>

              <DialogFooter className="pt-4 border-t border-border/60 gap-2">
                <DialogClose asChild>
                  <Button variant="outline" type="button" className="h-10 text-xs">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 text-xs bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-xs"
                >
                  {isSubmitting ? "Saving..." : "Update Plan"}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default EditPlanDialog;