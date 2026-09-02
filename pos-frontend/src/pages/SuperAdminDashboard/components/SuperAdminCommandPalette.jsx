import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  LayoutDashboard,
  Store,
  Clock,
  FileText,
  MessageSquare,
  Percent,
  Activity,
  Download,
  Settings,
  ExternalLink,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { getAllStores } from "@/Redux Toolkit/features/store/storeThunks";

export default function SuperAdminCommandPalette({ open, setOpen }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { stores = [] } = useSelector((state) => state.store);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open && (!stores || stores.length === 0)) {
      dispatch(getAllStores());
    }
  }, [open, dispatch, stores]);

  const NAV_ITEMS = useMemo(
    () => [
      {
        title: "Platform Overview",
        path: "/super-admin/dashboard",
        icon: <LayoutDashboard className="w-4 h-4 text-[#B8860B]" />,
        category: "Navigation",
      },
      {
        title: "Registered Stores Directory",
        path: "/super-admin/stores",
        icon: <Store className="w-4 h-4 text-foreground" />,
        category: "Navigation",
      },
      {
        title: "Store Approval Requests",
        path: "/super-admin/requests",
        icon: <Clock className="w-4 h-4 text-amber-500" />,
        category: "Navigation",
      },
      {
        title: "Subscription Plans & Pricing",
        path: "/super-admin/subscriptions",
        icon: <FileText className="w-4 h-4 text-emerald-500" />,
        category: "Navigation",
      },
      {
        title: "Customer Inquiries & Leads",
        path: "/super-admin/inquiries",
        icon: <MessageSquare className="w-4 h-4 text-blue-500" />,
        category: "Navigation",
      },
      {
        title: "Platform Revenue & Commissions",
        path: "/super-admin/commissions",
        icon: <Percent className="w-4 h-4 text-[#B8860B]" />,
        category: "Navigation",
      },
      {
        title: "Security & System Audit Trail",
        path: "/super-admin/audit-logs",
        icon: <Activity className="w-4 h-4 text-violet-500" />,
        category: "Navigation",
      },
      {
        title: "System Data Exports (CSV / JSON)",
        path: "/super-admin/exports",
        icon: <Download className="w-4 h-4 text-foreground" />,
        category: "Navigation",
      },
      {
        title: "Platform Governance & Settings",
        path: "/super-admin/settings",
        icon: <Settings className="w-4 h-4 text-foreground" />,
        category: "Navigation",
      },
    ],
    []
  );

  const filteredNav = useMemo(() => {
    if (!query.trim()) return NAV_ITEMS;
    const q = query.toLowerCase();
    return NAV_ITEMS.filter((item) => item.title.toLowerCase().includes(q));
  }, [NAV_ITEMS, query]);

  const filteredStores = useMemo(() => {
    if (!stores || stores.length === 0) return [];
    if (!query.trim()) return stores.slice(0, 5); // Show first 5 by default
    const q = query.toLowerCase();
    return stores.filter(
      (s) =>
        (s.brand || "").toLowerCase().includes(q) ||
        (s.name || "").toLowerCase().includes(q) ||
        (s.storeAdmin?.fullName || "").toLowerCase().includes(q) ||
        (s.storeAdmin?.email || "").toLowerCase().includes(q) ||
        String(s.id).includes(q)
    );
  }, [stores, query]);

  const handleSelect = (path) => {
    setOpen(false);
    setQuery("");
    navigate(path);
  };

  const handleImpersonate = (e, storeId, storeName) => {
    e.stopPropagation();
    setOpen(false);
    sessionStorage.setItem("impersonate_store_id", storeId);
    sessionStorage.setItem("impersonate_store_name", storeName || "Store");
    navigate("/store/dashboard");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-card border-border shadow-2xl rounded-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Command Palette</DialogTitle>
        </DialogHeader>

        {/* Search Header */}
        <div className="relative flex items-center px-4 border-b border-border/80 bg-secondary/30">
          <Search className="w-4 h-4 text-muted-foreground shrink-0 mr-3" />
          <Input
            autoFocus
            placeholder="Type a command, page, or search registered stores..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-13 text-sm bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
          />
          <Badge variant="outline" className="text-[10px] font-mono shrink-0 px-2 py-0.5">
            ESC to close
          </Badge>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4 text-xs">
          {/* Navigation Items */}
          {filteredNav.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2.5 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#B8860B]" />
                Navigation & Modules
              </p>
              <div className="space-y-0.5">
                {filteredNav.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleSelect(item.path)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-secondary transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-card border border-border/60 group-hover:border-border">
                        {item.icon}
                      </div>
                      <span className="font-semibold text-foreground text-xs">
                        {item.title}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Store Tenants */}
          {filteredStores.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2.5 mb-1.5 flex items-center gap-1.5">
                <Store className="w-3 h-3 text-[#B8860B]" />
                Registered Stores
              </p>
              <div className="space-y-1">
                {filteredStores.map((s) => {
                  const storeName = s.brand || s.name || `Store #${s.id}`;
                  return (
                    <div
                      key={s.id}
                      onClick={() => handleSelect(`/super-admin/stores/${s.id}`)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-secondary transition-colors group cursor-pointer border border-transparent hover:border-border/60"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 rounded-lg bg-[#FDF6E2] dark:bg-[#2A2312] border border-[#EED896] text-[#B8860B] shrink-0">
                          <Store className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground truncate">
                              {storeName}
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground">
                              #{s.id}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                                (s.status || "").toUpperCase() === "ACTIVE"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "bg-destructive/10 text-destructive"
                              }`}
                            >
                              {s.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {s.storeAdmin?.fullName} • {s.storeAdmin?.email || "No email"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleImpersonate(e, s.id, storeName)}
                          className="px-2 py-1 text-[11px] font-bold rounded-lg bg-[#B8860B]/10 hover:bg-[#B8860B] text-[#B8860B] hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                          title="Jump directly into store workstation"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Access
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {filteredNav.length === 0 && filteredStores.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="font-semibold">No results found</p>
              <p className="text-[11px] mt-0.5">Try searching with a different keyword</p>
            </div>
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-4 py-2.5 bg-secondary/50 border-t border-border/80 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            Quick jump anywhere in <strong>NexPOS Super Admin</strong>
          </span>
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <kbd className="px-1.5 py-0.5 bg-card rounded border border-border">Ctrl</kbd>+
            <kbd className="px-1.5 py-0.5 bg-card rounded border border-border">K</kbd> to open
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
