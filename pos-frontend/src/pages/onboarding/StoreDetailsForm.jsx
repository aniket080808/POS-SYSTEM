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
import { ArrowLeft, Store, MapPin, Tag, ArrowRight, Loader2 } from "lucide-react";

const validationSchema = Yup.object({
  storeName: Yup.string()
    .required("Store name is required")
    .min(2, "Store name must be at least 2 characters"),
  storeType: Yup.string().required("Store type is required"),
  storeAddress: Yup.string().optional(),
});

const storeTypes = [
  { value: "retail", label: "Retail / Supermarket" },
  { value: "restaurant", label: "Restaurant / Food Outlet" },
  { value: "cafe", label: "Café & Bakery" },
  { value: "pharmacy", label: "Pharmacy & Health" },
  { value: "grocery", label: "Grocery & Provisions" },
  { value: "electronics", label: "Electronics & Appliances" },
  { value: "clothing", label: "Apparel & Fashion" },
  { value: "other", label: "Other Commercial" },
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
      {({ isSubmitting, isValid, touched, errors, values, setFieldValue }) => (
        <Form className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-foreground mb-1">
              Store Information
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Enter your retail business and brand identification details
            </p>
          </div>

          {/* Store Name */}
          <div>
            <label htmlFor="storeName" className="block text-sm font-semibold text-foreground mb-1.5">
              Brand / Store Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Store className="w-4 h-4" />
              </div>
              <Field
                as={Input}
                type="text"
                id="storeName"
                name="storeName"
                className={`pl-10 text-xs h-11 ${
                  touched.storeName && errors.storeName
                    ? "border-destructive ring-1 ring-destructive"
                    : ""
                }`}
                placeholder="e.g. Apex Hypermarket"
              />
            </div>
            <ErrorMessage
              name="storeName"
              component="div"
              className="text-xs text-destructive mt-1 flex items-center gap-1 font-semibold"
            />
          </div>

          {/* Store Type */}
          <div>
            <label htmlFor="storeType" className="block text-sm font-semibold text-foreground mb-1.5">
              Retail Category
            </label>
            <Select
              value={values.storeType}
              onValueChange={(val) => setFieldValue("storeType", val)}
            >
              <SelectTrigger id="storeType" className="h-11 text-xs">
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Retail Verticals</SelectLabel>
                  {storeTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <ErrorMessage
              name="storeType"
              component="div"
              className="text-xs text-destructive mt-1 flex items-center gap-1 font-semibold"
            />
          </div>

          {/* Store Address */}
          <div>
            <label htmlFor="storeAddress" className="block text-sm font-semibold text-foreground mb-1.5">
              Headquarters / Main Address{" "}
              <span className="text-muted-foreground font-normal">(Optional)</span>
            </label>
            <Field
              as={Textarea}
              id="storeAddress"
              name="storeAddress"
              rows={3}
              className="text-xs rounded-xl border border-input bg-card p-3 resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="e.g. 104 Commercial Boulevard, Mumbai"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1 text-xs h-11"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Previous
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="flex-1 text-xs h-11 font-bold gap-1.5"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                </span>
              ) : (
                <>
                  Complete Setup
                  <ArrowRight className="w-4 h-4" />
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
