import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button } from "../../components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, User, Mail, Lock } from "lucide-react";

const validationSchema = Yup.object({
  fullName: Yup.string()
    .required("Full name is required")
    .min(2, "Full name must be at least 2 characters"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm password is required"),
});

const OwnerDetailsForm = ({ initialValues, onSubmit }) => {
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
          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-xs font-bold text-foreground mb-1"
            >
              Administrator Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <Field
                as={Input}
                type="text"
                id="fullName"
                name="fullName"
                className="pl-9 h-10 text-sm"
                placeholder="e.g. Rajesh Kumar"
              />
            </div>
            <ErrorMessage
              name="fullName"
              component="div"
              className="text-red-500 text-xs mt-1"
            />
          </div>

          {/* Email Address */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold text-foreground mb-1"
            >
              Administrator Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <Field
                as={Input}
                type="email"
                id="email"
                name="email"
                className="pl-9 h-10 text-sm"
                placeholder="admin@store.com"
              />
            </div>
            <ErrorMessage
              name="email"
              component="div"
              className="text-red-500 text-xs mt-1"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold text-foreground mb-1"
            >
              Create Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
              <Field
                as={Input}
                type="password"
                id="password"
                name="password"
                className="pl-9 h-10 text-sm"
                placeholder="Minimum 6 characters"
              />
            </div>
            <ErrorMessage
              name="password"
              component="div"
              className="text-red-500 text-xs mt-1"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-bold text-foreground mb-1"
            >
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
              <Field
                as={Input}
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="pl-9 h-10 text-sm"
                placeholder="Re-enter password"
              />
            </div>
            <ErrorMessage
              name="confirmPassword"
              component="div"
              className="text-red-500 text-xs mt-1"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm cursor-pointer shadow-xs"
            >
              <span>Continue to Store Profile</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default OwnerDetailsForm;