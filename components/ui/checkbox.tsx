import * as React from "react"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <div className="relative flex items-center">
    <input
      type="checkbox"
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        className
      )}
      ref={ref}
      {...props}
    />
    <div className="absolute left-0 top-0 flex h-4 w-4 items-center justify-center">
      <CheckIcon className="h-3 w-3 text-primary-foreground opacity-0 peer-checked:opacity-100" />
    </div>
  </div>
))
Checkbox.displayName = "Checkbox"

export { Checkbox }