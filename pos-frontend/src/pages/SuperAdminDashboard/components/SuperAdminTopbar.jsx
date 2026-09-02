import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Bell, User, Search, ShieldCheck, Menu } from "lucide-react";
import { Button } from "../../../components/ui/button";
import NotificationPanel from "./NotificationPanel";
import { useWebSocket } from "../../../hooks/useWebSocket";
import { Badge } from "@/components/ui/badge";
import SuperAdminCommandPalette from "./SuperAdminCommandPalette";

export default function SuperAdminTopbar({ onOpenMobileMenu }) {
  const { userProfile } = useSelector((state) => state.user);
  const { unreadCount } = useSelector((state) => state.notification);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useWebSocket();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="w-full h-16 bg-card border-b border-border flex items-center px-4 sm:px-6 justify-between sticky top-0 z-20">
      {/* Identity & Mobile Menu Toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
          <ShieldCheck className="w-5 h-5 text-[#B8860B]" />
        </div>
        <div className="truncate">
          <h1 className="text-sm font-bold text-foreground tracking-tight truncate">
            Platform Master Console
          </h1>
          <p className="text-xs text-muted-foreground font-medium hidden sm:block truncate">
            System-Wide Tenant & Subscription Governance
          </p>
        </div>
      </div>

      {/* Quick Search Spotlight Trigger */}
      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-secondary/60 hover:bg-secondary border border-border text-muted-foreground hover:text-foreground text-xs transition-colors cursor-pointer w-72 justify-between"
      >
        <span className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <span>Quick command search...</span>
        </span>
        <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-card rounded border border-border shadow-2xs">
          Ctrl K
        </kbd>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Search Button */}
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>
        {/* Command Palette Modal */}
        <SuperAdminCommandPalette open={paletteOpen} setOpen={setPaletteOpen} />
        {/* Notifications */}
        <NotificationPanel>
          <button
            type="button"
            className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-destructive text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </NotificationPanel>

        {/* User Card */}
        <div className="flex items-center gap-3 pl-3 border-l border-border">
          <div className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center font-bold text-sm text-foreground">
            {userProfile?.fullName ? userProfile.fullName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
          <div className="hidden sm:block text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-foreground">
                {userProfile?.fullName || "Super Admin"}
              </span>
              <Badge variant="default" className="text-[10px] px-1.5 py-0 bg-[#262422] text-white">
                Super Admin
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground truncate max-w-[160px]">
              {userProfile?.email || "superadmin@pos.com"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}