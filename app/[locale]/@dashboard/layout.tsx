'use client'
import React from 'react'
import {useSession} from 'next-auth/react'
import Show from '@/components/service/Show'
import Login from '@/components/Login'
import Loader from '@/components/service/Loader'
import {usePathname, useRouter, useSearchParams} from 'next/navigation'
import {profileTabs} from '@/constants/profileTabs'
import {useTranslations} from 'next-intl'
import Tab from '@/components/shared/Tab'

export default function Layout({children}: { children: React.ReactNode }) {
    const session = useSession()
    const router = useRouter()

    const t = useTranslations('dashboard')
    const pathName = usePathname()
    const searchParams = useSearchParams()
    const search = searchParams.size > 0 ? `?${searchParams.toString()}` : ''

    const activePathName = () => {
        if (!pathName) {
            return 'profile'
        } else {
            const segments = pathName.split('/')
            return segments[2] ? segments[2] : 'profile'
        }
    }

    return <Show when={session.status === 'authenticated'}
                 fallback={
                     <Show when={session.status === 'loading'}
                           fallback={<Login/>}>
                         <Loader height={350}/>
                     </Show>
                 }>
        <div className="flex flex-col rounded-md w-full border border-gray-200 bg-gray-100 drop-shadow text-gray-800
        dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-200">
            <nav className="flex flex-row w-full justify-evenly bg-gray-200 dark:bg-indigo-900">
                {profileTabs.map(tab =>
                    <Tab
                        key={tab.slug}
                        type="button"
                        onClick={() => router.push('/' + tab.slug + search)}
                        active={activePathName() === tab.slug}
                        icon={tab.icon}
                    >
                        {t(tab.name)}
                    </Tab>
                )}
            </nav>
            <div className="h-full justify-center gap-4 p-6">{children}</div>
        </div>
    </Show>
}