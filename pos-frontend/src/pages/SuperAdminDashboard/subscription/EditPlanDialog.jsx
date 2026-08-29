import React, { useState, useEffect, memo } from 'react';
import { useDispatch } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose
} from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue
} from '../../../components/ui/select';
import { Switch } from '../../../components/ui/switch';
import { Button } from '../../../components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { updateSubscriptionPlan } from '@/Redux Toolkit/features/subscriptionPlan/subscriptionPlanThunks';

const BILLING_CYCLES = [
  { label: 'Monthly', value: 'MONTHLY' },
  { label: 'Yearly', value: 'YEARLY' },
];

const FEATURE_FIELDS = [
  { key: 'enableAdvancedReports', label: 'Advanced Reports & Export' },
  { key: 'enableInventory', label: 'Inventory Management Engine' },
  { key: 'enableIntegrations', label: 'Third-party Integrations' },
  { key: 'enableEcommerce', label: 'Online Storefront / eCommerce' },
  { key: 'enableInvoiceBranding', label: 'White-label Custom Invoices' },
  { key: 'prioritySupport', label: '24/7 Priority SLA Support' },
  { key: 'enableMultiLocation', label: 'Multi-Location Sync' },
];

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  description: Yup.string().required('Description is required'),
  price: Yup.number().typeError('Price must be a number').required('Price is required').min(0),
  billingCycle: Yup.string().oneOf(['MONTHLY', 'YEARLY']).required('Billing cycle is required'),
  maxBranches: Yup.number().typeError('Branches must be a number').required('Branches is required').min(1),
  maxUsers: Yup.number().typeError('Users must be a number').required('Users is required').min(1),
  maxProducts: Yup.number().typeError('Products must be a number').required('Products is required').min(1),
  enableAdvancedReports: Yup.boolean().required(),
  enableInventory: Yup.boolean().required(),
  enableIntegrations: Yup.boolean().required(),
  enableEcommerce: Yup.boolean().required(),
  enableInvoiceBranding: Yup.boolean().required(),
  prioritySupport: Yup.boolean().required(),
  enableMultiLocation: Yup.boolean().required(),
  extraFeatures: Yup.array().of(Yup.string().required('Feature cannot be empty')).min(1, 'At least one extra feature is required'),
});

const FeaturesSwitchGrid = memo(({ handleFeatureSwitch }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
    {FEATURE_FIELDS.map(f => (
      <label key={f.key} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs cursor-pointer hover:bg-muted/60 transition-colors">
        <span className="font-medium text-foreground pr-2">{f.label}</span>
        <Field name={f.key} type="checkbox">
          {({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={val => handleFeatureSwitch(f.key, val)}
              aria-label={f.label}
            />
          )}
        </Field>
      </label>
    ))}
  </div>
));
FeaturesSwitchGrid.displayName = 'FeaturesSwitchGrid';

const ExtraFeaturesList = memo(({ values, handleExtraFeatureChange, handleRemoveExtraFeature, handleAddExtraFeature }) => (
  <div className="space-y-2">
    {values.extraFeatures.map((feature, idx) => (
      <div key={idx} className="flex gap-2">
        <Input
          value={feature}
          onChange={e => handleExtraFeatureChange(idx, e.target.value)}
          placeholder={`Bullet feature ${idx + 1}`}
          aria-label={`Extra feature ${idx + 1}`}
          className="h-9 rounded-xl text-xs"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => handleRemoveExtraFeature(idx)}
          disabled={values.extraFeatures.length === 1}
          className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    ))}
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleAddExtraFeature}
      className="h-8 rounded-xl text-xs font-semibold gap-1.5"
    >
      <Plus className="w-3.5 h-3.5" /> Add Capability
    </Button>
  </div>
));
ExtraFeaturesList.displayName = 'ExtraFeaturesList';

const getInitialValues = (plan) => {
  if (!plan) return null;
  return {
    name: plan.name || '',
    description: plan.description || '',
    price: plan.price || '',
    billingCycle: plan.billingCycle || '',
    maxBranches: plan.maxBranches || '',
    maxUsers: plan.maxUsers || '',
    maxProducts: plan.maxProducts || '',
    enableAdvancedReports: plan.enableAdvancedReports ?? false,
    enableInventory: plan.enableInventory ?? false,
    enableIntegrations: plan.enableIntegrations ?? false,
    enableEcommerce: plan.enableEcommerce ?? false,
    enableInvoiceBranding: plan.enableInvoiceBranding ?? false,
    prioritySupport: plan.prioritySupport ?? false,
    enableMultiLocation: plan.enableMultiLocation ?? false,
    extraFeatures: plan.extraFeatures && plan.extraFeatures.length > 0 ? plan.extraFeatures : [''],
  };
};

const EditPlanDialog = ({ open, onOpenChange, plan, onSuccess }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  if (!plan) return null;

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    setLoading(true);
    try {
      const res = await dispatch(updateSubscriptionPlan({ id: plan.id, plan: values }));
      if (res.meta.requestStatus === 'fulfilled') {
        if (onSuccess) onSuccess();
      } else {
        setErrors({ submit: res.payload || 'Failed to update plan' });
      }
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const renderForm = ({ values, isSubmitting, errors, setFieldValue }) => {
    const handleFeatureSwitch = (key, val) => {
      setFieldValue(key, val);
    };
    const handleExtraFeatureChange = (idx, value) => {
      const arr = [...values.extraFeatures];
      arr[idx] = value;
      setFieldValue('extraFeatures', arr);
    };
    const handleRemoveExtraFeature = idx => {
      const arr = values.extraFeatures.filter((_, i) => i !== idx);
      setFieldValue('extraFeatures', arr.length ? arr : ['']);
    };
    const handleAddExtraFeature = () => {
      setFieldValue('extraFeatures', [...values.extraFeatures, '']);
    };

    return (
      <Form className="space-y-4 text-xs">
        {/* Name & Description */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground" htmlFor="plan-name">Plan Name</label>
            <Field as={Input} id="plan-name" name="name" placeholder="Plan name" className="h-9 rounded-xl text-xs" />
            <ErrorMessage name="name" component="div" className="text-destructive text-[11px]" />
          </div>
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground" htmlFor="plan-description">Short Tagline</label>
            <Field as={Input} id="plan-description" name="description" placeholder="Description" className="h-9 rounded-xl text-xs" />
            <ErrorMessage name="description" component="div" className="text-destructive text-[11px]" />
          </div>
        </div>

        {/* Price & Billing Cycle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground" htmlFor="plan-price">Price (₹)</label>
            <Field as={Input} id="plan-price" name="price" type="number" min="0" placeholder="Price" className="h-9 rounded-xl text-xs font-mono" />
            <ErrorMessage name="price" component="div" className="text-destructive text-[11px]" />
          </div>
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground" htmlFor="plan-billing-cycle">Billing Frequency</label>
            <Field name="billingCycle">
              {({ field }) => (
                <Select value={field.value} onValueChange={val => setFieldValue('billingCycle', val)}>
                  <SelectTrigger className="w-full h-9 rounded-xl text-xs" id="plan-billing-cycle">
                    <SelectValue placeholder="Select cycle" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl text-xs">
                    {BILLING_CYCLES.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Field>
            <ErrorMessage name="billingCycle" component="div" className="text-destructive text-[11px]" />
          </div>
        </div>

        {/* Branches, Users, Products */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground" htmlFor="plan-branches">Max Branches</label>
            <Field as={Input} id="plan-branches" name="maxBranches" type="number" min="1" placeholder="Branches" className="h-9 rounded-xl text-xs font-mono" />
            <ErrorMessage name="maxBranches" component="div" className="text-destructive text-[11px]" />
          </div>
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground" htmlFor="plan-users">Max Staff</label>
            <Field as={Input} id="plan-users" name="maxUsers" type="number" min="1" placeholder="Users" className="h-9 rounded-xl text-xs font-mono" />
            <ErrorMessage name="maxUsers" component="div" className="text-destructive text-[11px]" />
          </div>
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground" htmlFor="plan-products">Max SKUs</label>
            <Field as={Input} id="plan-products" name="maxProducts" type="number" min="1" placeholder="Products" className="h-9 rounded-xl text-xs font-mono" />
            <ErrorMessage name="maxProducts" component="div" className="text-destructive text-[11px]" />
          </div>
        </div>

        {/* Features Switches */}
        <div className="space-y-2 pt-1">
          <label className="font-semibold text-foreground block">System Feature Gates</label>
          <FeaturesSwitchGrid handleFeatureSwitch={handleFeatureSwitch} />
        </div>

        {/* Extra Features */}
        <div className="space-y-2 pt-1">
          <label className="font-semibold text-foreground block">Key Bullet Highlights</label>
          <ExtraFeaturesList
            values={values}
            handleExtraFeatureChange={handleExtraFeatureChange}
            handleRemoveExtraFeature={handleRemoveExtraFeature}
            handleAddExtraFeature={handleAddExtraFeature}
          />
          <ErrorMessage name="extraFeatures" component="div" className="text-destructive text-[11px]" />
        </div>

        {/* Submission error */}
        {errors.submit && <div className="text-destructive text-xs font-semibold">{errors.submit}</div>}

        {/* Dialog Footer */}
        <DialogFooter className="gap-2 pt-2">
          <DialogClose asChild>
            <Button type="button" variant="outline" size="sm" className="rounded-xl text-xs">Cancel</Button>
          </DialogClose>
          <Button type="submit" size="sm" disabled={isSubmitting || loading} className="rounded-xl text-xs font-semibold">
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </Form>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl bg-card border-border sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-foreground">Edit Subscription Tier</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <Formik
            initialValues={getInitialValues(plan)}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {renderForm}
          </Formik>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPlanDialog;
 