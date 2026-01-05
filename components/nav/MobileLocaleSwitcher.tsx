'use client'
import {routing, usePathname, useRouter} from '@/i18n/routing'
import {useTranslations} from 'next-intl'
import {useSearchParams} from 'next/navigation'
import {Button} from '@/components/ui/Button'
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/components/ui/DropdownMenu'
import {TranslateIcon} from '@phosphor-icons/react'
import {useState, useTransition} from 'react'

// Map of locale codes to flag emojis
const localeFlags: Record<string, string> = {
    'en': '🇬🇧',
    'pl': '🇵🇱',
    'uk': '🇺🇦',
}

export default function MobileLocaleSwitcher() {
    const t = useTranslations('common')
    const pathname = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isLocaleMenuOpen, setIsLocaleMenuOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const handleLocaleChange = (locale: string) => {
        setIsLocaleMenuOpen(false)
        startTransition(() => {
            // Build query string from searchParams
            const query = searchParams && searchParams.size > 0
                ? Object.fromEntries(searchParams.entries())
                : undefined

            router.replace(
                query ? {pathname, query} : pathname,
                {locale}
            )
        })
    }

    return (
        <DropdownMenu open={isLocaleMenuOpen} onOpenChange={setIsLocaleMenuOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="navIcon"
                    size="icon"
                    className="rounded-lg p-2.5 text-sm"
                    disabled={isPending}
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
                        onClick={() => handleLocaleChange(locale)}
                    >
                        <span className="text-base">{localeFlags[locale]}</span>
                        <span>{locale}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
