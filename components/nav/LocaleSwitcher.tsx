'use client'
import {routing, usePathname, useRouter} from '@/i18n/routing'
import {useTranslations} from 'next-intl'
import {useSearchParams} from 'next/navigation'
import {useTransition} from 'react'
import {Button} from '@/components/ui/Button'
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/components/ui/DropdownMenu'

// Map of locale codes to flag emojis
const localeFlags: Record<string, string> = {
    'en': '🇬🇧',
    'pl': '🇵🇱',
    'uk': '🇺🇦',
}

export default function LocaleSwitcher() {
    const t = useTranslations('common')
    const pathname = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const handleLocaleChange = (locale: string) => {
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
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="navIcon"
                    className="flex items-center gap-2"
                    disabled={isPending}
                >
                    {t('locale')}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-fit z-[10000] shadow-md shadow-mute/50 dark:shadow-black/50" align="end" forceMount>
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
