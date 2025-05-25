'use client'

import React from 'react'
import clsx from 'clsx'

interface BooleanDotProps {
    value: boolean
    className?: string
}

export default function BooleanDot({value, className = ''}: BooleanDotProps) {
    if (!value) return null

    return (
        <div className="flex justify-center">
            <div className={clsx('w-2 h-2 rounded-full bg-primary', className)}/>
        </div>
    )
}