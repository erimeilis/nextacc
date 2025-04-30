import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

// Add Radio component for compatibility with flowbite-react
const Radio = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & {
    id?: string;
    name?: string;
    value?: string;
    defaultChecked?: boolean;
    checked?: boolean;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    "data-where_did"?: string;
    "data-setup_rate"?: string | number;
    "data-fix_rate"?: string | number;
    "data-voice"?: string;
    "data-sms"?: string;
    "data-fax"?: string;
    "data-toll_free"?: string;
    "data-incoming_per_minute"?: string | number;
    "data-toll_free_rate_in_min"?: string | number;
    "data-incoming_rate_sms"?: string | number;
    "data-docs"?: string;
  }
>(({ className, id, name, value, defaultChecked, checked, onChange, ...props }, ref) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Use controlled or uncontrolled component based on whether checked prop is provided
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked || false);

  // Use either the controlled value or the internal state
  const isChecked = isControlled ? checked : internalChecked;

  // Update internal state when checked prop changes
  React.useEffect(() => {
    if (isControlled) {
      setInternalChecked(checked);
    }
  }, [checked, isControlled]);

  const handleChange = (checkedValue: boolean) => {
    // Only update internal state if uncontrolled
    if (!isControlled) {
      setInternalChecked(checkedValue);
    }

    // Always trigger onChange when the radio is clicked
    if (onChange && inputRef.current) {
      // Update the hidden input's checked state
      inputRef.current.checked = checkedValue;

      // Create and dispatch a synthetic change event
      const event = new Event('change', { bubbles: true });
      inputRef.current.dispatchEvent(event);

      // Call the onChange handler with a synthetic React event
      onChange({
        target: inputRef.current
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={isChecked}
        onChange={(e) => {
          // This is needed for React controlled components
          if (onChange) {
            onChange(e);
          }
        }}
        className="hidden"
        {...props}
      />
      <RadioGroupPrimitive.Item
        ref={ref}
        value={value || ""}
        checked={isChecked}
        className={cn(
          "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
          className
        )}
        onCheckedChange={handleChange}
      >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <Circle className="h-2.5 w-2.5 fill-current text-current" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
    </>
  )
})
Radio.displayName = "Radio"

export { RadioGroup, RadioGroupItem, Radio }
