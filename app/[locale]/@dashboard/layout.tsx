'use client'
import React, {useCallback, useEffect, useState} from 'react'
import {useSession} from 'next-auth/react'
import Show from '@/components/service/Show'
import Login from '@/components/Login'
import Loader from '@/components/service/Loader'
import SkeletonLoader from '@/components/service/SkeletonLoader'
import {usePathname, useRouter, useSearchParams} from 'next/navigation'
import {profileTabs} from '@/constants/profileTabs'
import {useTranslations} from 'next-intl'
import Tab from '@/components/shared/Tab'

declare module 'next-auth' {
    interface User {
        provider: string;
        // Add any other custom properties you need
    }

    interface Session {
        user?: User;
    }
}

export default function Layout({children}: { children: React.ReactNode }) {
    const session = useSession()
    const router = useRouter()

    const t = useTranslations('dashboard')
    const pathName = usePathname()
    const searchParams = useSearchParams()
    const search = searchParams && searchParams.size > 0 ? `?${searchParams.toString()}` : ''

    // Get the current active tab from the URL
    const getCurrentTab = useCallback(() => {
        if (!pathName) {
            return 'profile'
        } else {
            const segments = pathName.split('/')
            return segments[2] ? segments[2] : 'profile'
        }
    }, [pathName])

    // State to track the active tab
    const [activeTab, setActiveTab] = useState(getCurrentTab())
    // State to track loading state when switching tabs
    const [isLoading, setIsLoading] = useState(false)

    // Update activeTab when the URL changes
    useEffect(() => {
        setActiveTab(getCurrentTab())
        // When URL changes, content has loaded
        setIsLoading(false)
    }, [getCurrentTab])

    return <Show when={(session.status === 'authenticated') && (session.data?.user?.provider !== 'anonymous')}
                 fallback={
                     <Show when={session.status === 'loading'}
                           fallback={<Login/>}>
                         <Loader height={350}/>
                     </Show>
                 }>
        <div className="flex flex-col rounded-md w-full border border-border bg-gradient-to-br from-secondary to-background drop-shadow text-foreground
        dark:border-border dark:bg-gradient-to-br dark:from-secondary dark:to-background dark:text-foreground overflow-hidden">
            <nav className="flex flex-row w-full justify-evenly bg-muted dark:bg-muted">
                {profileTabs.map(tab =>
                    <Tab
                        key={tab.slug}
                        type="button"
                        onClick={() => {
                            // Update active tab state immediately
                            setActiveTab(tab.slug)
                            // Set loading state to true
                            setIsLoading(true)
                            // Then initiate route change
                            router.push('/' + tab.slug + search)
                        }}
                        active={activeTab === tab.slug}
                        icon={tab.icon}
                    >
                        {t(tab.name)}
                    </Tab>
                )}
            </nav>
            <div className="h-full justify-center gap-4 p-6">
                {isLoading ? (
                    <SkeletonLoader />
                ) : (
                    children
                )}
            </div>
        </div>
    </Show>
}
