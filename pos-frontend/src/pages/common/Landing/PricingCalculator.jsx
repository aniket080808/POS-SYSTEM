import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Calculator, Store, Users, ArrowRight, Loader2, Clock } from "lucide-react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";

const PricingCalculator = () => {
  const navigate = useNavigate();
  const { plans, loading, hasFetched } = useSelector((state) => state.subscriptionPlan);
  const [storeCount, setStoreCount] = useState(1);
  const [staffCount, setStaffCount] = useState(3);

  // Find the best matching plan from the LIVE fetched plans
  const recommendedPlan = useMemo(() => {
    if (!plans || plans.length === 0) return null;

    // Sort plans by price ascending to pick the cheapest that still fits
    const sorted = [...plans].sort((a, b) => (a.price || 0) - (b.price || 0));

    // Find first plan whose limits cover the user's inputs
    const match = sorted.find(
      (p) =>
        (p.maxBranches ?? Infinity) >= storeCount &&
        (p.maxUsers ?? Infinity) >= staffCount
    );

    // If nothing fits, recommend the largest plan
    return match || sorted[sorted.length - 1];
  }, [plans, storeCount, staffCount]);

  // Derive max slider values from actual plans
  const maxBranches = useMemo(() => {
    if (!plans || plans.length === 0) return 10;
    return Math.max(...plans.map((p) => p.maxBranches || 1));
  }, [plans]);

  const maxUsers = useMemo(() => {
    if (!plans || plans.length === 0) return 50;
    return Math.max(...plans.map((p) => p.maxUsers || 1));
  }, [plans]);

  // Loading state
  if (loading && !hasFetched) {
    return (
      <div id="calculator" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-card rounded-3xl border border-border shadow-md max-w-4xl mx-auto p-12 flex justify-center items-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-3 text-sm text-muted-foreground font-medium">Loading estimator...</span>
        </div>
      </div>
    );
  }

  // Empty state — no plans in database yet
  if (hasFetched && (!plans || plans.length === 0)) {
    return (
      <div id="calculator" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-card rounded-3xl border border-border shadow-md max-w-4xl mx-auto p-12">
          <div className="flex flex-col items-center gap-3 text-center">
            <Clock className="w-7 h-7 text-muted-foreground" />
            <h3 className="text-lg font-bold text-foreground">Plan estimator coming soon</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Once the administrator adds subscription plans, the estimator will help you find the right fit.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="calculator" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-card rounded-3xl border border-border shadow-md overflow-hidden max-w-4xl mx-auto">
        <div className="bg-secondary/70 p-6 sm:p-8 border-b border-border">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#FDF6E2] border border-[#EED896] flex items-center justify-center text-[#B8860B]">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Plan Recommender</h3>
              <p className="text-xs text-muted-foreground">
                Tell us your store size and we'll suggest the best plan from the available options.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Store Count Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-foreground flex items-center gap-2">
                <Store className="w-4 h-4 text-muted-foreground" /> Stores / Outlets
              </label>
              <span className="bg-[#262422] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {storeCount} {storeCount === 1 ? "store" : "stores"}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max={maxBranches}
              value={Math.min(storeCount, maxBranches)}
              onChange={(e) => setStoreCount(parseInt(e.target.value))}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-[#B8860B]"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground mt-1 font-mono">
              <span>1</span>
              <span>{maxBranches}</span>
            </div>
          </div>

          {/* Staff Count Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" /> Staff Accounts
              </label>
              <span className="bg-[#262422] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {staffCount} {staffCount === 1 ? "user" : "users"}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max={maxUsers}
              value={Math.min(staffCount, maxUsers)}
              onChange={(e) => setStaffCount(parseInt(e.target.value))}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-[#B8860B]"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground mt-1 font-mono">
              <span>1</span>
              <span>{maxUsers}</span>
            </div>
          </div>

          {/* Recommended Plan Output */}
          {recommendedPlan && (
            <div className="bg-secondary/50 rounded-2xl p-6 border border-border mt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Recommended Plan
                  </span>
                  <h4 className="text-xl font-extrabold text-foreground mt-0.5">
                    {recommendedPlan.name}
                  </h4>
                  {recommendedPlan.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {recommendedPlan.description}
                    </p>
                  )}
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-3xl font-black text-foreground font-mono">
                    ₹{recommendedPlan.price?.toLocaleString()}
                    {recommendedPlan.billingCycle && (
                      <span className="text-xs text-muted-foreground font-normal">
                        {" "}/ {recommendedPlan.billingCycle.toLowerCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Button
                onClick={() =>
                  navigate(
                    `/auth/onboarding?planId=${recommendedPlan.id || ""}&planName=${encodeURIComponent(
                      recommendedPlan.name || ""
                    )}&price=${recommendedPlan.price || 0}`
                  )
                }
                className="w-full h-11 text-xs font-bold gap-2 cursor-pointer"
              >
                Get Started with {recommendedPlan.name}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PricingCalculator;