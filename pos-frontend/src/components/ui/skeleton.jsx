import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-muted/80 animate-pulse rounded-lg", className)}
      {...props} />
  );
}

export { Skeleton }
