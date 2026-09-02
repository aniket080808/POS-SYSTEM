import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-2xl border px-4 py-3.5 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-5 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-secondary border-border text-foreground",
        destructive:
          "text-[#7A331E] bg-[#FBF0EC] border-[#EFC8BD] [&>svg]:text-[#A6543A] *:data-[slot=alert-description]:text-[#7A331E]/90",
        warning:
          "text-[#785600] bg-[#FDF6E2] border-[#EED896] [&>svg]:text-[#B8860B] *:data-[slot=alert-description]:text-[#785600]/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props} />
  );
}

function AlertTitle({
  className,
  ...props
}) {
  return (
    <div
      data-slot="alert-title"
      className={cn("col-start-2 line-clamp-1 min-h-4 font-bold tracking-tight text-foreground", className)}
      {...props} />
  );
}

function AlertDescription({
  className,
  ...props
}) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-xs [&_p]:leading-relaxed mt-0.5",
        className
      )}
      {...props} />
  );
}

export { Alert, AlertTitle, AlertDescription }
