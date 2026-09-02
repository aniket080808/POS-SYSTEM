import React from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { getBranchById } from "../../../Redux Toolkit/features/branch/branchThunks";
import { Button } from "../../../components/ui/button";
import { LogOut, X, ShoppingBag, ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { logout } from "../../../Redux Toolkit/features/user/userThunks";
import BranchInfo from "./BranchInfo";
import NexPOSLogo from "@/components/common/NexPOSLogo";

const CashierSideBar = ({ navItems, onClose }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { userProfile } = useSelector((state) => state.user);
  const { branch } = useSelector((state) => state.branch);
  const navigate = useNavigate();

  useEffect(() => {
    if (userProfile && userProfile.branchId && !branch) {
      dispatch(
        getBranchById({
          id: userProfile.branchId,
          jwt: localStorage.getItem("jwt"),
        })
      );
    }
  }, [dispatch, userProfile, branch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <div className="w-64 md:w-48 lg:w-52 border-r border-[#383532] bg-[#262422] text-white p-3 lg:p-3.5 flex flex-col h-full relative shadow-xl shrink-0 select-none">
      {/* Close Button (Mobile Only) */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden absolute top-3 right-3 h-7 w-7 rounded-xl hover:bg-[#33302D] text-[#A8A29E] hover:text-white"
        onClick={onClose}
        aria-label="Close sidebar"
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Brand Header */}
      <div className="px-1.5 py-2 mb-2">
        <NexPOSLogo size="sm" subtitle="Terminal" />
      </div>

      {/* Navigation Links */}
      <nav className="space-y-0.5 flex-1 overflow-y-auto pr-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? "bg-[#C9A227] text-[#262422] font-bold shadow-xs"
                  : "text-[#D6D3D1] hover:bg-[#33302D] hover:text-white"
              }`}
              onClick={() => {
                if (onClose) onClose();
              }}
            >
              <span className={isActive ? "text-[#262422]" : "text-[#A8A29E]"}>
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Branch Info Card */}
      <div className="pt-1">
        <BranchInfo />
      </div>

      {/* Return to Admin Console */}
      {userProfile?.role && userProfile.role !== "ROLE_BRANCH_CASHIER" && (
        <Button
          variant="outline"
          className="w-full justify-start text-[#C9A227] border-[#C9A227]/40 hover:bg-[#C9A227]/10 font-bold text-xs h-8 rounded-xl transition-colors gap-1.5 cursor-pointer px-2.5 mt-2"
          onClick={() => {
            onClose?.();
            if (userProfile.role.includes("STORE")) navigate("/store/dashboard");
            else if (userProfile.role.includes("BRANCH")) navigate("/branch/dashboard");
            else navigate("/super-admin/dashboard");
          }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="truncate">Exit Terminal</span>
        </Button>
      )}

      <Separator className="my-2.5 bg-[#383532]" />

      {/* Logout Action */}
      <Button
        variant="ghost"
        className="w-full justify-start text-[#A8A29E] hover:text-white hover:bg-[#33302D] font-bold text-xs h-8.5 rounded-xl transition-colors gap-2 cursor-pointer px-2.5"
        onClick={handleLogout}
      >
        <LogOut className="h-3.5 w-3.5" />
        <span className="truncate">End Shift</span>
      </Button>
    </div>
  );
};

export default CashierSideBar;
