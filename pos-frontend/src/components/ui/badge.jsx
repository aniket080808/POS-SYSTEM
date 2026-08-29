import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-border bg-secondary text-secondary-foreground",
        destructive:
          "border-red-200 bg-red-50 text-red-700",
        outline:
          "border-border text-foreground bg-card",
        success:
          "border-emerald-200 bg-emerald-50 text-emerald-700 font-bold",
        warning:
          "border-amber-200 bg-amber-50 text-amber-700 font-bold",
        amber:
          "border-amber-300 bg-amber-100 text-amber-900 font-bold",
        accent:
          "border-transparent bg-accent text-accent-foreground font-bold",
        info:
          "border-slate-200 bg-slate-100 text-slate-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props} />
  );
}

export { Badge, badgeVariants }
