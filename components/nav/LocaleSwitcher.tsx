'use client'
import {routing} from '@/i18n/routing'
import {useTranslations} from 'next-intl'
import {usePathname, useSearchParams} from 'next/navigation'
import {Button} from '@/components/ui/button'
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/components/ui/dropdown-menu'

// Map of locale codes to flag emojis
const localeFlags: Record<string, string> = {
    'en': '🇬🇧',
    'pl': '🇵🇱',
    'uk': '🇺🇦',
}

export default function LocaleSwitcher() {
    const t = useTranslations('common')
    const pathName = usePathname()
    const searchParams = useSearchParams()
    const search = searchParams && searchParams.size > 0 ? `?${searchParams.toString()}` : ''

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
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="navIcon"
                    className="flex items-center gap-2"
                >
                    {t('locale')}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-fit z-[10000] shadow-xl shadow-mute dark:shadow-black" align="end" forceMount>
                {routing.locales.map((locale) => (
                    <DropdownMenuItem
                        key={locale}
                        className="flex items-center gap-2"
                        onClick={() => window.location.href = redirectedPathName(locale) + search}
                    >
                        <span className="text-base">{localeFlags[locale]}</span>
                        <span>{locale}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
