import React from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../../Redux Toolkit/features/user/userThunks";
import {
  LayoutDashboard,
  Store,
  Users,
  ShoppingCart,
  BarChart2,
  Settings,
  FileText,
  Tag,
  Truck,
  Lock,
  BadgeDollarSign,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useToast } from "../../../components/ui/use-toast";

const navLinks = [
  {
    name: "Dashboard",
    path: "/store/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    requiresSubscription: false,
  },
  {
    name: "Stores",
    path: "/store/stores",
    icon: <Store className="w-5 h-5" />,
    requiresSubscription: true,
  },
  {
    name: "Branches",
    path: "/store/branches",
    icon: <Store className="w-5 h-5" />,
    requiresSubscription: true,
  },
  {
    name: "Products",
    path: "/store/products",
    icon: <ShoppingCart className="w-5 h-5" />,
    requiresSubscription: true,
  },
  {
    name: "Categories",
    path: "/store/categories",
    icon: <Tag className="w-5 h-5" />,
    requiresSubscription: true,
  },
  {
    name: "Employees",
    path: "/store/employees",
    icon: <Users className="w-5 h-5" />,
    requiresSubscription: true,
  },
  {
    name: "Alerts",
    path: "/store/alerts",
    icon: <Truck className="w-5 h-5" />,
    requiresSubscription: true,
  },
  {
    name: "Sales",
    path: "/store/sales",
    icon: <BarChart2 className="w-5 h-5" />,
    requiresSubscription: true,
  },
  {
    name: "Reports",
    path: "/store/reports",
    icon: <FileText className="w-5 h-5" />,
    requiresSubscription: true,
  },
  {
    name: "Upgrade Plan",
    path: "/store/upgrade",
    icon: <BadgeDollarSign className="w-5 h-5" />,
    requiresSubscription: false,
  },
  {
    name: "Settings",
    path: "/store/settings",
    icon: <Settings className="w-5 h-5" />,
    requiresSubscription: false,
  },
];

export default function StoreSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { statusResponse } = useSelector((state) => state.storeSubscription);
  const { store } = useSelector((state) => state.store);

  const regStatus = statusResponse?.registrationStatus || store?.status || 'PENDING';
  const subStatus = statusResponse?.subscriptionStatus || 'NONE';
  const isFullyActive = regStatus === 'ACTIVE' && subStatus === 'ACTIVE';

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/login");
  };

  const handleNavClick = (e, link) => {
    if (link.requiresSubscription && !isFullyActive) {
      e.preventDefault();
      toast({
        title: "Module Locked",
        description: "Active store registration and subscription required to access this module.",
        variant: "destructive",
      });
      navigate("/store/upgrade");
    }
  };

  return (
    <aside className="h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col py-6 px-4 shadow-lg">
      <div className="mb-8 text-2xl font-extrabold text-primary tracking-tight flex items-center gap-2">
        <Store className="w-7 h-7 text-primary" />
        POS Admin
      </div>
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {navLinks.map((link) => {
            const isLocked = link.requiresSubscription && !isFullyActive;
            const isActivePath = location.pathname.startsWith(link.path);

            return (
              <li key={link.name}>
                <Link
                  to={link.path}
                  onClick={(e) => handleNavClick(e, link)}
                  className={`flex items-center justify-between px-4 py-2 rounded-lg transition-colors text-base font-medium group ${
                    isActivePath
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow"
                      : isLocked
                      ? "text-sidebar-foreground/40 hover:bg-sidebar-accent/50 cursor-not-allowed"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`transition-colors ${
                        isActivePath
                          ? "text-sidebar-primary"
                          : isLocked
                          ? "text-sidebar-foreground/30"
                          : "text-sidebar-foreground/60 group-hover:text-sidebar-primary"
                      }`}
                    >
                      {link.icon}
                    </span>
                    <span>{link.name}</span>
                  </div>
                  {isLocked && <Lock className="w-4 h-4 text-amber-500/70" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto">
        <Button onClick={handleLogout} variant="" className="w-full">
          Logout
        </Button>
      </div>
    </aside>
  );
}
