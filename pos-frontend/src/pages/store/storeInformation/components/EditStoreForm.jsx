import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StoreValidationSchema, STORE_TYPE_OPTIONS } from "./validation";

const EditStoreForm = ({ initialValues, onSubmit, onCancel, isSubmitting }) => {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={StoreValidationSchema}
      onSubmit={onSubmit}
      enableReinitialize
    >
      {({ isSubmitting: formikSubmitting, errors, touched, values, setFieldValue }) => (
        <Form className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="brand" className="text-sm font-semibold text-foreground">
                Store / Brand Name *
              </Label>
              <Field
                as={Input}
                id="brand"
                name="brand"
                placeholder="Enter store name"
                className={`text-xs h-10 ${errors.brand && touched.brand ? "border-destructive" : ""}`}
              />
              <ErrorMessage name="brand" component="div" className="text-destructive text-xs font-semibold mt-1" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="storeType" className="text-sm font-semibold text-foreground">
                Retail Category *
              </Label>
              <Select
                value={values.storeType || ""}
                onValueChange={(val) => setFieldValue("storeType", val)}
              >
                <SelectTrigger id="storeType" className={`text-xs h-10 ${errors.storeType && touched.storeType ? "border-destructive" : ""}`}>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {STORE_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ErrorMessage name="storeType" component="div" className="text-destructive text-xs font-semibold mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-semibold text-foreground">
                Contact Phone *
              </Label>
              <Field
                as={Input}
                id="phone"
                name="contact.phone"
                placeholder="+91 9876543210"
                className={`text-xs h-10 font-mono ${errors.contact?.phone && touched.contact?.phone ? "border-destructive" : ""}`}
              />
              <ErrorMessage name="contact.phone" component="div" className="text-destructive text-xs font-semibold mt-1" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                Store Email *
              </Label>
              <Field
                as={Input}
                id="email"
                name="contact.email"
                type="email"
                placeholder="store@example.com"
                className={`text-xs h-10 ${errors.contact?.email && touched.contact?.email ? "border-destructive" : ""}`}
              />
              <ErrorMessage name="contact.email" component="div" className="text-destructive text-xs font-semibold mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="gstNumber" className="text-sm font-semibold text-foreground">
                GST Number
              </Label>
              <Field
                as={Input}
                id="gstNumber"
                name="gstNumber"
                placeholder="27AAAAA0000A1Z5"
                className={`text-xs h-10 font-mono ${errors.gstNumber && touched.gstNumber ? "border-destructive" : ""}`}
              />
              <ErrorMessage name="gstNumber" component="div" className="text-destructive text-xs font-semibold mt-1" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="panNumber" className="text-sm font-semibold text-foreground">
                PAN Number
              </Label>
              <Field
                as={Input}
                id="panNumber"
                name="panNumber"
                placeholder="ABCDE1234F"
                className={`text-xs h-10 font-mono ${errors.panNumber && touched.panNumber ? "border-destructive" : ""}`}
              />
              <ErrorMessage name="panNumber" component="div" className="text-destructive text-xs font-semibold mt-1" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-sm font-semibold text-foreground">
              Premises Address *
            </Label>
            <Field
              as={Textarea}
              id="address"
              name="contact.address"
              placeholder="Store address details..."
              rows={2}
              className={`text-xs bg-card resize-none ${errors.contact?.address && touched.contact?.address ? "border-destructive" : ""}`}
            />
            <ErrorMessage name="contact.address" component="div" className="text-destructive text-xs font-semibold mt-1" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm font-semibold text-foreground">
              Store Description
            </Label>
            <Field
              as={Textarea}
              id="description"
              name="description"
              placeholder="About your store..."
              rows={2}
              className="text-xs bg-card resize-none"
            />
            <ErrorMessage name="description" component="div" className="text-destructive text-xs font-semibold mt-1" />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border/60">
            <Button type="button" variant="outline" onClick={onCancel} className="text-xs h-10">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || formikSubmitting}
              className="text-xs font-bold h-10 gap-1.5"
            >
              {isSubmitting || formikSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Save Store Profile
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default EditStoreForm;