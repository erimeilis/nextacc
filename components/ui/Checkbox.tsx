import * as React from 'react'
import {CheckIcon} from '@phosphor-icons/react'

import {cn} from '@/lib/utils'

const Checkbox = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement> & { onCheckedChange?: (checked: boolean) => void }
>(({className, onCheckedChange, ...props}, ref) => {
    // We don't need to track checked state internally, we'll use the props directly
    // This ensures the component always reflects the current props.checked value
    const checked = props.checked || false

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log('Checkbox handleChange called with:', e.target.checked)

        // Call the onCheckedChange prop with the checked state if it exists
        onCheckedChange?.(e.target.checked)

        // Call the original onChange handler if it exists
        props.onChange?.(e)
    }

    // Create a ref for the input element
    const inputRef = React.useRef<HTMLInputElement>(null)

    // Function to handle clicks on the custom checkbox
    const handleCustomCheckboxClick = () => {
        console.log('handleCustomCheckboxClick called, current checked state:', checked)
        if (inputRef.current && !props.disabled) {
            console.log('Clicking input element')
            // Instead of clicking the input element, directly call the onCheckedChange prop
            // This should ensure the event is always triggered
            onCheckedChange?.(!checked)

            // Also trigger the onChange event on the input element
            const event = new Event('change', { bubbles: true })
            Object.defineProperty(event, 'target', { value: { checked: !checked } })
            inputRef.current.dispatchEvent(event)
        }
    }

    return (
        <div className="relative flex items-center">
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
                    'h-4 w-4 rounded-full border border-primary flex items-center justify-center cursor-pointer',
                    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    props.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                    checked ? 'bg-primary border-primary' : 'bg-transparent',
                    'transition-colors duration-200'
                )}
            >
                <CheckIcon
                    className={cn(
                        'h-3 w-3 text-primary-foreground transition-opacity duration-200',
                        checked ? 'opacity-100' : 'opacity-0'
                    )}
                />
            </div>
        </div>
    )
})
Checkbox.displayName = 'Checkbox'

export {Checkbox}
