'use client'
import {routing} from '@/i18n/routing'
//import {CaretDown} from '@phosphor-icons/react'
import { Dropdown } from '@/components/ui/dropdown'
import {useTranslations} from 'next-intl'
import {usePathname, useSearchParams} from 'next/navigation'

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
    const search = searchParams.size > 0 ? `?${searchParams.toString()}` : ''

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
        <Dropdown label={t('locale')} inline /*arrowIcon={CaretDown}*/>
            {routing.locales.map((locale) => (
                <Dropdown.Item
                    key={locale}
                    href={redirectedPathName(locale) + search}
                    className="flex items-center gap-2"
                >
                    <span className="text-base">{localeFlags[locale]}</span>
                    <span>{locale}</span>
                </Dropdown.Item>
            ))}
        </Dropdown>
    )
}
