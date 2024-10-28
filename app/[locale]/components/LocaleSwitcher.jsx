'use client'
import {routing} from '@/i18n/routing'
import {CaretDown} from '@phosphor-icons/react'
import {Dropdown} from 'flowbite-react'
import {useTranslations} from 'next-intl'
import {usePathname, useSearchParams} from 'next/navigation'

export default function LocaleSwitcher() {
    const t = useTranslations('common')

    const pathName = usePathname()
    const searchParams = useSearchParams()
    const search = `?${searchParams.toString()}`

    const redirectedPathName = (locale) => {
        if (!pathName) return '/'
        const segments = pathName.split('/')
        segments[1] = locale
        return segments.join('/')
    }

    return (
        <Dropdown label={t('locale')} inline arrowIcon={CaretDown}>
            {routing.locales.map((locale) => (
                <Dropdown.Item
                    key={locale}
                    //icon={Flag.code = `${locale.toUpperCase()}`}
                    href={redirectedPathName(locale) + search}
                >
                    {locale}
                </Dropdown.Item>
            ))}
        </Dropdown>
    )
}