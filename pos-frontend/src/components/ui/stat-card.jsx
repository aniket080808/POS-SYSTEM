import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendLabel,
  className,
  iconClassName,
  iconBgClassName,
}) {
  return (
    <Card className={cn("overflow-hidden border border-border/70 hover:shadow-md transition-all duration-200", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
              {title}
            </p>
            <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {value}
            </div>
            {(description || trend !== undefined) && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-0.5 flex-wrap">
                {trend !== undefined && (
                  <span
                    className={cn(
                      "inline-flex items-center px-1.5 py-0.5 rounded-full font-semibold text-[11px]",
                      Number(trend) > 0
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : Number(trend) < 0
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {Number(trend) > 0 ? "+" : ""}
                    {trend}%
                  </span>
                )}
                {trendLabel && <span>{trendLabel}</span>}
                {description && !trendLabel && <span>{description}</span>}
              </div>
            )}
          </div>
          {Icon && (
            <div
              className={cn(
                "p-3 rounded-2xl bg-primary/10 text-primary flex-shrink-0 flex items-center justify-center",
                iconBgClassName
              )}
            >
              {typeof Icon === "function" || typeof Icon === "object" ? (
                React.isValidElement(Icon) ? (
                  Icon
                ) : (
                  <Icon className={cn("w-6 h-6", iconClassName)} />
                )
              ) : null}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default StatCard;
