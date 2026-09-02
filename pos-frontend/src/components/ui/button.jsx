import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-[#B08B1B] active:bg-[#967414]",
        destructive:
          "bg-destructive text-white shadow-sm hover:bg-[#8F432D] focus-visible:ring-destructive/30",
        outline:
          "border border-border bg-card text-foreground shadow-2xs hover:bg-secondary hover:border-[#D4CEBF]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-2xs hover:bg-[#E7E2D5]",
        ghost:
          "text-foreground hover:bg-secondary hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline hover:text-[#B08B1B]",
      },
      size: {
        default: "h-11 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-lg text-xs gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-12 rounded-xl text-base px-6 has-[>svg]:px-4",
        icon: "size-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }
