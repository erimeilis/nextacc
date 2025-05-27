'use client'

import * as React from 'react'
import {MoonIcon, PaletteIcon, SunIcon} from '@phosphor-icons/react'
import {useTheme} from 'next-themes'
import usePersistState from '@/utils/usePersistState'

import {Button} from '@/components/ui/button'
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from '@/components/ui/dropdown-menu'

const colorThemes = ['equinox', 'reef', 'void']

export function ThemeToggle() {
    const {theme, setTheme} = useTheme()
    const [colorTheme, setColorTheme] = usePersistState('equinox', 'color-theme')
    const [isMounted, setIsMounted] = React.useState(false)

    // Only run once after component mounts to avoid hydration mismatch
    React.useEffect(() => {
        setIsMounted(true)
    }, [])

    // Apply color theme when component mounts or colorTheme changes
    React.useEffect(() => {
        if (!isMounted) return

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
                variant="navIcon"
                size="icon"
                className="rounded-lg p-2.5 text-sm"
                onClick={toggleDarkMode}
            >
                <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0"/>
                <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"/>
                <span className="sr-only">Toggle dark mode</span>
            </Button>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="navIcon"
                        size="icon"
                        className="rounded-lg p-2.5 text-sm"
                    >
                        <PaletteIcon className="h-5 w-5"/>
                        <span className="sr-only">Toggle color theme</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 z-[10000] shadow-xl shadow-mute dark:shadow-black" align="end" forceMount>
                    <DropdownMenuItem onClick={() => handleThemeChange('equinox')} className="flex items-center gap-2">
                        <div className="relative w-5 h-5">
                            <div className="absolute inset-0 rounded-full bg-orange-500"></div>
                            <div className="absolute inset-[5px] rounded-full bg-blue-300"></div>
                        </div>
                        Equinox
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleThemeChange('reef')} className="flex items-center gap-2">
                        <div className="relative w-5 h-5">
                            <div className="absolute inset-0 rounded-full bg-teal-500"></div>
                            <div className="absolute inset-[5px] rounded-full bg-pink-300"></div>
                        </div>
                        Reef
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleThemeChange('void')} className="flex items-center gap-2">
                        <div className="relative w-5 h-5">
                            <div className="absolute inset-0 rounded-full bg-black"></div>
                            <div className="absolute inset-[5px] rounded-full bg-white"></div>
                        </div>
                        Void
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
