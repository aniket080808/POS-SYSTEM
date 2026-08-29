import React from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useNavigate } from "react-router";

const subscriptionPlans = [
  {
    name: "Starter Store",
    price: "₹999",
    period: "/month",
    description: "Ideal for single retail outlets needing instant cashier setup & inventory tracking.",
    features: [
      "1 Store & 1 Branch Terminal",
      "Full Cashier POS with Barcode Scanning",
      "Cash Drawer & Shift Auditing",
      "Customer Purchase History",
      "Standard PDF & Excel Sales Reports",
      "Store-Level Role Access Control",
    ],
    popular: false,
  },
  {
    name: "Growth Multi-Branch",
    price: "₹2,499",
    period: "/month",
    description: "Built for scaling retailers operating multiple physical branch outlets.",
    features: [
      "Up to 5 Branch Locations",
      "Unlimited Cashier Accounts & Shifts",
      "Live WebSocket Alerts (Low Stock / Inactivity)",
      "Branch-Specific Stock & Pricing Overrides",
      "Bulk CSV/Excel Product Catalog Import",
      "Automated Refund Spike & Shift Auditing",
    ],
    popular: true,
  },
  {
    name: "Enterprise Chain",
    price: "Custom",
    period: "",
    description: "Dedicated deployment for large retail chains and mall supermarket networks.",
    features: [
      "Unlimited Branches & Terminals",
      "Dedicated Super Admin Governance",
      "Custom Commission Models & Audits",
      "Direct Database & Export Integrations",
      "Priority SLA & Operational Support",
      "Custom Financial Export Formats",
    ],
    popular: false,
  },
];

const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-20 bg-muted/30 border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-accent">
            Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mt-2 mb-4">
            Predictable Plans for Retail Growth
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Integrated Razorpay checkout with simple monthly or annual subscription cycles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subscriptionPlans.map((plan, index) => (
            <div
              key={index}
              className={`bg-card rounded-2xl p-7 shadow-xs border flex flex-col justify-between transition-all ${
                plan.popular
                  ? "border-accent ring-1 ring-accent/50 shadow-md relative"
                  : "border-border/80"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2">
                  <span className="bg-accent text-accent-foreground px-3.5 py-1 rounded-full text-xs font-extrabold shadow-xs uppercase tracking-wider">
                    Most Popular
                  </span>
                </div>
              )}

              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <div className="flex items-baseline mb-6">
                  <span className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1.5 font-medium">
                    {plan.period}
                  </span>
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-muted-foreground leading-snug">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => navigate("/auth/onboarding")}
                className={`w-full h-11 rounded-xl text-sm font-semibold cursor-pointer ${
                  plan.popular
                    ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-xs"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {plan.name === "Enterprise Chain" ? "Contact Enterprise Sales" : "Get Started Now"}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
