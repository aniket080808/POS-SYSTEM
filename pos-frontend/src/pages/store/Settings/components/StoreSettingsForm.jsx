import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Building2 } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  StoreSettingsValidationSchema, 
  CURRENCY_OPTIONS, 
  TIMEZONE_OPTIONS, 
  DATE_FORMAT_OPTIONS 
} from "./validation";
import { transformSettingsToApiFormat } from "./formUtils";

const StoreSettingsForm = ({ initialValues, onSubmit, isSubmitting, storeId, onChange }) => {
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const apiData = transformSettingsToApiFormat(values);
      await onSubmit(apiData, { setSubmitting, resetForm });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={StoreSettingsValidationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ isSubmitting: formikSubmitting, errors, touched, values, setFieldValue }) => (
        <Form className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="storeName" className="text-xs font-semibold text-foreground">Store Brand Name *</Label>
              <Field
                as={Input}
                id="storeName"
                name="storeName"
                placeholder="Enter store name"
                className={`h-9 rounded-xl text-xs ${errors.storeName && touched.storeName ? "border-destructive" : ""}`}
              />
              <ErrorMessage name="storeName" component="div" className="text-destructive text-[11px] font-medium mt-1" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="storeEmail" className="text-xs font-semibold text-foreground">Contact Email *</Label>
              <Field
                as={Input}
                id="storeEmail"
                name="storeEmail"
                type="email"
                placeholder="store@example.com"
                className={`h-9 rounded-xl text-xs ${errors.storeEmail && touched.storeEmail ? "border-destructive" : ""}`}
              />
              <ErrorMessage name="storeEmail" component="div" className="text-destructive text-[11px] font-medium mt-1" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="storePhone" className="text-xs font-semibold text-foreground">Contact Phone *</Label>
              <Field
                as={Input}
                id="storePhone"
                name="storePhone"
                placeholder="+91 98765 43210"
                className={`h-9 rounded-xl text-xs ${errors.storePhone && touched.storePhone ? "border-destructive" : ""}`}
              />
              <ErrorMessage name="storePhone" component="div" className="text-destructive text-[11px] font-medium mt-1" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="currency" className="text-xs font-semibold text-foreground">Operational Currency *</Label>
              <Field name="currency">
                {({ field, form }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => form.setFieldValue(field.name, value)}
                  >
                    <SelectTrigger 
                      className={`h-9 rounded-xl text-xs w-full ${
                        errors.currency && touched.currency ? "border-destructive" : ""
                      }`}
                    >
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl text-xs">
                      {CURRENCY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </Field>
              <ErrorMessage name="currency" component="div" className="text-destructive text-[11px] font-medium mt-1" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="taxRate" className="text-xs font-semibold text-foreground">Default Sales Tax Rate (%) *</Label>
              <Field
                as={Input}
                id="taxRate"
                name="taxRate"
                type="number"
                step="0.01"
                placeholder="18.0"
                className={`h-9 rounded-xl text-xs ${errors.taxRate && touched.taxRate ? "border-destructive" : ""}`}
              />
              <ErrorMessage name="taxRate" component="div" className="text-destructive text-[11px] font-medium mt-1" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="timezone" className="text-xs font-semibold text-foreground">Store Timezone *</Label>
              <Field name="timezone">
                {({ field, form }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => form.setFieldValue(field.name, value)}
                  >
                    <SelectTrigger 
                      className={`h-9 rounded-xl text-xs w-full ${
                        errors.timezone && touched.timezone ? "border-destructive" : ""
                      }`}
                    >
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl text-xs">
                      {TIMEZONE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </Field>
              <ErrorMessage name="timezone" component="div" className="text-destructive text-[11px] font-medium mt-1" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dateFormat" className="text-xs font-semibold text-foreground">Display Date Format</Label>
              <Field name="dateFormat">
                {({ field, form }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => form.setFieldValue(field.name, value)}
                  >
                    <SelectTrigger className="h-9 rounded-xl text-xs w-full">
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl text-xs">
                      {DATE_FORMAT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </Field>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gstNumber" className="text-xs font-semibold text-foreground">GSTIN Number</Label>
              <Field
                as={Input}
                id="gstNumber"
                name="gstNumber"
                placeholder="27AAAAA0000A1Z5"
                className={`h-9 rounded-xl text-xs uppercase font-mono ${errors.gstNumber && touched.gstNumber ? "border-destructive" : ""}`}
              />
              <ErrorMessage name="gstNumber" component="div" className="text-destructive text-[11px] font-medium mt-1" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="panNumber" className="text-xs font-semibold text-foreground">PAN Number</Label>
              <Field
                as={Input}
                id="panNumber"
                name="panNumber"
                placeholder="ABCDE1234F"
                className={`h-9 rounded-xl text-xs uppercase font-mono ${errors.panNumber && touched.panNumber ? "border-destructive" : ""}`}
              />
              <ErrorMessage name="panNumber" component="div" className="text-destructive text-[11px] font-medium mt-1" />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="storeAddress" className="text-xs font-semibold text-foreground">Headquarters / Physical Address *</Label>
              <Field
                as={Input}
                id="storeAddress"
                name="storeAddress"
                placeholder="Enter physical address"
                className={`h-9 rounded-xl text-xs ${errors.storeAddress && touched.storeAddress ? "border-destructive" : ""}`}
              />
              <ErrorMessage name="storeAddress" component="div" className="text-destructive text-[11px] font-medium mt-1" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="storeDescription" className="text-xs font-semibold text-foreground">Store Description / Tagline</Label>
            <Field
              as={Textarea}
              id="storeDescription"
              name="storeDescription"
              placeholder="Brief summary of your retail business and products"
              rows={2}
              className={`rounded-xl text-xs ${errors.storeDescription && touched.storeDescription ? "border-destructive" : ""}`}
            />
            <ErrorMessage name="storeDescription" component="div" className="text-destructive text-[11px] font-medium mt-1" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="receiptFooter" className="text-xs font-semibold text-foreground">Customer Receipt Footer Note</Label>
            <Field
              as={Textarea}
              id="receiptFooter"
              name="receiptFooter"
              placeholder="Thank you for shopping with us! Visit again."
              rows={2}
              className="rounded-xl text-xs"
            />
          </div>

          <div className="flex justify-end pt-2 border-t border-border/60">
            <Button type="submit" disabled={formikSubmitting || isSubmitting} size="sm" className="rounded-xl text-xs font-semibold h-9 gap-1.5">
              {formikSubmitting || isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Store Profile</span>
                </>
              )}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default StoreSettingsForm;