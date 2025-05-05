import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import {Circle} from 'lucide-react'

import {cn} from '@/lib/utils'

const RadioGroup = React.forwardRef<
    React.ElementRef<typeof RadioGroupPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({className, ...props}, ref) => {
    return (
        <RadioGroupPrimitive.Root
            className={cn('grid gap-2', className)}
            {...props}
            ref={ref}
        />
    )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
    React.ElementRef<typeof RadioGroupPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({className, ...props}, ref) => {
    return (
        <RadioGroupPrimitive.Item
            ref={ref}
            className={cn(
                'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            {...props}
        >
            <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
                <Circle className="h-2.5 w-2.5 fill-current text-current"/>
            </RadioGroupPrimitive.Indicator>
        </RadioGroupPrimitive.Item>
    )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

const Radio = React.forwardRef<
    HTMLInputElement,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'checked' | 'defaultChecked' | 'onChange'> & {
    id?: string;
    name?: string;
    value?: string;
    defaultChecked?: boolean;
    checked?: boolean;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    'data-where_did'?: string;
    'data-setup_rate'?: string | number;
    'data-fix_rate'?: string | number;
    'data-voice'?: string;
    'data-sms'?: string;
    'data-toll_free'?: string;
    'data-incoming_per_minute'?: string | number;
    'data-toll_free_rate_in_min'?: string | number;
    'data-incoming_rate_sms'?: string | number;
    'data-docs'?: string;
    className?: string;
}
>(({className, id, name, value, defaultChecked, checked, onChange, ...props}, ref) => {
    // Use controlled or uncontrolled component based on whether a checked prop is provided
    const isControlled = checked !== undefined
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked || false)

    // Use either the controlled value or the internal state
    const isChecked = isControlled ? checked : internalChecked

    // Update internal state when checked prop changes
    React.useEffect(() => {
        if (isControlled) {
            setInternalChecked(checked)
        }
    }, [checked, isControlled])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newChecked = e.target.checked

        // Only update internal state if uncontrolled
        if (!isControlled) {
            setInternalChecked(newChecked)
        }

        // Call the provided onChange handler
        if (onChange) {
            onChange(e)
        }
    }

    return (
        <div className="relative flex items-center">
            <input
                ref={ref}
                type="radio"
                id={id}
                name={name}
                value={value || ''}
                checked={isChecked}
                onChange={handleChange}
                className="absolute opacity-0 w-0 h-0" // Hide visually but keep accessible
                {...props}
            />
            <label
                htmlFor={id}
                className={cn(
                    'relative flex items-center justify-center w-4 h-4 rounded-full border border-primary cursor-pointer',
                    'before:content-[\'\'] before:absolute before:inset-0 before:rounded-full before:bg-transparent',
                    isChecked && 'before:bg-primary before:scale-50',
                    className
                )}
            >
                {isChecked && (
                    <span className="sr-only">Selected</span>
                )}
            </label>
        </div>
    )
})
Radio.displayName = 'Radio'

export {RadioGroup, RadioGroupItem, Radio}