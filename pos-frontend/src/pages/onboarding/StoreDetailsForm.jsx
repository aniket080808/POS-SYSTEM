import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button } from "../../components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { SelectGroup, SelectLabel } from "../../components/ui/select";
import { Store, Building2, MapPin, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

const validationSchema = Yup.object({
  storeName: Yup.string()
    .required("Store name is required")
    .min(2, "Store name must be at least 2 characters"),
  storeType: Yup.string().required("Store type is required"),
  storeAddress: Yup.string().optional(),
});

const storeTypes = [
  { value: "retail", label: "Retail Store" },
  { value: "restaurant", label: "Restaurant" },
  { value: "cafe", label: "Café" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "grocery", label: "Grocery Store" },
  { value: "electronics", label: "Electronics Store" },
  { value: "clothing", label: "Clothing Store" },
  { value: "other", label: "Other" },
];

const StoreDetailsForm = ({ initialValues, onSubmit, onBack }) => {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values, { setSubmitting }) => {
        onSubmit(values);
        setSubmitting(false);
      }}
    >
      {({ isSubmitting, isValid, touched, errors }) => (
        <Form className="space-y-4">
          {/* Store Name Field */}
          <div>
            <label
              htmlFor="storeName"
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5"
            >
              Store / Business Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Store className="h-4 w-4" />
              </div>
              <Field
                as={Input}
                type="text"
                id="storeName"
                name="storeName"
                className={`pl-10 h-11 rounded-xl ${
                  touched.storeName && errors.storeName ? "border-destructive" : ""
                }`}
                placeholder="e.g. Apex Supermarket"
              />
            </div>
            <ErrorMessage
              name="storeName"
              component="div"
              className="text-destructive text-xs mt-1.5 flex items-center"
            >
              {(msg) => (
                <>
                  <AlertCircle className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                  {msg}
                </>
              )}
            </ErrorMessage>
          </div>

          {/* Store Type Field */}
          <div>
            <label
              htmlFor="storeType"
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5"
            >
              Store Category
            </label>
            <Field name="storeType">
              {({ field, form }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => form.setFieldValue("storeType", val)}
                >
                  <SelectTrigger className="w-full h-11 rounded-xl" id="storeType">
                    <SelectValue placeholder="Select business category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Categories</SelectLabel>
                      {storeTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            </Field>
            <ErrorMessage
              name="storeType"
              component="div"
              className="text-destructive text-xs mt-1.5 flex items-center"
            >
              {(msg) => (
                <>
                  <AlertCircle className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                  {msg}
                </>
              )}
            </ErrorMessage>
          </div>

          {/* Store Address Field */}
          <div>
            <label
              htmlFor="storeAddress"
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5"
            >
              Headquarters Address <span className="text-muted-foreground/60 font-normal lowercase">(optional)</span>
            </label>
            <div className="relative">
              <Field
                as={Textarea}
                id="storeAddress"
                name="storeAddress"
                rows="3"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input text-sm resize-none focus-visible:ring-2 focus-visible:ring-ring/50"
                placeholder="Street address, city, state, postal code"
              />
            </div>
            <ErrorMessage
              name="storeAddress"
              component="div"
              className="text-destructive text-xs mt-1.5 flex items-center"
            >
              {(msg) => (
                <>
                  <AlertCircle className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                  {msg}
                </>
              )}
            </ErrorMessage>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1 h-11 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="flex-1 h-11 rounded-xl gap-2"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Setup</span>
                </>
              )}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default StoreDetailsForm;

