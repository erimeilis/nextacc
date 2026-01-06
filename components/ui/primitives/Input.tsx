import * as React from "react"

import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  hideLabel?: boolean
  // Custom props that should not be passed to the DOM element
  handleChangeAction?: (e: React.ChangeEvent<HTMLInputElement>) => void
  labelText?: string
  labelFor?: string
  isRequired?: boolean
  error?: string
  icon?: React.ReactNode
  customClass?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    hideLabel, 
    handleChangeAction, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    labelText, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    labelFor, 
    isRequired, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    error, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    icon, 
    customClass, 
    onChange,
    required,
    ...props 
  }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
          customClass
        )}
        ref={ref}
        onChange={handleChangeAction || onChange}
        required={isRequired || required}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
