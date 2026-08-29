import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '../../components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, User, Mail, Lock, AlertCircle } from 'lucide-react';

const validationSchema = Yup.object({
  fullName: Yup.string()
    .required('Full name is required')
    .min(2, 'Full name must be at least 2 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const OwnerDetailsForm = ({ initialValues, onSubmit, onBack }) => {
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
          {/* Full Name Field */}
          <div>
            <label htmlFor="fullName" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Owner Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <User className="h-4 w-4" />
              </div>
              <Field
                as={Input}
                type="text"
                id="fullName"
                name="fullName"
                className={`pl-10 h-11 rounded-xl ${
                  touched.fullName && errors.fullName ? 'border-destructive' : ''
                }`}
                placeholder="e.g. John Doe"
              />
            </div>
            <ErrorMessage name="fullName" component="div" className="text-destructive text-xs mt-1.5 flex items-center">
              {msg => (
                <>
                  <AlertCircle className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                  {msg}
                </>
              )}
            </ErrorMessage>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Work Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Mail className="h-4 w-4" />
              </div>
              <Field
                as={Input}
                type="email"
                id="email"
                name="email"
                className={`pl-10 h-11 rounded-xl ${
                  touched.email && errors.email ? 'border-destructive' : ''
                }`}
                placeholder="owner@store.com"
              />
            </div>
            <ErrorMessage name="email" component="div" className="text-destructive text-xs mt-1.5 flex items-center">
              {msg => (
                <>
                  <AlertCircle className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                  {msg}
                </>
              )}
            </ErrorMessage>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Lock className="h-4 w-4" />
              </div>
              <Field
                as={Input}
                type="password"
                id="password"
                name="password"
                className={`pl-10 h-11 rounded-xl ${
                  touched.password && errors.password ? 'border-destructive' : ''
                }`}
                placeholder="At least 6 characters"
              />
            </div>
            <ErrorMessage name="password" component="div" className="text-destructive text-xs mt-1.5 flex items-center">
              {msg => (
                <>
                  <AlertCircle className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                  {msg}
                </>
              )}
            </ErrorMessage>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Lock className="h-4 w-4" />
              </div>
              <Field
                as={Input}
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className={`pl-10 h-11 rounded-xl ${
                  touched.confirmPassword && errors.confirmPassword ? 'border-destructive' : ''
                }`}
                placeholder="Re-enter password"
              />
            </div>
            <ErrorMessage name="confirmPassword" component="div" className="text-destructive text-xs mt-1.5 flex items-center">
              {msg => (
                <>
                  <AlertCircle className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                  {msg}
                </>
              )}
            </ErrorMessage>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="w-full h-11 text-sm font-semibold rounded-xl gap-2"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <>
                  <span>Continue to Store Setup</span>
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

export default OwnerDetailsForm;
 