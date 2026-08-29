import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title = "No data found",
  description = "There are no records to display at this time.",
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-2xl border border-dashed border-border/80 bg-muted/20 my-4",
        className
      )}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-4 shadow-2xs">
          {React.isValidElement(Icon) ? (
            Icon
          ) : (
            <Icon className="w-7 h-7" />
          )}
        </div>
      )}
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="gap-2">
          {ActionIcon && <ActionIcon className="w-4 h-4" />}
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
