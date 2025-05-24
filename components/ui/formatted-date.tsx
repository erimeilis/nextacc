'use client'
import React from 'react'
import { format, parseISO, isValid } from 'date-fns'
import { cn } from '@/lib/utils'

interface FormattedDateProps {
  date?: string
  className?: string
  format?: string
  fallback?: string
}

export function FormattedDate({
  date,
  className,
  format: formatString = 'MMM d, yyyy',
  fallback = 'N/A'
}: FormattedDateProps) {
  if (!date) return <span className={cn("text-muted-foreground text-sm", className)}>{fallback}</span>

  try {
    const parsedDate = parseISO(date)

    if (!isValid(parsedDate)) {
      return <span className={cn("text-muted-foreground text-sm", className)}>{fallback}</span>
    }

    return (
      <time 
        dateTime={date} 
        className={cn("text-sm", className)}
      >
        {format(parsedDate, formatString)}
      </time>
    )
  } catch {
    return <span className={cn("text-muted-foreground text-sm", className)}>{fallback}</span>
  }
}
