import React from 'react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { ThemeDemo } from '@/components/ui/theme-demo'

export default function ThemeTestPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Theme Testing Page</h1>
          <p className="text-muted-foreground">
            Use the toggles to switch between themes and color schemes
          </p>
        </div>
        <ThemeToggle />
      </div>
      
      <div className="border rounded-lg p-6 bg-card shadow-sm">
        <ThemeDemo />
      </div>
    </div>
  )
} 