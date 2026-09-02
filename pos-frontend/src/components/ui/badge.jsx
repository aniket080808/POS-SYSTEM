import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none transition-colors",
  {
    variants: {
      variant: {
        // 1. Success / Active / Completed / In Stock / Paid (Light Warm Amber-Gold Pill)
        success:
          "border-[#FAD074] bg-[#FFF8E7] text-[#8C5800] font-bold shadow-2xs",
        active:
          "border-[#FAD074] bg-[#FFF8E7] text-[#8C5800] font-bold shadow-2xs",
        
        // 2. Warning / Pending / Processing / Low Stock (Light Warm Tangerine/Amber Pill)
        warning:
          "border-[#FED7AA] bg-[#FFF7ED] text-[#C2410C] font-semibold",
        pending:
          "border-[#FED7AA] bg-[#FFF7ED] text-[#C2410C] font-semibold",
        
        // 3. Error / Danger / Blocked / Rejected / Out of Stock (Light Warm Terracotta Pill)
        destructive:
          "border-[#FECACA] bg-[#FEF2F2] text-[#991B1B] font-semibold",
        error:
          "border-[#FECACA] bg-[#FEF2F2] text-[#991B1B] font-semibold",

        // 4. Inactive / Draft / Neutral / Closed (Light Neutral Sand/Gray Pill)
        secondary:
          "border-[#E4DFD3] bg-[#F5F2EB] text-[#5C5952] font-medium",
        inactive:
          "border-[#E4DFD3] bg-[#F5F2EB] text-[#5C5952] font-medium",
        neutral:
          "border-[#E4DFD3] bg-[#F5F2EB] text-[#5C5952] font-medium",

        default:
          "border-[#FAD074] bg-[#FFF8E7] text-[#8C5800] font-bold",
        outline:
          "border-border text-foreground bg-card",
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
