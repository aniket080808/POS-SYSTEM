import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-muted/80 animate-pulse rounded-xl", className)}
      {...props} />
  );
}

export { Skeleton }
