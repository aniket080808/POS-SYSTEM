import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useDispatch, useSelector } from "react-redux";
import { createProduct, updateProduct } from "@/Redux Toolkit/features/product/productThunks";
import { toast } from "@/components/ui/use-toast";
import { getCategoriesByStore } from "../../../Redux Toolkit/features/category/categoryThunks";
import { uploadToCloudinary } from "../../../utils/uploadToCloudinary";
import { Loader2, Check, Upload, X } from "lucide-react";

const validationSchema = Yup.object({
  name: Yup.string().trim().min(2, "Product name must be at least 2 characters").required("Product name is required"),
  sku: Yup.string().trim().min(2, "SKU identifier is required").required("SKU is required"),
  mrp: Yup.number().required("MRP price is required").positive("MRP must be positive"),
  sellingPrice: Yup.number()
    .required("Selling price is required")
    .positive("Selling price must be positive")
    .test("selling-price-mrp", "Selling price cannot exceed MRP", function (value) {
      const { mrp } = this.parent;
      if (value != null && mrp != null) {
        return value <= mrp;
      }
      return true;
    }),
  stock: Yup.number().nullable().integer("Stock must be an integer").min(0, "Stock cannot be negative").default(0),
  categoryId: Yup.string().required("Category selection is required"),
  description: Yup.string().optional(),
  brand: Yup.string().optional(),
  color: Yup.string().optional(),
  image: Yup.string().optional(),
});

const ProductForm = ({ initialValues, onSubmit, onCancel, isEditing = false }) => {
  const dispatch = useDispatch();
  const { categories = [] } = useSelector((state) => state.category);
  const { store } = useSelector((state) => state.store);
  const { userProfile } = useSelector((state) => state.user);
  const [uploadingImage, setUploadingImage] = useState(false);

  const activeStoreId = store?.id || userProfile?.storeId || userProfile?.store?.id;

  useEffect(() => {
    if (activeStoreId && categories.length === 0) {
      const token = localStorage.getItem("jwt");
      dispatch(getCategoriesByStore({ storeId: activeStoreId, token }));
    }
  }, [dispatch, activeStoreId, categories.length]);

  const defaultValues = {
    name: initialValues?.name || "",
    sku: initialValues?.sku || "",
    mrp: initialValues?.mrp || "",
    sellingPrice: initialValues?.sellingPrice || "",
    stock: initialValues?.stock != null ? initialValues.stock : 0,
    categoryId: initialValues?.category?.id ? String(initialValues.category.id) : initialValues?.categoryId ? String(initialValues.categoryId) : "",
    description: initialValues?.description || "",
    brand: initialValues?.brand || "",
    color: initialValues?.color || "",
    image: initialValues?.image || "",
  };

  const handleImageUpload = async (e, setFieldValue) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadToCloudinary(file);
      setFieldValue("image", url);
      toast({ title: "Image Uploaded", description: "Product image uploaded successfully." });
    } catch (err) {
      toast({ title: "Upload Failed", description: "Could not upload image.", variant: "destructive" });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const targetStoreId = activeStoreId || initialValues?.storeId;
      const payload = {
        ...values,
        storeId: targetStoreId,
        mrp: Number(values.mrp),
        sellingPrice: Number(values.sellingPrice),
        stock: Number(values.stock || 0),
        categoryId: Number(values.categoryId),
      };

      if (isEditing && initialValues?.id) {
        await dispatch(updateProduct({ id: initialValues.id, productData: payload })).unwrap();
        toast({ title: "Product Updated", description: `Product "${values.name}" updated successfully.` });
      } else {
        await dispatch(createProduct(payload)).unwrap();
        toast({ title: "Product Created", description: `Product "${values.name}" added to catalog.` });
      }
      onSubmit();
    } catch (err) {
      toast({
        title: "Action Failed",
        description: err || `Failed to ${isEditing ? "update" : "create"} product.`,
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
      {({ isSubmitting, errors, touched, values, setFieldValue }) => (
        <Form className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="prod-name" className="text-sm font-semibold text-foreground">
                Product Title *
              </Label>
              <Field
                as={Input}
                id="prod-name"
                name="name"
                placeholder="e.g. Organic Almond Milk 1L"
                className={`text-xs h-10 ${errors.name && touched.name ? "border-destructive" : ""}`}
              />
              <ErrorMessage name="name" component="div" className="text-destructive text-xs font-semibold mt-1" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prod-sku" className="text-sm font-semibold text-foreground">
                SKU / Barcode ID *
              </Label>
              <Field
                as={Input}
                id="prod-sku"
                name="sku"
                placeholder="e.g. BEV-ALM-1001"
                className={`text-xs h-10 font-mono ${errors.sku && touched.sku ? "border-destructive" : ""}`}
              />
              <ErrorMessage name="sku" component="div" className="text-destructive text-xs font-semibold mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="prod-mrp" className="text-sm font-semibold text-foreground">
                MRP (₹) *
              </Label>
              <Field
                as={Input}
                id="prod-mrp"
                name="mrp"
                type="number"
                step="0.01"
                placeholder="250.00"
                className={`text-xs h-10 font-mono ${errors.mrp && touched.mrp ? "border-destructive" : ""}`}
              />
              <ErrorMessage name="mrp" component="div" className="text-destructive text-xs font-semibold mt-1" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prod-selling" className="text-sm font-semibold text-foreground">
                Selling Price (₹) *
              </Label>
              <Field
                as={Input}
                id="prod-selling"
                name="sellingPrice"
                type="number"
                step="0.01"
                placeholder="220.00"
                className={`text-xs h-10 font-mono ${errors.sellingPrice && touched.sellingPrice ? "border-destructive" : ""}`}
              />
              <ErrorMessage name="sellingPrice" component="div" className="text-destructive text-xs font-semibold mt-1" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prod-stock" className="text-sm font-semibold text-foreground">
                Stock Quantity *
              </Label>
              <Field
                as={Input}
                id="prod-stock"
                name="stock"
                type="number"
                placeholder="50"
                className={`text-xs h-10 font-mono ${errors.stock && touched.stock ? "border-destructive" : ""}`}
              />
              <ErrorMessage name="stock" component="div" className="text-destructive text-xs font-semibold mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="prod-category" className="text-sm font-semibold text-foreground">
                Category *
              </Label>
              <Select
                value={values.categoryId}
                onValueChange={(val) => setFieldValue("categoryId", val)}
              >
                <SelectTrigger id="prod-category" className="text-xs h-10">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ErrorMessage name="categoryId" component="div" className="text-destructive text-xs font-semibold mt-1" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prod-brand" className="text-sm font-semibold text-foreground">
                Brand / Manufacturer
              </Label>
              <Field
                as={Input}
                id="prod-brand"
                name="brand"
                placeholder="e.g. Nestlé"
                className="text-xs h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prod-color" className="text-sm font-semibold text-foreground">
                Variant / Color
              </Label>
              <Field
                as={Input}
                id="prod-color"
                name="color"
                placeholder="e.g. Vanilla / 500ml"
                className="text-xs h-10"
              />
            </div>
          </div>

          {/* Image & Media Section */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-secondary/30 border border-border/70">
            <div className="flex items-center justify-between">
              <Label htmlFor="prod-image-url" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <span>Product Image URL / Photo Link</span>
              </Label>
              <span className="text-[11px] text-muted-foreground">Direct link or upload from device</span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Live Preview Box */}
              {values.image ? (
                <div className="relative w-16 h-16 shrink-0 rounded-xl border border-border overflow-hidden group bg-card shadow-xs">
                  <img
                    src={values.image}
                    alt="Product"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=60";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setFieldValue("image", "")}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 shrink-0 rounded-xl border border-dashed border-border/80 flex flex-col items-center justify-center text-muted-foreground/60 bg-card">
                  <Upload className="w-5 h-5 mb-0.5 opacity-50" />
                  <span className="text-[9px]">Preview</span>
                </div>
              )}

              {/* Direct Image URL Input */}
              <div className="flex-1 space-y-1">
                <Field
                  as={Input}
                  id="prod-image-url"
                  name="image"
                  placeholder="Paste direct image link (e.g. https://images.unsplash.com/...)"
                  className="text-xs h-10 bg-card font-mono"
                />
              </div>

              {/* Cloudinary File Upload Button */}
              <label className="flex items-center justify-center gap-2 px-3.5 h-10 border border-border bg-card rounded-xl cursor-pointer hover:bg-secondary/70 text-xs font-bold text-foreground transition-colors shrink-0 shadow-2xs">
                {uploadingImage ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#B8860B]" />
                ) : (
                  <Upload className="w-4 h-4 text-[#B8860B]" />
                )}
                <span>{uploadingImage ? "Uploading..." : "Upload Photo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, setFieldValue)}
                  className="hidden"
                />
              </label>
            </div>
            <ErrorMessage name="image" component="div" className="text-destructive text-xs font-semibold mt-1" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prod-description" className="text-sm font-semibold text-foreground">
              Description (Optional)
            </Label>
            <Field
              as={Textarea}
              id="prod-description"
              name="description"
              placeholder="Product details, ingredients, or warranty specifications..."
              rows={2}
              className="text-xs bg-card resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border/60">
            <Button type="button" variant="outline" onClick={onCancel} className="text-xs h-10">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="text-xs font-bold h-10 gap-1.5">
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {isEditing ? "Save Product" : "Create Product"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ProductForm;
