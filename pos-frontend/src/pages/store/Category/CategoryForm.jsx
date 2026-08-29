import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useDispatch, useSelector } from 'react-redux';
import { createCategory, updateCategory } from '@/Redux Toolkit/features/category/categoryThunks';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Save } from 'lucide-react';

const validationSchema = Yup.object({
  name: Yup.string().trim().min(2, 'Category name must be at least 2 characters').max(100, 'Category name must be less than 100 characters').required('Category name is required'),
  description: Yup.string().trim().max(500, 'Description must be less than 500 characters').optional(),
});

const CategoryForm = ({ initialValues, onSubmit, onCancel, isEditing = false }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.category || {});
  const { store } = useSelector((state) => state.store || {});

  const defaultValues = {
    name: initialValues?.name || '',
    description: initialValues?.description || '',
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const token = localStorage.getItem('jwt');
      const dto = {
        ...values,
        storeId: store.id,
      };

      if (isEditing && initialValues?.id) {
        await dispatch(updateCategory({ id: initialValues.id, dto, token })).unwrap();
        toast({ title: 'Success', description: 'Category updated successfully' });
      } else {
        await dispatch(createCategory({ dto, token })).unwrap();
        toast({ title: 'Success', description: 'Category added successfully' });
        resetForm();
      }

      if (onSubmit) onSubmit();
    } catch (err) {
      toast({ 
        title: 'Error', 
        description: err || `Failed to ${isEditing ? 'update' : 'add'} category`, 
        variant: 'destructive' 
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
      {({ isSubmitting, touched, errors }) => (
        <Form className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold text-foreground">Category Name *</Label>
            <Field
              as={Input}
              id="name"
              name="name"
              placeholder="e.g. Beverages, Electronics, Bakery"
              className={`h-9 rounded-xl text-xs ${touched.name && errors.name ? 'border-destructive' : ''}`}
            />
            <ErrorMessage name="name" component="div" className="text-destructive text-[11px] font-medium mt-1" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-semibold text-foreground">Description (Optional)</Label>
            <Field
              as={Textarea}
              id="description"
              name="description"
              placeholder="Brief description of items grouped in this category"
              rows={3}
              className="rounded-xl text-xs"
            />
            <ErrorMessage name="description" component="div" className="text-destructive text-[11px] font-medium mt-1" />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border/60">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancel}
                className="rounded-xl text-xs font-semibold h-9"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              className="rounded-xl text-xs font-semibold h-9 gap-1.5"
              disabled={isSubmitting || loading}
            >
              {isSubmitting || loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isEditing ? 'Saving...' : 'Adding...'}</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Update Category' : 'Add Category'}</span>
                </>
              )}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default CategoryForm;