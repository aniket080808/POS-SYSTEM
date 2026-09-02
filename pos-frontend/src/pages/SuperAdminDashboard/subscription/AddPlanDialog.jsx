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
import { createSubscriptionPlan } from "@/Redux Toolkit/features/subscriptionPlan/subscriptionPlanThunks";
import { Plus, Trash2, Loader2, Check } from "lucide-react";

const BILLING_CYCLES = [
  { label: "Monthly", value: "MONTHLY" },
  { label: "Yearly", value: "YEARLY" },
];

const FEATURE_FIELDS = [
  { key: "enableAdvancedReports", label: "Advanced Analytics & Reports" },
  { key: "enableInventory", label: "Central Inventory Tracking" },
  { key: "enableIntegrations", label: "External Integrations" },
  { key: "enableEcommerce", label: "eCommerce Online Store" },
  { key: "enableInvoiceBranding", label: "Invoice Logo & Custom Branding" },
  { key: "prioritySupport", label: "Priority Technical Support" },
  { key: "enableMultiLocation", label: "Multi-Location Governance" },
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
  extraFeatures: Yup.array().of(Yup.string().required("Feature cannot be empty")).min(1, "At least one feature note is required"),
});

const initialValues = {
  name: "",
  description: "",
  price: "",
  billingCycle: "MONTHLY",
  maxBranches: 1,
  maxUsers: 3,
  maxProducts: 500,
  enableAdvancedReports: false,
  enableInventory: true,
  enableIntegrations: false,
  enableEcommerce: false,
  enableInvoiceBranding: false,
  prioritySupport: false,
  enableMultiLocation: false,
  extraFeatures: [""],
};

const FeaturesSwitchGrid = memo(({ handleFeatureSwitch }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-secondary/40 p-3 rounded-2xl border border-border/60">
    {FEATURE_FIELDS.map((f) => (
      <label key={f.key} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-card border border-border/40 cursor-pointer">
        <span className="text-xs font-semibold text-foreground">{f.label}</span>
        <Field name={f.key} type="checkbox">
          {({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={(val) => handleFeatureSwitch(f.key, val)}
              aria-label={f.label}
            />
          )}
        </Field>
      </label>
    ))}
  </div>
));
FeaturesSwitchGrid.displayName = "FeaturesSwitchGrid";

const ExtraFeaturesList = memo(({ values, handleExtraFeatureChange, handleRemoveExtraFeature, handleAddExtraFeature }) => (
  <div className="space-y-2">
    {values.extraFeatures.map((feature, idx) => (
      <div key={idx} className="flex gap-2">
        <Input
          value={feature}
          onChange={(e) => handleExtraFeatureChange(idx, e.target.value)}
          placeholder={`e.g. Free receipt thermal printer rolls (Note #${idx + 1})`}
          className="text-xs h-9"
          aria-label={`Extra feature ${idx + 1}`}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => handleRemoveExtraFeature(idx)}
          disabled={values.extraFeatures.length === 1}
          className="h-9 w-9 text-destructive hover:bg-destructive/10 shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    ))}
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleAddExtraFeature}
      className="text-xs font-bold gap-1.5 h-8"
    >
      <Plus className="w-3.5 h-3.5" /> Add Benefit Note
    </Button>
  </div>
));
ExtraFeaturesList.displayName = "ExtraFeaturesList";

const AddPlanDialog = ({ open, onOpenChange, onSuccess }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
    setLoading(true);
    try {
      const res = await dispatch(createSubscriptionPlan(values));
      if (res.meta.requestStatus === "fulfilled") {
        if (onSuccess) onSuccess();
        resetForm();
        onOpenChange(false);
      } else {
        setErrors({ submit: res.payload || "Failed to create plan" });
      }
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const renderForm = ({ values, isSubmitting, errors, setFieldValue }) => {
    const handleFeatureSwitch = (key, val) => setFieldValue(key, val);
    const handleExtraFeatureChange = (idx, value) => {
      const arr = [...values.extraFeatures];
      arr[idx] = value;
      setFieldValue("extraFeatures", arr);
    };
    const handleRemoveExtraFeature = (idx) => {
      const arr = values.extraFeatures.filter((_, i) => i !== idx);
      setFieldValue("extraFeatures", arr.length ? arr : [""]);
    };
    const handleAddExtraFeature = () => {
      setFieldValue("extraFeatures", [...values.extraFeatures, ""]);
    };

    return (
      <Form className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5" htmlFor="plan-name">
            Tier Name
          </label>
          <Field as={Input} id="plan-name" name="name" placeholder="e.g. Retail Pro" className="text-xs h-10" />
          <ErrorMessage name="name" component="div" className="text-destructive text-xs mt-1 font-semibold" />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5" htmlFor="plan-description">
            Marketing Description
          </label>
          <Field as={Input} id="plan-description" name="description" placeholder="Ideal for multi-counter grocery stores" className="text-xs h-10" />
          <ErrorMessage name="description" component="div" className="text-destructive text-xs mt-1 font-semibold" />
        </div>

        {/* Price & Billing Cycle */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5" htmlFor="plan-price">
              Price (₹)
            </label>
            <Field as={Input} id="plan-price" name="price" type="number" min="0" placeholder="1999" className="text-xs h-10" />
            <ErrorMessage name="price" component="div" className="text-destructive text-xs mt-1 font-semibold" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5" htmlFor="plan-billing-cycle">
              Billing Interval
            </label>
            <Field name="billingCycle">
              {({ field }) => (
                <Select value={field.value} onValueChange={(val) => setFieldValue("billingCycle", val)}>
                  <SelectTrigger className="w-full text-xs h-10" id="plan-billing-cycle">
                    <SelectValue placeholder="Select cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    {BILLING_CYCLES.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Field>
          </div>
        </div>

        {/* Branches, Users, Products */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5" htmlFor="plan-branches">
              Max Branches
            </label>
            <Field as={Input} id="plan-branches" name="maxBranches" type="number" min="1" className="text-xs h-10" />
            <ErrorMessage name="maxBranches" component="div" className="text-destructive text-xs mt-1 font-semibold" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5" htmlFor="plan-users">
              Max Staff
            </label>
            <Field as={Input} id="plan-users" name="maxUsers" type="number" min="1" className="text-xs h-10" />
            <ErrorMessage name="maxUsers" component="div" className="text-destructive text-xs mt-1 font-semibold" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5" htmlFor="plan-products">
              Max Products
            </label>
            <Field as={Input} id="plan-products" name="maxProducts" type="number" min="1" className="text-xs h-10" />
            <ErrorMessage name="maxProducts" component="div" className="text-destructive text-xs mt-1 font-semibold" />
          </div>
        </div>

        {/* Features Switches */}
        <div>
          <label className="block text-xs font-bold text-foreground mb-2">Module Entitlements</label>
          <FeaturesSwitchGrid handleFeatureSwitch={handleFeatureSwitch} />
        </div>

        {/* Extra Features */}
        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5">Custom Feature Bullets</label>
          <ExtraFeaturesList
            values={values}
            handleExtraFeatureChange={handleExtraFeatureChange}
            handleRemoveExtraFeature={handleRemoveExtraFeature}
            handleAddExtraFeature={handleAddExtraFeature}
          />
        </div>

        {errors.submit && <div className="text-destructive text-xs font-bold">{errors.submit}</div>}

        <DialogFooter className="pt-2">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="text-xs h-10">Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting || loading} className="text-xs font-bold h-10 gap-1.5">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Save Plan
          </Button>
        </DialogFooter>
      </Form>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Add Subscription Tier</DialogTitle>
        </DialogHeader>
        <div style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: 4 }}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {renderForm}
          </Formik>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddPlanDialog;