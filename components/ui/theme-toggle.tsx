'use client'

import * as React from 'react'
import {Moon, Palette, Sun} from '@phosphor-icons/react'
import { useTheme } from 'next-themes'
import usePersistState from '@/usePersistState'

import {Button} from '@/components/ui/button'
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from '@/components/ui/dropdown-menu'

const colorThemes = ['blue', 'pink', 'orange', 'teal', 'violet']

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [colorTheme, setColorTheme] = usePersistState('blue', 'color-theme')
  const [isMounted, setIsMounted] = React.useState(false)

  // Only run once after component mounts to avoid hydration mismatch
  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  // Apply color theme when component mounts or colorTheme changes
  React.useEffect(() => {
    if (!isMounted) return;

    // Apply color theme
    document.documentElement.classList.remove(...colorThemes)
    document.documentElement.classList.add(colorTheme)
  }, [isMounted, colorTheme])

  const toggleDarkMode = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const handleThemeChange = (newTheme: string) => {
    setColorTheme(newTheme)
  }

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="ghost" 
        size="icon" 
        className="rounded-lg p-2.5 text-sm text-muted-foreground hover:text-foreground focus:outline-none dark:text-muted-foreground dark:hover:text-foreground"
        onClick={toggleDarkMode}
      >
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle dark mode</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-lg p-2.5 text-sm text-muted-foreground hover:text-foreground focus:outline-none dark:text-muted-foreground dark:hover:text-foreground"
          >
            <Palette className="h-5 w-5" />
            <span className="sr-only">Toggle color theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleThemeChange('blue')} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            Blue
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleThemeChange('pink')} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-pink-500"></div>
            Pink
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleThemeChange('orange')} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            Orange
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleThemeChange('teal')} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-teal-500"></div>
            Teal
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleThemeChange('violet')} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-violet-500"></div>
            Violet
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
