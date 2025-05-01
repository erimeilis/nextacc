'use client'

import * as React from 'react'
import {Moon, Palette, Sun} from '@phosphor-icons/react'
import usePersistState from '@/usePersistState'

import {Button} from '@/components/ui/button'
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from '@/components/ui/dropdown-menu'

const colorThemes = ['blue', 'pink', 'orange', 'teal', 'violet']

export function ThemeToggle() {
  const [persistedTheme, setPersistedTheme] = usePersistState('blue', 'color-theme')
  const [isDarkMode, setIsDarkMode] = usePersistState(true, 'dark-mode')
  const [isMounted, setIsMounted] = React.useState(false)

  // Only run once after component mounts to avoid hydration mismatch
  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  React.useEffect(() => {
    if (!isMounted) return;

    // Block transitions during theme change
    document.documentElement.style.setProperty('transition', 'none');

    if (persistedTheme) {
      document.documentElement.classList.remove(...colorThemes)
      document.documentElement.classList.add(persistedTheme)
    }
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', 'dark');
    } else {
      document.documentElement.classList.remove('dark')
      document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', 'light');
    }

    // Re-enable transitions after a small delay
    setTimeout(() => {
      document.documentElement.style.removeProperty('transition');
    }, 100);
  }, [persistedTheme, isDarkMode, isMounted])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const handleThemeChange = (newTheme: string) => {
    setPersistedTheme(newTheme)
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
          <DropdownMenuItem onClick={() => handleThemeChange('blue')}>
            Blue
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleThemeChange('pink')}>
            Pink
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleThemeChange('orange')}>
            Orange
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleThemeChange('teal')}>
            Teal
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleThemeChange('violet')}>
            Violet
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
