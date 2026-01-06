'use client'
import React, {useEffect, useState} from 'react'
import {useIsClient} from '@/hooks/use-is-client'
import {useTranslations} from 'next-intl'
import {useTheme} from 'next-themes'
import {usePathname, useSearchParams} from 'next/navigation'
import {routing} from '@/i18n/routing'
import {Button} from '@/components/ui/primitives/Button'
import {MoonIcon, PaletteIcon, SunIcon, TranslateIcon} from '@phosphor-icons/react'
import usePersistState from '@/utils/usePersistState'

interface MobileSwitchersProps {
    dropDirection?: 'up' | 'down'
}

export default function MobileSwitchers({ dropDirection = 'up' }: MobileSwitchersProps) {
    const t = useTranslations('common')
    const pathName = usePathname()
    const searchParams = useSearchParams()
    const search = searchParams && searchParams.size > 0 ? `?${searchParams.toString()}` : ''
    const {theme, setTheme} = useTheme()
    const [colorTheme, setColorTheme] = usePersistState('equinox', 'color-theme')
    const [expandedSection, setExpandedSection] = useState<string | null>(null)
    const isClient = useIsClient()

    // Apply color theme when the component mounts or colorTheme changes
    useEffect(() => {
        if (!isClient) return

        // Apply color theme
        document.documentElement.classList.remove('equinox', 'reef', 'void')
        document.documentElement.classList.add(colorTheme)
    }, [isClient, colorTheme])

    // Map of locale codes to flag emojis
    const localeFlags: Record<string, string> = {
        'en': '🇬🇧',
        'pl': '🇵🇱',
        'uk': '🇺🇦',
    }

    const colorThemes = [
        {id: 'equinox', name: 'Equinox', colors: ['bg-orange-500', 'bg-blue-300']},
        {id: 'reef', name: 'Reef', colors: ['bg-teal-500', 'bg-pink-300']},
        {id: 'void', name: 'Void', colors: ['bg-black', 'bg-white']},
    ]

    const toggleSection = (e: React.MouseEvent, section: string) => {
        e.stopPropagation()
        if (expandedSection === section) {
            setExpandedSection(null)
        } else {
            setExpandedSection(section)
        }
    }

    const redirectedPathName = (locale: string) => {
        if (!pathName) {
            return '/'
        } else {
            const segments = pathName.split('/')
            segments[1] = locale
            return segments.join('/')
        }
    }

    const toggleDarkMode = (e: React.MouseEvent) => {
        e.stopPropagation()
        setTheme(theme === 'dark' ? 'light' : 'dark')
    }

    const handleThemeChange = (e: React.MouseEvent, newTheme: string) => {
        e.stopPropagation()
        setColorTheme(newTheme)
        setExpandedSection(null)
    }

    return (
        <div className="flex flex-col relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center space-x-2">
                {/* Language Button */}
                <Button
                    variant="navIcon"
                    size="icon"
                    className="rounded-lg text-sm"
                    onClick={(e) => toggleSection(e, 'language')}
                >
                    <TranslateIcon className="h-4 w-4 dark:text-white text-black"/>
                    <span className="sr-only">{t('locale')}</span>
                </Button>

                {/* Dark/Light mode toggle */}
                <Button
                    variant="navIcon"
                    size="icon"
                    className="rounded-lg text-sm"
                    onClick={(e) => toggleDarkMode(e)}
                >
                    <SunIcon className="h-4 w-4 rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0 dark:text-white text-black"/>
                    <MoonIcon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 dark:text-white text-black"/>
                    <span className="sr-only">Toggle dark mode</span>
                </Button>

                {/* Color theme Button */}
                <Button
                    variant="navIcon"
                    size="icon"
                    className="rounded-lg text-sm"
                    onClick={(e) => toggleSection(e, 'colorTheme')}
                >
                    <PaletteIcon className="h-4 w-4 dark:text-white text-black"/>
                    <span className="sr-only">Toggle color theme</span>
                </Button>
            </div>

            {/* Language Accordion - positioned based on dropDirection */}
            <div className={`absolute ${dropDirection === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'} left-0 right-0 w-full overflow-hidden transition-all duration-300 ease-in-out ${expandedSection === 'language' ? 'max-h-40' : 'max-h-0'}`}>
                <div className="p-2 bg-background/95 dark:bg-background/95 shadow-md backdrop-blur-sm rounded-md w-full border border-border">
                    <div className="flex flex-col space-y-1">
                        {routing.locales.map((locale) => (
                            <Button
                                key={locale}
                                variant="ghost"
                                size="sm"
                                className="flex items-center justify-start gap-2 h-8 w-full"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    window.location.href = redirectedPathName(locale) + search
                                }}
                            >
                                <span className="text-base">{localeFlags[locale]}</span>
                                <span>{locale}</span>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Color Theme Accordion - positioned based on dropDirection */}
            <div className={`absolute ${dropDirection === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'} left-0 right-0 w-full overflow-hidden transition-all duration-300 ease-in-out ${expandedSection === 'colorTheme' ? 'max-h-40' : 'max-h-0'}`}>
                <div className="p-2 bg-background/95 dark:bg-background/95 shadow-md backdrop-blur-sm rounded-md w-full border border-border">
                    <div className="flex flex-col space-y-1">
                        {colorThemes.map((themeOption) => (
                            <Button
                                key={themeOption.id}
                                variant="ghost"
                                size="sm"
                                className="flex items-center justify-start gap-2 h-8 w-full"
                                onClick={(e) => handleThemeChange(e, themeOption.id)}
                            >
                                <div className="relative w-5 h-5">
                                    <div className={`absolute inset-0 rounded-full ${themeOption.colors[0]}`}></div>
                                    <div className={`absolute inset-[5px] rounded-full ${themeOption.colors[1]}`}></div>
                                </div>
                                {themeOption.name}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
