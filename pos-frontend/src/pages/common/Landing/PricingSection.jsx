import React from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useNavigate } from "react-router";

const pricingPlans = [
  {
    name: "Starter Branch",
    price: "₹999",
    period: "/month",
    description: "Ideal for single retail outlets and emerging boutique shops.",
    features: [
      "1 Store Location & Branch",
      "Cashier Terminal Access",
      "Barcode Scanning & Thermal Invoices",
      "Basic Shift Reports & Summaries",
      "Standard CSV/Excel Exports",
    ],
    popular: false,
  },
  {
    name: "Growth Multi-Branch",
    price: "₹1,999",
    period: "/month",
    description: "Complete operational suite for multi-branch retailers.",
    features: [
      "Up to 5 Branch Locations",
      "Unlimited Cashier Staff & Managers",
      "Centralized Inventory Catalog",
      "Advanced Sales & Shift Analytics",
      "Automated Low-Stock Thresholds",
      "Full PDF & Excel Financial Reports",
    ],
    popular: true,
  },
  {
    name: "Enterprise Chain",
    price: "Custom",
    period: "",
    description: "Dedicated deployment for large supermarket and mall chains.",
    features: [
      "Unlimited Branches & Terminals",
      "Super Admin Tenant Oversight",
      "Dedicated Database Optimization",
      "Priority Technical SLA",
      "Custom Return & Refund Workflows",
    ],
    popular: false,
  },
];

const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-20 bg-muted/30 border-y border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-2 block">
            Subscription Plans
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            Transparent Pricing for Growing Retailers
          </h2>
          <p className="text-base text-muted-foreground">
            Scale your physical stores with predictable monthly plans and zero hidden hardware fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`bg-card rounded-2xl p-8 border flex flex-col justify-between transition-all duration-200 ${
                plan.popular
                  ? "border-primary shadow-md ring-2 ring-primary/20 relative"
                  : "border-border/80 shadow-2xs hover:shadow-md"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-3.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-xs">
                    Recommended
                  </span>
                </div>
              )}
              
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-muted-foreground min-h-[32px]">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline mt-4">
                    <span className="text-4xl font-extrabold font-mono text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1 font-mono">
                      {plan.period}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border/60 pt-6 mb-8">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start text-xs text-foreground/90">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Button
                onClick={() => navigate("/auth/onboarding")}
                variant={plan.popular ? "default" : "outline"}
                className="w-full h-11 rounded-xl text-sm font-semibold gap-2"
              >
                <span>{plan.name === "Enterprise Chain" ? "Contact Enterprise" : "Start Setup"}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

