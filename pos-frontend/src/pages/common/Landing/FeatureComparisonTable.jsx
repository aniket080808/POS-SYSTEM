import React, { useMemo } from "react";
import { CheckCircle, X, Loader2, Clock } from "lucide-react";
import { useSelector } from "react-redux";

const FeatureComparisonTable = () => {
  const { plans, loading, hasFetched } = useSelector((state) => state.subscriptionPlan);

  // Build rows dynamically from whatever feature/limit keys exist across all plans
  const { rows, planNames } = useMemo(() => {
    if (!plans || plans.length === 0) return { rows: [], planNames: [] };

    const names = plans.map((p) => ({
      name: p.name,
      price: p.price,
      billingCycle: p.billingCycle,
    }));

    // Define known feature keys with human-readable labels and categories
    const featureMap = [
      { category: "Limits", key: "maxBranches", label: "Branch Store Locations", format: (v) => `Up to ${v}` },
      { category: "Limits", key: "maxUsers", label: "Staff User Accounts", format: (v) => `Up to ${v}` },
      { category: "Limits", key: "maxProducts", label: "Products in Catalog", format: (v) => `Up to ${v?.toLocaleString()}` },
      { category: "Features", key: "enableInventory", label: "Stock & Inventory Tracking" },
      { category: "Features", key: "enableAdvancedReports", label: "Sales & Shift Reports" },
      { category: "Features", key: "enableMultiLocation", label: "Multi-Store Branch Control" },
      { category: "Features", key: "enableIntegrations", label: "Third-Party Integrations" },
      { category: "Features", key: "enableEcommerce", label: "Online Store Connection" },
      { category: "Features", key: "enableInvoiceBranding", label: "Custom Invoice Branding" },
      { category: "Features", key: "prioritySupport", label: "Priority Support" },
    ];

    const resultRows = [];

    featureMap.forEach(({ category, key, label, format }) => {
      // Only include row if at least one plan has this field defined
      const hasAny = plans.some((p) => p[key] != null && p[key] !== false && p[key] !== 0);
      if (!hasAny) return;

      const values = plans.map((p) => {
        const val = p[key];
        if (val == null) return false;
        if (typeof val === "boolean") return val;
        if (typeof val === "number" && format) return format(val);
        return val;
      });

      resultRows.push({ category, label, values });
    });

    // Also render extraFeatures if any plan has them
    const allExtras = new Set();
    plans.forEach((p) => {
      if (p.extraFeatures && Array.isArray(p.extraFeatures)) {
        p.extraFeatures.forEach((f) => {
          if (f) allExtras.add(f);
        });
      }
    });

    allExtras.forEach((extraLabel) => {
      const values = plans.map((p) => {
        return (p.extraFeatures || []).includes(extraLabel);
      });
      resultRows.push({ category: "Extras", label: extraLabel, values });
    });

    return { rows: resultRows, planNames: names };
  }, [plans]);

  const renderValue = (value) => {
    if (value === true) {
      return <CheckCircle className="w-4 h-4 text-emerald-600 mx-auto" />;
    }
    if (value === false) {
      return <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />;
    }
    return <span className="text-xs font-bold text-foreground font-mono">{value}</span>;
  };

  // Loading state
  if (loading && !hasFetched) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-3 text-sm text-muted-foreground font-medium">Loading comparison...</span>
      </div>
    );
  }

  // Empty state — no plans available
  if (hasFetched && (!plans || plans.length === 0)) {
    return (
      <div className="p-12 text-center">
        <div className="flex flex-col items-center gap-3">
          <Clock className="w-7 h-7 text-muted-foreground" />
          <h3 className="text-base font-bold text-foreground">Comparison available after plans are added</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            The feature comparison table will appear once the administrator adds subscription plans.
          </p>
        </div>
      </div>
    );
  }

  // Group rows by category
  const categories = [];
  const seen = new Set();
  rows.forEach((row) => {
    if (!seen.has(row.category)) {
      seen.add(row.category);
      categories.push(row.category);
    }
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-secondary/60">
            <th className="py-4 px-6 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Feature
            </th>
            {planNames.map((pn, i) => (
              <th
                key={i}
                className={`py-4 px-6 text-center text-xs font-bold text-foreground ${
                  planNames.length >= 3 && i === 1 ? "bg-[#FDF6E2] dark:bg-[#3A3530]" : ""
                }`}
                style={{ width: `${Math.floor(75 / planNames.length)}%` }}
              >
                <div className="text-sm font-black">{pn.name}</div>
                <div className="text-xs text-muted-foreground font-mono font-normal">
                  ₹{pn.price?.toLocaleString()}/{pn.billingCycle?.toLowerCase() || "mo"}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60 text-xs">
          {categories.map((cat, catIndex) => (
            <React.Fragment key={catIndex}>
              <tr className="bg-secondary/30">
                <td
                  colSpan={1 + planNames.length}
                  className="py-3 px-6 text-left font-bold text-xs uppercase tracking-wider text-foreground"
                >
                  {cat}
                </td>
              </tr>
              {rows
                .filter((r) => r.category === cat)
                .map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-secondary/20 transition-colors">
                    <td className="py-3.5 px-6 text-left font-medium text-foreground">
                      {row.label}
                    </td>
                    {row.values.map((val, vi) => (
                      <td
                        key={vi}
                        className={`py-3.5 px-6 text-center ${
                          planNames.length >= 3 && vi === 1
                            ? "bg-[#FDF6E2]/40 dark:bg-[#3A3530]/40"
                            : ""
                        }`}
                      >
                        {renderValue(val)}
                      </td>
                    ))}
                  </tr>
                ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FeatureComparisonTable;