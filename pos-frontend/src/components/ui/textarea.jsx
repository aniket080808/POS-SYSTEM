import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({
  className,
  value,
  onChange,
  readOnly,
  ...props
}) {
  const isControlled = value !== undefined;
  const safeValue = value === null ? "" : value;

  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground flex min-h-20 w-full rounded-xl border bg-card px-3.5 py-2.5 text-sm text-foreground shadow-2xs transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-ring aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
        className
      )}
      {...(isControlled ? { value: safeValue } : {})}
      onChange={onChange}
      readOnly={readOnly || (isControlled && !onChange ? true : undefined)}
      {...props}
    />
  );
}

export { Textarea }
