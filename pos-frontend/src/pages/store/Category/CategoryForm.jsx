import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useDispatch, useSelector } from "react-redux";
import { createCategory, updateCategory } from "@/Redux Toolkit/features/category/categoryThunks";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Check } from "lucide-react";

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must be less than 100 characters")
    .required("Category name is required"),
  description: Yup.string()
    .trim()
    .max(500, "Description must be less than 500 characters")
    .optional(),
});

const CategoryForm = ({ initialValues, onSubmit, onCancel, isEditing = false }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.category);
  const { store } = useSelector((state) => state.store);

  const defaultValues = {
    name: initialValues?.name || "",
    description: initialValues?.description || "",
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const token = localStorage.getItem("jwt");
      const dto = {
        ...values,
        storeId: store.id,
      };

      if (isEditing && initialValues?.id) {
        await dispatch(updateCategory({ id: initialValues.id, dto, token })).unwrap();
        toast({ title: "Category Updated", description: `Category "${values.name}" updated successfully.` });
      } else {
        await dispatch(createCategory({ dto, token })).unwrap();
        toast({ title: "Category Added", description: `Category "${values.name}" added to catalog.` });
        resetForm();
      }

      if (onSubmit) onSubmit();
    } catch (err) {
      toast({
        title: "Action Failed",
        description: err || `Failed to ${isEditing ? "update" : "add"} category.`,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={defaultValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ isSubmitting, errors, touched }) => (
        <Form className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="category-name" className="text-sm font-semibold text-foreground">
              Category Title *
            </Label>
            <Field
              as={Input}
              id="category-name"
              name="name"
              placeholder="e.g. Beverages, Dairy, Electronics"
              className={`text-xs h-10 ${errors.name && touched.name ? "border-destructive" : ""}`}
            />
            <ErrorMessage name="name" component="div" className="text-destructive text-xs font-semibold mt-1" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category-description" className="text-sm font-semibold text-foreground">
              Description (Optional)
            </Label>
            <Field
              as={Textarea}
              id="category-description"
              name="description"
              placeholder="Brief summary of items within this department..."
              rows={3}
              className="text-xs bg-card resize-none"
            />
            <ErrorMessage name="description" component="div" className="text-destructive text-xs font-semibold mt-1" />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="text-xs h-10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || loading}
              className="text-xs font-bold h-10 gap-1.5"
            >
              {isSubmitting || loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {isEditing ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default CategoryForm;