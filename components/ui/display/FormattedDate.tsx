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

// Helper function to safely parse and format date (runs before JSX rendering)
function parseDateSafely(date: string, showTime: boolean): { day: string; monthYear: string } | null {
  try {
    const parsedDate = parseISO(date)
    if (!isValid(parsedDate)) {
      return null
    }
    return {
      day: format(parsedDate, 'd'),
      monthYear: format(parsedDate, showTime ? 'MMM, yy HH:mm' : 'MMM, yy')
    }
  } catch {
    return null
  }
}

export function FormattedDate({
  date,
  className,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  format: formatString = 'MMM d, yy', // Unused but kept for backward compatibility
  fallback = 'N/A',
  showTime = false
}: FormattedDateProps) {
  // Early return for missing date
  if (!date) {
    return <span className={cn("text-muted-foreground text-sm", className)}>{fallback}</span>
  }

  // Parse date before JSX (avoids try/catch around JSX - React 19 pattern)
  const parsed = parseDateSafely(date, showTime)

  // Return fallback if parsing failed
  if (!parsed) {
    return <span className={cn("text-muted-foreground text-sm", className)}>{fallback}</span>
  }

  // Return formatted date (no try/catch around JSX)
  return (
    <time
      dateTime={date}
      className={cn(className)}
    >
      {parsed.day} <span>{parsed.monthYear}</span>
    </time>
  )
}
