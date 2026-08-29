import React from "react";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router";

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card text-card-foreground border-t border-border/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div className="w-9 h-9 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-bold shadow-xs">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                NexPOS
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm leading-relaxed">
              Enterprise-grade Point of Sale & Retail Management Platform. Engineered for multi-branch scalability, high-speed cashier checkout, and real-time inventory precision.
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <a href="#features" className="hover:text-foreground transition-colors">
                  Features & Modules
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-foreground transition-colors">
                  Subscription Plans
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-foreground transition-colors">
                  FAQ & Support
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-foreground transition-colors">
                  Enterprise Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Access Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
              Portals
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <span
                  onClick={() => navigate("/auth/login")}
                  className="cursor-pointer hover:text-foreground transition-colors"
                >
                  Cashier POS Terminal
                </span>
              </li>
              <li>
                <span
                  onClick={() => navigate("/auth/login")}
                  className="cursor-pointer hover:text-foreground transition-colors"
                >
                  Store & Branch Portal
                </span>
              </li>
              <li>
                <span
                  onClick={() => navigate("/auth/onboarding")}
                  className="cursor-pointer hover:text-foreground transition-colors"
                >
                  Store Registration Wizard
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {currentYear} NexPOS. All operational rights reserved.</p>
          <p className="font-mono text-[11px]">Production Build v1.0.0</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;