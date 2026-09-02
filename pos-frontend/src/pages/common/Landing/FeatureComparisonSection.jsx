import React from "react";
import FeatureComparisonTable from "./FeatureComparisonTable";

const FeatureComparisonSection = () => {
  return (
    <section className="py-20 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-secondary text-foreground border border-border mb-3">
            Plan Comparison
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
            Compare plan features side by side
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Choose the tier that matches your store count, team size, and inventory volume.
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <FeatureComparisonTable />
        </div>
      </div>
    </section>
  );
};

export default FeatureComparisonSection;