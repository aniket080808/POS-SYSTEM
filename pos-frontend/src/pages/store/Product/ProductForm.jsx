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
import {
  createProduct,
  updateProduct,
} from "@/Redux Toolkit/features/product/productThunks";
import { toast } from "@/components/ui/use-toast";
import { getCategoriesByStore } from "../../../Redux Toolkit/features/category/categoryThunks";
import { Upload, X, Loader2, Save, Image as ImageIcon } from "lucide-react";
import { uploadToCloudinary } from "../../../utils/uploadToCloudinary";

const validationSchema = Yup.object({
  name: Yup.string().trim().min(2, "Product name must be at least 2 characters").required("Product name is required"),
  sku: Yup.string().trim().min(2, "SKU must be at least 2 characters").required("SKU is required"),
  mrp: Yup.number()
    .required("MRP is required")
    .positive("MRP must be positive"),
  sellingPrice: Yup.number()
    .required("Selling price is required")
    .positive("Selling price must be positive")
    .test('selling-price-mrp', 'Selling price cannot exceed MRP', function(value) {
      const { mrp } = this.parent;
      if (value != null && mrp != null) {
        return value <= mrp;
      }
      return true;
    }),
  stock: Yup.number()
    .nullable()
    .integer("Stock must be an integer")
    .min(0, "Stock must be 0 or greater")
    .default(0),
  categoryId: Yup.string().required("Category is required"),
  description: Yup.string().optional(),
  brand: Yup.string().optional(),
  color: Yup.string().optional(),
  image: Yup.string().optional(),
});

const ProductForm = ({
  initialValues,
  onSubmit,
  onCancel,
  isEditing = false,
}) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.product || {});
  const { store } = useSelector((state) => state.store || {});
  const { categories: categoryList = [] } = useSelector((state) => state.category || {});
  const [uploadingImage, setUploadingImage] = useState(false);

  const defaultValues = {
    name: initialValues?.name || "",
    sku: initialValues?.sku || "",
    description: initialValues?.description || "",
    mrp: initialValues?.mrp ?? "",
    sellingPrice: initialValues?.sellingPrice ?? "",
    stock: initialValues?.stock !== undefined && initialValues?.stock !== null ? String(initialValues.stock) : "0",
    brand: initialValues?.brand || "",
    categoryId: initialValues?.categoryId ? String(initialValues.categoryId) : (initialValues?.category?.id ? String(initialValues.category.id) : ""),
    color: initialValues?.color || "",
    image: initialValues?.image || null,
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const token = localStorage.getItem("jwt");
      const dto = {
        ...values,
        mrp: parseFloat(values.mrp),
        sellingPrice: parseFloat(values.sellingPrice),
        stock: values.stock === "" ? 0 : parseInt(values.stock, 10),
        storeId: store?.id,
        categoryId: parseInt(values.categoryId),
      };

      if (isEditing && initialValues?.id) {
        await dispatch(
          updateProduct({ id: initialValues.id, dto, token })
        ).unwrap();
        toast({
          title: "Product Updated",
          description: "Inventory details saved successfully.",
        });
      } else {
        await dispatch(createProduct(dto)).unwrap();
        toast({ title: "Product Created", description: "Product registered successfully in catalog." });
        resetForm();
      }

      if (onSubmit) onSubmit();
    } catch (err) {
      toast({
        title: "Error",
        description: err || `Failed to ${isEditing ? "update" : "add"} product`,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (store?.id && token) {
      dispatch(getCategoriesByStore({ storeId: store.id, token }));
    }
  }, [dispatch, store?.id]);

  const handleImageChange = async (e, setFieldValue) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const image = await uploadToCloudinary(file);
      setFieldValue("image", image);
    } catch (err) {
      toast({ title: "Upload Failed", description: "Failed to upload product image.", variant: "destructive" });
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <Formik
      initialValues={defaultValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ isSubmitting, touched, errors, values, setFieldValue }) => (
        <Form className="space-y-4 pt-2">
          {/* Image Upload Banner */}
          <div className="flex items-center gap-3">
            {!values.image ? (
              <>
                <input
                  type="file"
                  accept="image/*"
                  id="productFileInput"
                  style={{ display: "none" }}
                  onChange={(e) => handleImageChange(e, setFieldValue)}
                />
                <label
                  htmlFor="productFileInput"
                  className="w-20 h-20 rounded-2xl border-2 border-dashed border-border/80 hover:border-primary cursor-pointer flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors bg-muted/20"
                >
                  {uploadingImage ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-semibold">Photo</span>
                    </>
                  )}
                </label>
              </>
            ) : (
              <div className="relative group w-20 h-20 rounded-2xl overflow-hidden border border-border/60">
                <img
                  className="w-full h-full object-cover"
                  src={values.image}
                  alt="Product preview"
                />
                <Button
                  type="button"
                  onClick={() => setFieldValue("image", null)}
                  size="icon"
                  variant="destructive"
                  className="absolute top-1 right-1 h-5 w-5 rounded-md"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
            <div className="space-y-1 flex-1">
              <Label htmlFor="image" className="text-xs font-semibold text-foreground">Or Direct Image URL</Label>
              <Field
                as={Input}
                id="image"
                name="image"
                placeholder="https://cdn.example.com/item.jpg"
                className="h-8 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="name" className="text-xs font-semibold text-foreground">Product Title *</Label>
              <Field
                as={Input}
                id="name"
                name="name"
                placeholder="e.g. Organic Roast Coffee Beans 250g"
                className={`h-9 rounded-xl text-xs ${touched.name && errors.name ? "border-destructive" : ""}`}
              />
              <ErrorMessage name="name" component="div" className="text-destructive text-[11px] font-medium mt-1" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sku" className="text-xs font-semibold text-foreground">SKU / Barcode *</Label>
              <Field
                as={Input}
                id="sku"
                name="sku"
                placeholder="e.g. BEV-COF-001"
                className={`h-9 rounded-xl text-xs font-mono ${touched.sku && errors.sku ? "border-destructive" : ""}`}
              />
              <ErrorMessage name="sku" component="div" className="text-destructive text-[11px] font-medium mt-1" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="brand" className="text-xs font-semibold text-foreground">Brand / Manufacturer</Label>
              <Field
                as={Input}
                id="brand"
                name="brand"
                placeholder="e.g. Roaster's Choice"
                className="h-9 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="categoryId" className="text-xs font-semibold text-foreground">Category *</Label>
              <Field name="categoryId">
                {({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => setFieldValue("categoryId", value)}
                  >
                    <SelectTrigger
                      className={`h-9 rounded-xl text-xs w-full ${
                        touched.categoryId && errors.categoryId ? "border-destructive" : ""
                      }`}
                    >
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl text-xs">
                      {categoryList.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </Field>
              <ErrorMessage name="categoryId" component="div" className="text-destructive text-[11px] font-medium mt-1" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="color" className="text-xs font-semibold text-foreground">Variant / Color</Label>
              <Field
                as={Input}
                id="color"
                name="color"
                placeholder="e.g. Dark Roast, Black"
                className="h-9 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="mrp" className="text-xs font-semibold text-foreground">MRP (List) *</Label>
              <Field
                as={Input}
                id="mrp"
                name="mrp"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className={`h-9 rounded-xl text-xs font-mono ${touched.mrp && errors.mrp ? "border-destructive" : ""}`}
              />
              <ErrorMessage name="mrp" component="div" className="text-destructive text-[11px] font-medium mt-1" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sellingPrice" className="text-xs font-semibold text-foreground">Selling Price *</Label>
              <Field
                as={Input}
                id="sellingPrice"
                name="sellingPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className={`h-9 rounded-xl text-xs font-mono ${touched.sellingPrice && errors.sellingPrice ? "border-destructive" : ""}`}
              />
              <ErrorMessage name="sellingPrice" component="div" className="text-destructive text-[11px] font-medium mt-1" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stock" className="text-xs font-semibold text-foreground">Opening Stock</Label>
              <Field
                as={Input}
                id="stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                className={`h-9 rounded-xl text-xs font-mono ${touched.stock && errors.stock ? "border-destructive" : ""}`}
              />
              <ErrorMessage name="stock" component="div" className="text-destructive text-[11px] font-medium mt-1" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-semibold text-foreground">Description & Notes</Label>
            <Field
              as={Textarea}
              id="description"
              name="description"
              placeholder="Product specs, ingredients, or retail features"
              rows={2}
              className="rounded-xl text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border/60">
            {onCancel && (
              <Button type="button" variant="outline" size="sm" onClick={onCancel} className="rounded-xl text-xs font-semibold h-9">
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              className="rounded-xl text-xs font-semibold h-9 gap-1.5"
              disabled={isSubmitting || loading || uploadingImage}
            >
              {isSubmitting || loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isEditing ? "Updating..." : "Creating..."}</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{isEditing ? "Save Product SKU" : "Register Product"}</span>
                </>
              )}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ProductForm;

