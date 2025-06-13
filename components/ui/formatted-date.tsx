'use client'
import React from 'react'
import { format, parseISO, isValid } from 'date-fns'
import { cn } from '@/lib/utils'

interface FormattedDateProps {
  date?: string
  className?: string
  format?: string
  fallback?: string
  showTime?: boolean
}

export function FormattedDate({
  date,
  className,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  format: formatString = 'MMM d, yy', // Unused but kept for backward compatibility
  fallback = 'N/A',
  showTime = false
}: FormattedDateProps) {
  if (!date) return <span className={cn("text-muted-foreground text-sm", className)}>{fallback}</span>

  try {
    const parsedDate = parseISO(date)

    if (!isValid(parsedDate)) {
      return <span className={cn("text-muted-foreground text-sm", className)}>{fallback}</span>
    }

    // Format the date parts separately to apply different styles
    const day = format(parsedDate, 'd')
    const monthYear = format(parsedDate, showTime ? 'MMM, yy HH:mm' : 'MMM, yy')

    return (
      <time 
        dateTime={date} 
        className={cn(className)}
      >
        {day} <span>{monthYear}</span>
      </time>
    )
  } catch {
    return <span className={cn("text-muted-foreground text-sm", className)}>{fallback}</span>
  }
}
