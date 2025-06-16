'use client'
import {routing} from '@/i18n/routing'
import {useTranslations} from 'next-intl'
import {usePathname, useSearchParams} from 'next/navigation'
import {Button} from '@/components/ui/Button'
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/components/ui/DropdownMenu'
import {TranslateIcon} from '@phosphor-icons/react'
import {useState} from 'react'

// Map of locale codes to flag emojis
const localeFlags: Record<string, string> = {
    'en': '🇬🇧',
    'pl': '🇵🇱',
    'uk': '🇺🇦',
}

export default function MobileLocaleSwitcher() {
    const t = useTranslations('common')
    const pathName = usePathname()
    const searchParams = useSearchParams()
    const search = searchParams && searchParams.size > 0 ? `?${searchParams.toString()}` : ''
    const [isLocaleMenuOpen, setIsLocaleMenuOpen] = useState(false)

    const redirectedPathName = (locale: string) => {
        if (!pathName) {
            return '/'
        } else {
            const segments = pathName.split('/')
            segments[1] = locale
            return segments.join('/')
        }
    }

    return (
        <DropdownMenu open={isLocaleMenuOpen} onOpenChange={setIsLocaleMenuOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="navIcon"
                    size="icon"
                    className="rounded-lg p-2.5 text-sm"
                >
                    <TranslateIcon className="h-5 w-5 dark:text-white text-black"/>
                    <span className="sr-only">{t('locale')}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-fit z-[10000] shadow-sm shadow-mute dark:shadow-black" align="center" forceMount>
                {routing.locales.map((locale) => (
                    <DropdownMenuItem
                        key={locale}
                        className="flex items-center gap-2"
                        onClick={() => {
                            window.location.href = redirectedPathName(locale) + search
                            setIsLocaleMenuOpen(false)
                        }}
                    >
                        <span className="text-base">{localeFlags[locale]}</span>
                        <span>{locale}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
