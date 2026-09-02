import * as Yup from "yup";

// Validation schema for store information
export const StoreValidationSchema = Yup.object().shape({
  brand: Yup.string()
    .min(2, "Store name must be at least 2 characters")
    .max(100, "Store name must be less than 100 characters")
    .required("Store name is required"),
  description: Yup.string()
    .max(500, "Description must be less than 500 characters"),
  storeType: Yup.string()
    .required("Store type is required"),
  contact: Yup.object().shape({
    address: Yup.string()
      .min(10, "Address must be at least 10 characters")
      .max(200, "Address must be less than 200 characters")
      .required("Address is required"),
    phone: Yup.string()
      .matches(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]{6,15}$/, "Please enter a valid phone number")
      .required("Phone number is required"),
    email: Yup.string()
      .email("Please enter a valid email address")
      .required("Email is required"),
  }),
  gstNumber: Yup.string()
    .nullable()
    .notRequired()
    .transform((value) => (!value || value.trim() === "" ? null : value.trim()))
    .test("gst-format", "GST number must be 15 characters (e.g. 27AAAAA0000A1Z5)", (val) => {
      if (!val) return true;
      return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val);
    }),
  panNumber: Yup.string()
    .nullable()
    .notRequired()
    .transform((value) => (!value || value.trim() === "" ? null : value.trim()))
    .test("pan-format", "PAN number must be 10 characters (e.g. ABCDE1234F)", (val) => {
      if (!val) return true;
      return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val);
    }),
});

// Store type options for the select dropdown
export const STORE_TYPE_OPTIONS = [
  { value: "Retail Store", label: "Retail Store" },
  { value: "Supermarket", label: "Supermarket" },
  { value: "Mall", label: "Mall" },
  { value: "Department Store", label: "Department Store" },
  { value: "Convenience Store", label: "Convenience Store" },
  { value: "Specialty Store", label: "Specialty Store" },
]; 