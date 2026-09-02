import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button } from "../../components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, User, Mail, Lock, AlertCircle } from "lucide-react";

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
      {({ isSubmitting, isValid, touched, errors }) => (
        <Form className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-foreground mb-1">
              Store Owner Credentials
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              This account will serve as the Primary Store Administrator
            </p>
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-foreground mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <User className="w-4 h-4" />
              </div>
              <Field
                as={Input}
                type="text"
                id="fullName"
                name="fullName"
                className={`pl-10 text-xs h-11 ${
                  touched.fullName && errors.fullName
                    ? "border-destructive ring-1 ring-destructive"
                    : ""
                }`}
                placeholder="Enter full name"
              />
            </div>
            <ErrorMessage
              name="fullName"
              component="div"
              className="text-xs text-destructive mt-1 flex items-center gap-1 font-semibold"
            />
          </div>

          {/* Email Address */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-1.5">
              Business Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Mail className="w-4 h-4" />
              </div>
              <Field
                as={Input}
                type="email"
                id="email"
                name="email"
                className={`pl-10 text-xs h-11 ${
                  touched.email && errors.email
                    ? "border-destructive ring-1 ring-destructive"
                    : ""
                }`}
                placeholder="owner@store.com"
              />
            </div>
            <ErrorMessage
              name="email"
              component="div"
              className="text-xs text-destructive mt-1 flex items-center gap-1 font-semibold"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Lock className="w-4 h-4" />
              </div>
              <Field
                as={Input}
                type="password"
                id="password"
                name="password"
                className={`pl-10 text-xs h-11 ${
                  touched.password && errors.password
                    ? "border-destructive ring-1 ring-destructive"
                    : ""
                }`}
                placeholder="At least 6 characters"
              />
            </div>
            <ErrorMessage
              name="password"
              component="div"
              className="text-xs text-destructive mt-1 flex items-center gap-1 font-semibold"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-foreground mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Lock className="w-4 h-4" />
              </div>
              <Field
                as={Input}
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className={`pl-10 text-xs h-11 ${
                  touched.confirmPassword && errors.confirmPassword
                    ? "border-destructive ring-1 ring-destructive"
                    : ""
                }`}
                placeholder="Repeat password"
              />
            </div>
            <ErrorMessage
              name="confirmPassword"
              component="div"
              className="text-xs text-destructive mt-1 flex items-center gap-1 font-semibold"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <Button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="w-full h-11 text-xs font-bold gap-2"
            >
              Continue to Store Details
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default OwnerDetailsForm;