'use client'

import React from 'react'
import clsx from 'clsx'

interface BooleanDotProps {
    value: boolean | null
    className?: string
    label?: string
    labelClassName?: string
}

export default function BooleanDot({value, className = '', label, labelClassName = ''}: BooleanDotProps) {
    // Determine the color based on the value
    let dotColor = 'bg-primary'

    if (value === null) {
        dotColor = 'bg-yellow-500'
    } else if (!value) {
        dotColor = 'bg-gray-400'
    }

    return (
        <div className="flex items-center justify-center">
            <div className={clsx('w-2 h-2 rounded-full', dotColor, className)}/>
            {label && (
                <span className={clsx('ml-2 text-xs', labelClassName)}>
                    {label}
                </span>
            )}
        </div>
    )
}
