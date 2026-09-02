import { Outlet, useNavigate } from "react-router";

import { useToast } from "@/components/ui/use-toast";
import {
 
  ShoppingCartIcon,
  ClockIcon,
  RotateCcwIcon,
  UsersIcon,
  ReceiptIcon,
} from "lucide-react";
import CashierSideBar from "./Sidebar/CashierSideBar";
import { SidebarProvider } from "../../context/SidebarProvider";
import { useSidebar } from "../../context/hooks/useSidebar";

const navItems = [
  {
    path: "/cashier",
    icon: <ShoppingCartIcon size={20} />,
    label: "POS Terminal",
  },
  {
    path: "/cashier/orders",
    icon: <ClockIcon size={20} />,
    label: "Order History",
  },
  {
    path: "/cashier/returns",
    icon: <RotateCcwIcon size={20} />,
    label: "Returns/Refunds",
  },
  {
    path: "/cashier/customers",
    icon: <UsersIcon size={20} />,
    label: "Customers",
  },
  {
    path: "/cashier/shift-summary",
    icon: <ReceiptIcon size={20} />,
    label: "Shift Summary",
  },
];

const LayoutContent  = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {sidebarOpen, setSidebarOpen}=useSidebar();


  const handleLogout = () => {
    toast({
      title: "Preparing Shift Summary",
      description: "Redirecting to shift summary page...",
    });
    navigate("/cashier/shift-summary");
  };



  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Desktop docked, Mobile slide-in drawer) */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-50 md:z-auto h-full shrink-0 transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <CashierSideBar
          navItems={navItems}
          handleLogout={handleLogout}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

const CashierDashboardLayout = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default CashierDashboardLayout;
