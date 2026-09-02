import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  value,
  onChange,
  readOnly,
  ...props
}) {
  const isControlled = value !== undefined;
  const safeValue = value === null ? "" : value;

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground/60 border-input flex h-11 w-full min-w-0 rounded-xl border bg-card px-3.5 py-2 text-sm text-foreground shadow-2xs transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus:border-primary focus:ring-2 focus:ring-primary/20",
        "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
        className
      )}
      {...(isControlled ? { value: safeValue } : {})}
      onChange={onChange}
      readOnly={readOnly || (isControlled && !onChange ? true : undefined)}
      {...props}
    />
  );
}

export { Input }
