import React, { useState } from "react";
import { useNavigate } from "react-router";
import NexPOSLogo from "@/components/common/NexPOSLogo";
import siteConfig from "@/config/siteConfig";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/utils/api";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubLoading(true);
    try {
      await api.post("/api/public/contact-inquiries", {
        name: "Newsletter Subscriber",
        email: email.trim(),
        storeName: null,
        message: "Newsletter subscription request from landing page footer.",
      });
      setSubscribed(true);
    } catch {
      // Silently succeed for UX — even if API is down, don't block the user
      setSubscribed(true);
    }
    setSubLoading(false);
  };

  return (
    <footer className="bg-card text-foreground border-t border-border">
      {/* Newsletter Strip */}
      <div className="bg-[#262422] text-[#FAF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold">Stay Updated with NexPOS</h3>
            <p className="text-[11px] text-[#D4CEBF] mt-0.5">
              Get product updates, feature releases, and retail tips delivered to your inbox.
            </p>
          </div>

          {subscribed ? (
            <div className="flex items-center gap-2 text-xs font-bold text-[#C9A227]">
              <div className="w-5 h-5 rounded-full bg-[#C9A227] text-[#262422] flex items-center justify-center">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              Thank you! You're subscribed.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full sm:w-auto">
              <input
                type="email"
                required
                disabled={subLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="px-3.5 py-2 rounded-xl text-xs bg-white/10 border border-white/20 text-[#FAF8F3] placeholder:text-[#D4CEBF]/70 focus:border-[#C9A227] outline-none flex-1 sm:w-56 disabled:opacity-50"
              />
              <Button
                type="submit"
                disabled={subLoading}
                size="sm"
                className="text-xs font-bold gap-1 shrink-0 cursor-pointer"
              >
                {subLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    Subscribe
                    <ArrowRight className="w-3 h-3" />
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <NexPOSLogo onClick={() => navigate("/")} size="md" />
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm leading-relaxed">
              Fast, reliable Point of Sale, live inventory tracking, and multi-branch management built for modern retail.
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Email: <span className="font-mono text-foreground">{siteConfig.contact.email}</span></p>
              <p>Phone: <span className="font-mono text-foreground">{siteConfig.contact.phone}</span></p>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#demo" className="text-muted-foreground hover:text-foreground transition-colors">
                  Product Tour
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing Plans
                </a>
              </li>
              <li>
                <a href="#calculator" className="text-muted-foreground hover:text-foreground transition-colors">
                  Cost Estimator
                </a>
              </li>
              <li>
                <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Access */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
              Portal Access
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <button
                  type="button"
                  onClick={() => navigate(siteConfig.links.signIn)}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-left"
                >
                  Sign In to Store
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate(siteConfig.links.register)}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-left"
                >
                  Register New Store
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate(siteConfig.links.forgotPassword)}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-left"
                >
                  Reset Password
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/80 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground font-medium">
          <p>© {currentYear} {siteConfig.brandName}. All rights reserved.</p>
          <div className="flex space-x-6">
            <span>Fast Barcode Checkout</span>
            <span>Multi-Branch Ready</span>
            <span>Secure Shift Balancing</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;