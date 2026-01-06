import * as React from 'react'
import {DotOutlineIcon} from '@phosphor-icons/react'
import {cn} from '@/lib/utils'

interface BooleanProps {
    value: boolean | null
    className?: string
    label?: string
    labelClassName?: string
}

const Boolean = ({value, className, label, labelClassName}: BooleanProps) => {
    // Determine color based on value
    let colorClasses = 'text-green-300 fill-green-300'

    if (value === null) {
        colorClasses = 'text-yellow-500 fill-yellow-500'
    } else if (value === false) {
        colorClasses = 'text-red-300 fill-red-300'
    }

    return (
        <div className={cn('flex items-center', className)}>
            <DotOutlineIcon
                className={cn(
                    'h-6 w-6',
                    colorClasses
                )}
            />
            {label && (
                <span className={cn('ml-2 text-xs', labelClassName)}>
                    {label}
                </span>
            )}
        </div>
    )
}

export {Boolean}
