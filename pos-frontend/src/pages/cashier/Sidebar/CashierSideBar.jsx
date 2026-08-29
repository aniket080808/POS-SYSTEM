import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { getBranchById } from "../../../Redux Toolkit/features/branch/branchThunks";
import { Button } from "../../../components/ui/button";
import { LogOut, X, Store } from "lucide-react";
import { logout } from "../../../Redux Toolkit/features/user/userThunks";
import BranchInfo from "./BranchInfo";

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
    navigate("/auth/login");
  };

  return (
    <div className="w-72 border-r border-zinc-800 bg-[#18181b] text-zinc-100 p-5 flex flex-col h-full relative shadow-2xl z-30">
      {/* Close Button on Mobile/Drawer */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 h-8 w-8 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
        onClick={onClose}
        aria-label="Close sidebar"
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-2 mb-4">
        <div className="p-2 rounded-xl bg-accent text-accent-foreground shadow-sm shrink-0">
          <Store className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-extrabold tracking-tight text-white truncate">
              NexPOS
            </h1>
            <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded border border-amber-500/30">
              TERMINAL
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 truncate mt-0.5">
            Point of Sale Console
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1 flex-1 overflow-y-auto pr-1">
        <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-3 py-1.5">
          Terminal Modes
        </div>
        {navItems.map((item) => {
          const isActive =
            item.path === "/cashier"
              ? location.pathname === "/cashier"
              : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-accent text-accent-foreground shadow-xs font-bold"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/80"
              }`}
              onClick={() => {
                if (onClose) onClose();
              }}
            >
              <span className={isActive ? "text-accent-foreground" : "text-zinc-400"}>
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Branch Info Card */}
      <div className="pt-2">
        <BranchInfo />
      </div>

      {/* Logout Action */}
      <div className="pt-3 mt-auto border-t border-zinc-800">
        <Button
          variant="ghost"
          className="w-full justify-start text-zinc-400 hover:text-red-400 hover:bg-red-950/30 text-xs font-semibold h-10 px-3 rounded-xl cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          End Shift & Sign Out
        </Button>
      </div>
    </div>
  );
};

export default CashierSideBar;
