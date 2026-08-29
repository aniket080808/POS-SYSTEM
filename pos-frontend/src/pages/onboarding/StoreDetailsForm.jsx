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
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Store, Tag, MapPin, ArrowLeft, CheckCircle2 } from "lucide-react";

const validationSchema = Yup.object({
  storeName: Yup.string()
    .required("Store brand name is required")
    .min(2, "Store name must be at least 2 characters"),
  storeType: Yup.string().required("Please select a store type"),
  storeAddress: Yup.string().optional(),
});

const storeTypes = [
  { value: "retail", label: "Retail Supermarket / Grocery" },
  { value: "restaurant", label: "Restaurant / Food Outlet" },
  { value: "cafe", label: "Café & Bakery" },
  { value: "pharmacy", label: "Pharmacy & Healthcare" },
  { value: "electronics", label: "Electronics & Appliances" },
  { value: "clothing", label: "Apparel & Fashion" },
  { value: "other", label: "General Merchandise / Other" },
];

const StoreDetailsForm = ({ initialValues, onSubmit, onBack, isLoading }) => {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values, { setSubmitting }) => {
        onSubmit(values);
        setSubmitting(false);
      }}
    >
      {({ isSubmitting, isValid }) => (
        <Form className="space-y-4">
          {/* Store Brand Name */}
          <div>
            <label
              htmlFor="storeName"
              className="block text-xs font-bold text-foreground mb-1"
            >
              Store / Business Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <Store className="h-4 w-4 text-muted-foreground" />
              </div>
              <Field
                as={Input}
                type="text"
                id="storeName"
                name="storeName"
                className="pl-9 h-10 text-sm"
                placeholder="e.g. Apex Super Mart"
              />
            </div>
            <ErrorMessage
              name="storeName"
              component="div"
              className="text-red-500 text-xs mt-1"
            />
          </div>

          {/* Store Category */}
          <div>
            <label
              htmlFor="storeType"
              className="block text-xs font-bold text-foreground mb-1"
            >
              Store Category / Type <span className="text-red-500">*</span>
            </label>
            <Field name="storeType">
              {({ field, form }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => form.setFieldValue("storeType", val)}
                >
                  <SelectTrigger className="w-full h-10 text-sm" id="storeType">
                    <SelectValue placeholder="Select business category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Retail Categories</SelectLabel>
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
              className="text-red-500 text-xs mt-1"
            />
          </div>

          {/* Store Address */}
          <div>
            <label
              htmlFor="storeAddress"
              className="block text-xs font-bold text-foreground mb-1"
            >
              Store Physical Address <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
            </label>
            <Field
              as={Textarea}
              id="storeAddress"
              name="storeAddress"
              className="min-h-20 text-sm"
              placeholder="e.g. Shop 104, City Commercial Complex, Mumbai"
            />
            <ErrorMessage
              name="storeAddress"
              component="div"
              className="text-red-500 text-xs mt-1"
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isLoading || isSubmitting}
              className="flex-1 h-11 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Back</span>
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isSubmitting || !isValid}
              className="flex-1 h-11 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs"
            >
              {isLoading || isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                  <span>Registering...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span>Complete Setup</span>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default StoreDetailsForm;
