import React from "react";
import { Routes, Route } from "react-router";

// Import Store Admin/Manager pages
import StoreDashboard from "../pages/store/Dashboard/StoreDashboard";
import Branches from "../pages/store/Branch/Branches";
import Categories from "../pages/store/Category/Categories";
// import Employees from "../pages/store/Employee/StoreEmployees";
import Products from "../pages/store/Product/Products";
import { Dashboard } from "../pages/store/Dashboard";
import {
  Reports,
  Sales,
  Settings

} from "../pages/store/store-admin";
import StoreEmployees from "../pages/store/Employee/StoreEmployees";
import Stores from "../pages/store/storeInformation/Stores";
import PricingSection from "../pages/common/Landing/PricingSection";
import Upgrade from "../pages/store/upgrade/Upgrade";
import Alerts from "../pages/store/Alerts/Alerts";
import ProtectedStoreRoute from "./ProtectedStoreRoute";

const StoreRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<StoreDashboard />}>
        {/* Always accessible routes */}
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="upgrade" element={<Upgrade />} />
        <Route path="settings" element={<Settings />} />

        {/* Protected routes — require registration approved + subscription active */}
        <Route path="branches" element={<ProtectedStoreRoute><Branches /></ProtectedStoreRoute>} />
        <Route path="categories" element={<ProtectedStoreRoute><Categories /></ProtectedStoreRoute>} />
        <Route path="employees" element={<ProtectedStoreRoute><StoreEmployees /></ProtectedStoreRoute>} />
        <Route path="products" element={<ProtectedStoreRoute><Products /></ProtectedStoreRoute>} />
        <Route path="stores" element={<ProtectedStoreRoute><Stores /></ProtectedStoreRoute>} />
        <Route path="sales" element={<ProtectedStoreRoute><Sales /></ProtectedStoreRoute>} />
        <Route path="reports" element={<ProtectedStoreRoute><Reports /></ProtectedStoreRoute>} />
        <Route path="alerts" element={<ProtectedStoreRoute><Alerts /></ProtectedStoreRoute>} />
        {/* Add more store-specific routes here as needed */}
      </Route>
    </Routes>
  );
};

export default StoreRoutes;

