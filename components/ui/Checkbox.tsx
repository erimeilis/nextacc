import * as React from 'react'
import {CheckIcon} from '@phosphor-icons/react'

import {cn} from '@/lib/utils'

const Checkbox = React.forwardRef<
    HTMLInputElement,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
    onCheckedChange?: (checked: boolean) => void
    variant?: 'default' | 'sm'
    customClass?: string
}
>(({className, onCheckedChange, variant = 'default', customClass, ...props}, ref) => {
    // We don't need to track checked state internally, we'll use the props directly
    // This ensures the component always reflects the current props.checked value
    const checked = props.checked || false

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Call the onCheckedChange prop with the checked state if it exists
        onCheckedChange?.(e.target.checked)

        // Call the original onChange handler if it exists
        props.onChange?.(e)
    }

    // Create a ref for the input element
    const inputRef = React.useRef<HTMLInputElement>(null)

    // Function to handle clicks on the custom checkbox
    const handleCustomCheckboxClick = () => {
        if (inputRef.current && !props.disabled) {
            // Toggle the checked state
            const newChecked = !checked

            // Call the onCheckedChange prop with the new checked state
            onCheckedChange?.(newChecked)

            // If there's an onChange handler, create a synthetic event and call it
            if (props.onChange && inputRef.current) {
                // Update the input's checked state
                inputRef.current.checked = newChecked

                // Create a synthetic change event that matches React's expected type
                const nativeEvent = new Event('change', { bubbles: true });
                // Create a React change event with the input as target
                const syntheticEvent = {
                    nativeEvent,
                    currentTarget: inputRef.current,
                    target: inputRef.current,
                    bubbles: nativeEvent.bubbles,
                    cancelable: nativeEvent.cancelable,
                    defaultPrevented: nativeEvent.defaultPrevented,
                    preventDefault: nativeEvent.preventDefault,
                    isDefaultPrevented: () => false,
                    stopPropagation: () => {},
                    isPropagationStopped: () => false,
                    persist: () => {},
                    timeStamp: Date.now(),
                    type: 'change'
                } as React.ChangeEvent<HTMLInputElement>;

                // Call the onChange handler with the synthetic event
                props.onChange(syntheticEvent)
            }
        }
    }

    // Size-based dimensions
    const sizeClasses = {
        default: {
            container: 'h-4 w-4',
            icon: 'h-3 w-3'
        },
        sm: {
            container: 'h-3 w-3',
            icon: 'h-2 w-2'
        }
    } as const

    const currentSize = sizeClasses[variant]

    return (
        <div className={cn("relative flex items-center", customClass)}>
            <input
                type="checkbox"
                className={cn(
                    'sr-only', // Hide visually but keep accessible
                    className
                )}
                ref={(node) => {
                    // Handle both the forwarded ref and our internal ref
                    if (typeof ref === 'function') ref(node)
                    else if (ref) ref.current = node
                    if (node) {
                        // Use a mutable ref type to allow assignment
                        (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node
                    }
                }}
                onChange={handleChange}
                checked={checked}
                {...props}
            />
            <div
                onClick={handleCustomCheckboxClick}
                className={cn(
                    currentSize.container,
                    'rounded-full border border-primary flex items-center justify-center cursor-pointer',
                    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    props.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                    checked ? 'bg-primary border-primary' : 'bg-transparent',
                    'transition-colors duration-200'
                )}
            >
                <CheckIcon
                    className={cn(
                        currentSize.icon,
                        'text-primary-foreground transition-opacity duration-200',
                        checked ? 'opacity-100' : 'opacity-0'
                    )}
                />
            </div>
        </div>
    )
})
Checkbox.displayName = 'Checkbox'

export {Checkbox}
