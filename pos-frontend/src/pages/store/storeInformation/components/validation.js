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
      .matches(/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number")
      .required("Phone number is required"),
    email: Yup.string()
      .email("Please enter a valid email address")
      .required("Email is required"),
  }),
  gstNumber: Yup.string()
    .nullable()
    .notRequired()
    .matches(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      "GST number must be 15 chars: 2 digits + 5 letters + 4 digits + 1 letter + 1 alphanumeric + Z + 1 alphanumeric"
    ),
  panNumber: Yup.string()
    .nullable()
    .notRequired()
    .matches(
      /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
      "PAN number must be 10 chars: 5 letters + 4 digits + 1 letter"
    ),
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