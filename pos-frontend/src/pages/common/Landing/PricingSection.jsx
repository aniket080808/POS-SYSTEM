import React, { useState, useMemo } from "react";
import { Check, Loader2, Clock } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useScrollReveal } from "@/hooks/useAnimations";

const PricingSection = () => {
  const navigate = useNavigate();
  const { plans, loading, hasFetched } = useSelector((state) => state.subscriptionPlan);
  const [billingFilter, setBillingFilter] = useState("MONTHLY");
  const { ref: headerRef, isVisible } = useScrollReveal();

  // Build feature list dynamically from each plan's real DB fields
  const getFeaturesList = (plan) => {
    const list = [];
    if (plan.maxBranches != null)
      list.push(`Up to ${plan.maxBranches} Branch Location${plan.maxBranches > 1 ? "s" : ""}`);
    if (plan.maxUsers != null)
      list.push(`Up to ${plan.maxUsers} Staff Account${plan.maxUsers > 1 ? "s" : ""}`);
    if (plan.maxProducts != null)
      list.push(`Up to ${plan.maxProducts.toLocaleString()} Products`);
    if (plan.enableInventory) list.push("Stock & Inventory Tracking");
    if (plan.enableAdvancedReports) list.push("Sales & Shift Reports");
    if (plan.enableMultiLocation) list.push("Multi-Store Branch Control");
    if (plan.enableIntegrations) list.push("Third-Party Integrations");
    if (plan.enableEcommerce) list.push("Online Store Connection");
    if (plan.enableInvoiceBranding) list.push("Custom Invoice Branding");
    if (plan.prioritySupport) list.push("Priority Support");
    if (plan.extraFeatures && plan.extraFeatures.length > 0) {
      plan.extraFeatures.forEach((f) => {
        if (f) list.push(f);
      });
    }
    return list;
  };

  // Determine if plans contain both MONTHLY and YEARLY
  const hasMultipleCycles = useMemo(() => {
    if (!plans || plans.length === 0) return false;
    const cycles = new Set(plans.map((p) => p.billingCycle).filter(Boolean));
    return cycles.has("MONTHLY") && cycles.has("YEARLY");
  }, [plans]);

  // Filter plans by selected billing cycle
  const filteredPlans = useMemo(() => {
    if (!plans || plans.length === 0) return [];
    if (!hasMultipleCycles) return plans;
    return plans.filter((p) => p.billingCycle === billingFilter);
  }, [plans, billingFilter, hasMultipleCycles]);

  // Loading state
  if (loading && !hasFetched) {
    return (
      <section id="pricing" className="py-20 bg-background scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
              Pricing
            </h2>
          </div>
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-sm text-muted-foreground font-medium">Loading plans...</span>
          </div>
        </div>
      </section>
    );
  }

  // Empty state — no plans in database yet
  if (hasFetched && (!plans || plans.length === 0)) {
    return (
      <section id="pricing" className="py-20 bg-background scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
              Pricing
            </h2>
            <div className="bg-card rounded-3xl border border-border p-12 shadow-xs">
              <div className="flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-secondary border border-border flex items-center justify-center">
                  <Clock className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Plans will be available soon</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Our subscription plans are being configured by the administrator. Check back soon or register your store to get notified.
                </p>
                <Button
                  onClick={() => navigate("/auth/onboarding")}
                  className="text-xs font-bold h-10 gap-1.5 mt-2 cursor-pointer"
                >
                  Register Your Store
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="py-20 bg-background scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-10 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-secondary text-foreground border border-border mb-3">
            Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
            Choose a plan that fits your store
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            All plans include barcode billing, cashier shift tracking, and inventory management.
          </p>
        </div>

        {/* Monthly/Yearly Toggle */}
        {hasMultipleCycles && (
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center bg-secondary rounded-xl p-1 border border-border gap-1">
              <button
                type="button"
                onClick={() => setBillingFilter("MONTHLY")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  billingFilter === "MONTHLY"
                    ? "bg-[#262422] text-[#FAF8F3] shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingFilter("YEARLY")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  billingFilter === "YEARLY"
                    ? "bg-[#262422] text-[#FAF8F3] shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Yearly
                <span className="text-[10px] font-bold bg-[#C9A227] text-[#262422] px-1.5 py-0.5 rounded-md">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        )}

        <div className={`grid grid-cols-1 ${filteredPlans.length === 2 ? "md:grid-cols-2 max-w-4xl mx-auto" : filteredPlans.length >= 3 ? "md:grid-cols-3" : ""} gap-8`}>
          {filteredPlans.map((plan, index) => {
            const isPopular = plan.popular || (filteredPlans.length >= 3 && index === 1);
            const features = getFeaturesList(plan);

            return (
              <div
                key={plan.id || index}
                className={`bg-card rounded-3xl p-8 border flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
                  isPopular
                    ? "border-[#B8860B] ring-2 ring-[#B8860B]/20 shadow-lg relative"
                    : "border-border shadow-xs hover:shadow-md"
                }`}
              >
                <div>
                  {isPopular && (
                    <div className="mb-4">
                      <span className="bg-[#262422] text-[#FAF8F3] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <h3 className="text-xl font-bold text-foreground mb-1">
                    {plan.name}
                  </h3>
                  {plan.description && (
                    <p className="text-xs text-muted-foreground mb-6 min-h-[32px]">
                      {plan.description}
                    </p>
                  )}

                  <div className="flex items-baseline mb-6 pb-6 border-b border-border">
                    <span className="text-4xl font-black text-foreground font-mono">
                      ₹{plan.price?.toLocaleString()}
                    </span>
                    {plan.billingCycle && (
                      <span className="text-xs text-muted-foreground font-medium ml-1.5">
                        /{plan.billingCycle.toLowerCase()}
                      </span>
                    )}
                  </div>

                  {features.length > 0 && (
                    <ul className="space-y-3 mb-8">
                      {features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-start text-xs font-medium text-foreground"
                        >
                          <div className="w-4 h-4 rounded-full bg-secondary border border-border flex items-center justify-center mr-2.5 mt-0.5 shrink-0">
                            <Check className="w-2.5 h-2.5 text-[#262422] stroke-[3]" />
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <Button
                  onClick={() =>
                    navigate(
                      `/auth/onboarding?planId=${plan.id || ""}&planName=${encodeURIComponent(
                        plan.name || ""
                      )}&price=${plan.price || 0}`
                    )
                  }
                  variant={isPopular ? "default" : "outline"}
                  className="w-full text-xs font-bold h-11 cursor-pointer"
                >
                  Choose {plan.name}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
