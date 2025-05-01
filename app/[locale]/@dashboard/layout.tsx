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

    return <Show when={(session.status === 'authenticated') && (session.data?.user?.provider !== 'anonymous')}
                 fallback={
                     <Show when={session.status === 'loading'}
                           fallback={<Login/>}>
                         <Loader height={350}/>
                     </Show>
                 }>
        <div className="flex flex-col rounded-md w-full border border-border bg-muted drop-shadow text-foreground
        dark:border-border dark:bg-background dark:text-foreground overflow-hidden">
            <nav className="flex flex-row w-full justify-evenly bg-muted dark:bg-muted">
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
