import React, { useEffect, useState, lazy, Suspense } from "react";
import { useDispatch } from "react-redux";
import { fetchPublicPlans } from "@/Redux Toolkit/features/subscriptionPlan/publicPlanThunks";
import Header from "./Header";
import HeroSection from "./HeroSection";
import { ArrowUp, Zap, ShieldCheck, FileCheck2, Building2, Loader2 } from "lucide-react";

// Lazy-loaded below-the-fold sections for faster initial page load
const KeyFeaturesSection = lazy(() => import("./KeyFeaturesSection"));
const HowItWorksSection = lazy(() => import("./HowItWorksSection"));
const WhyChooseUsSection = lazy(() => import("./WhyChooseUsSection"));
const LiveDemoSection = lazy(() => import("./LiveDemoSection"));
const PricingSection = lazy(() => import("./PricingSection"));
const PricingCalculator = lazy(() => import("./PricingCalculator"));
const FeatureComparisonSection = lazy(() => import("./FeatureComparisonSection"));
const FAQSection = lazy(() => import("./FAQSection"));
const ContactSection = lazy(() => import("./ContactSection"));
const Footer = lazy(() => import("./Footer"));

const SectionLoader = () => (
  <div className="flex justify-center items-center py-16">
    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
  </div>
);

function Landing() {
  const dispatch = useDispatch();
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Single fetch on mount — all plan-dependent sections read from Redux
  useEffect(() => {
    dispatch(fetchPublicPlans());
  }, [dispatch]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background relative">
      <Header />
      <HeroSection />

      {/* Trust & System Capability Metric Strip */}
      <div className="border-y border-border/80 bg-secondary/40 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div className="flex items-center justify-center gap-3 p-2">
              <div className="w-8 h-8 rounded-lg bg-[#FDF6E2] border border-[#EED896] dark:bg-[#3A3530] dark:border-[#5A4F3D] flex items-center justify-center text-[#B8860B] dark:text-[#F5A623] shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-foreground">Sub-Second Billing</div>
                <div className="text-[11px] text-muted-foreground">High-speed barcode scanning</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 p-2">
              <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-foreground shrink-0">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-foreground">GST & UPI Ready</div>
                <div className="text-[11px] text-muted-foreground">Compliant tax invoice generation</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 p-2">
              <div className="w-8 h-8 rounded-lg bg-[#FDF6E2] border border-[#EED896] dark:bg-[#3A3530] dark:border-[#5A4F3D] flex items-center justify-center text-[#B8860B] dark:text-[#F5A623] shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-foreground">Multi-Branch Sync</div>
                <div className="text-[11px] text-muted-foreground">Real-time inventory deduction</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 p-2">
              <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-foreground shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-foreground">Role Security</div>
                <div className="text-[11px] text-muted-foreground">Audit logs & shift till balancing</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Suspense fallback={<SectionLoader />}>
        <KeyFeaturesSection />
        <HowItWorksSection />
        <WhyChooseUsSection />
        <LiveDemoSection />
        <PricingSection />
        <PricingCalculator />
        <FeatureComparisonSection />
        <FAQSection />
        <ContactSection />
        <Footer />
      </Suspense>

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-[#262422] text-[#FAF8F3] hover:bg-black shadow-lg border border-[#C9A227]/40 hover:scale-105 active:scale-95 transition-all cursor-pointer animate-in fade-in zoom-in-90 duration-200"
          aria-label="Scroll to top"
          title="Back to top"
        >
          <ArrowUp className="w-4 h-4 text-[#C9A227]" />
        </button>
      )}
    </div>
  );
}

export default Landing;
