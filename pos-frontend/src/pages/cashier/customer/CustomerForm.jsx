import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDispatch, useSelector } from "react-redux";
import { createCustomer } from "@/Redux Toolkit/features/customer/customerThunks";
import { toast } from "sonner";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { UserPlus, Loader2 } from "lucide-react";

const CustomerForm = ({
  showCustomerForm,
  setShowCustomerForm,
}) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.customer);

  const validationSchema = Yup.object({
    fullName: Yup.string()
      .required("Full name is required")
      .min(2, "Full name must be at least 2 characters")
      .max(50, "Full name must be less than 50 characters"),
    phone: Yup.string()
      .required("Phone number is required")
      .matches(/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"),
    email: Yup.string().email("Please enter a valid email address").optional(),
  });

  const initialValues = {
    fullName: "",
    email: "",
    phone: "",
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await dispatch(createCustomer(values)).unwrap();
      toast.success("Customer registered successfully.");
      resetForm();
      setShowCustomerForm(false);
    } catch (error) {
      toast.error(error || "Failed to create customer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowCustomerForm(false);
  };

  return (
    <Dialog open={showCustomerForm} onOpenChange={setShowCustomerForm}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader className="pb-3 border-b border-border/60">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#B8860B]" />
            Register Customer Profile
          </DialogTitle>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="space-y-4 py-2">
              <div>
                <label htmlFor="fullName" className="text-sm font-semibold text-foreground mb-1.5 block">
                  Customer Full Name <span className="text-destructive">*</span>
                </label>
                <Field
                  as={Input}
                  id="fullName"
                  name="fullName"
                  placeholder="e.g. Rahul Sharma"
                  className={`text-xs h-10 ${
                    errors.fullName && touched.fullName ? "border-destructive ring-1 ring-destructive" : ""
                  }`}
                />
                <ErrorMessage
                  name="fullName"
                  component="p"
                  className="text-xs text-destructive mt-1 font-medium"
                />
              </div>

              <div>
                <label htmlFor="phone" className="text-sm font-semibold text-foreground mb-1.5 block">
                  Contact Phone Number <span className="text-destructive">*</span>
                </label>
                <Field
                  as={Input}
                  id="phone"
                  name="phone"
                  placeholder="e.g. +91 9876543210"
                  className={`text-xs h-10 font-mono ${
                    errors.phone && touched.phone ? "border-destructive ring-1 ring-destructive" : ""
                  }`}
                />
                <ErrorMessage
                  name="phone"
                  component="p"
                  className="text-xs text-destructive mt-1 font-medium"
                />
              </div>

              <div>
                <label htmlFor="email" className="text-sm font-semibold text-foreground mb-1.5 block">
                  Email Address (Optional)
                </label>
                <Field
                  as={Input}
                  id="email"
                  name="email"
                  type="email"
                  placeholder="e.g. rahul@example.com"
                  className={`text-xs h-10 ${
                    errors.email && touched.email ? "border-destructive ring-1 ring-destructive" : ""
                  }`}
                />
                <ErrorMessage
                  name="email"
                  component="p"
                  className="text-xs text-destructive mt-1 font-medium"
                />
              </div>

              <DialogFooter className="gap-2 pt-3 border-t border-border/60">
                <Button variant="outline" size="sm" onClick={handleCancel} type="button" className="text-xs h-10">
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting || loading} className="text-xs font-bold h-10 gap-1.5">
                  {isSubmitting || loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  {isSubmitting || loading ? "Registering..." : "Save Customer"}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerForm;
