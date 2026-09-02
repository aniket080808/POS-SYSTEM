import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
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
  DATE_FORMAT_OPTIONS,
} from "./validation";
import { transformSettingsToApiFormat } from "./formUtils";

const StoreSettingsForm = ({ initialValues, onSubmit, isSubmitting }) => {
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const apiData = transformSettingsToApiFormat(values);
      await onSubmit(apiData, { setSubmitting, resetForm });
    } catch (error) {
      console.error("Error submitting form:", error);
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
        <Form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="storeName" className="text-sm font-semibold text-foreground">
                Store / Brand Name *
              </Label>
              <Field
                as={Input}
                id="storeName"
                name="storeName"
                placeholder="Enter store name"
                className={`text-xs h-10 ${errors.storeName && touched.storeName ? "border-destructive" : ""}`}
              />
              <ErrorMessage name="storeName" component="div" className="text-destructive text-xs font-semibold mt-1" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="storeEmail" className="text-sm font-semibold text-foreground">
                Store Email Address *
              </Label>
              <Field
                as={Input}
                id="storeEmail"
                name="storeEmail"
                type="email"
                placeholder="contact@store.com"
                className={`text-xs h-10 ${errors.storeEmail && touched.storeEmail ? "border-destructive" : ""}`}
              />
              <ErrorMessage name="storeEmail" component="div" className="text-destructive text-xs font-semibold mt-1" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="storePhone" className="text-sm font-semibold text-foreground">
                Primary Contact Phone *
              </Label>
              <Field
                as={Input}
                id="storePhone"
                name="storePhone"
                placeholder="+91 9876543210"
                className={`text-xs h-10 ${errors.storePhone && touched.storePhone ? "border-destructive" : ""}`}
              />
              <ErrorMessage name="storePhone" component="div" className="text-destructive text-xs font-semibold mt-1" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gstNumber" className="text-sm font-semibold text-foreground">
                GST / Tax Registration Number
              </Label>
              <Field
                as={Input}
                id="gstNumber"
                name="gstNumber"
                placeholder="27AAAAA0000A1Z5"
                className="text-xs h-10 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="storeAddress" className="text-sm font-semibold text-foreground">
              Primary Store Address
            </Label>
            <Field
              as={Textarea}
              id="storeAddress"
              name="storeAddress"
              placeholder="Full retail premises address..."
              rows={2}
              className="text-xs bg-card resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="currency" className="text-sm font-semibold text-foreground">Currency</Label>
              <Select
                value={values.currency}
                onValueChange={(val) => setFieldValue("currency", val)}
              >
                <SelectTrigger id="currency" className="text-xs h-10">
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="timezone" className="text-sm font-semibold text-foreground">Timezone</Label>
              <Select
                value={values.timezone}
                onValueChange={(val) => setFieldValue("timezone", val)}
              >
                <SelectTrigger id="timezone" className="text-xs h-10">
                  <SelectValue placeholder="Select Timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dateFormat" className="text-sm font-semibold text-foreground">Date Format</Label>
              <Select
                value={values.dateFormat}
                onValueChange={(val) => setFieldValue("dateFormat", val)}
              >
                <SelectTrigger id="dateFormat" className="text-xs h-10">
                  <SelectValue placeholder="Select Date Format" />
                </SelectTrigger>
                <SelectContent>
                  {DATE_FORMAT_OPTIONS.map((df) => (
                    <SelectItem key={df.value} value={df.value}>{df.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              disabled={isSubmitting || formikSubmitting}
              className="text-xs font-bold h-10 gap-1.5"
            >
              {isSubmitting || formikSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Store Profile
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default StoreSettingsForm;