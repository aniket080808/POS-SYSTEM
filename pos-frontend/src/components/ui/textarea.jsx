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
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
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
