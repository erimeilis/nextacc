'use client'
import React, {useCallback, useEffect, useState, useRef} from 'react'
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

    // Refs for DOM elements
    const tabsContainerRef = useRef<HTMLElement | null>(null)
    const leftArrowRef = useRef<HTMLButtonElement | null>(null)
    const rightArrowRef = useRef<HTMLButtonElement | null>(null)

    // State to track if scrolling is possible
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)

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

    // Check if scrolling is possible and update arrow visibility
    const checkScrollability = useCallback(() => {
        const container = tabsContainerRef.current
        if (container) {
            // Check if we can scroll left
            setCanScrollLeft(container.scrollLeft > 0)
            // Check if we can scroll right
            setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth)
        }
    }, [])

    // Update activeTab when the URL changes
    useEffect(() => {
        setActiveTab(getCurrentTab())
        // When URL changes, content has loaded
        setIsLoading(false)
    }, [getCurrentTab])

    // Set up scroll event listener and initial check
    useEffect(() => {
        const container = tabsContainerRef.current
        if (container) {
            // Check scrollability initially and on resize
            checkScrollability()

            // Add event listeners
            container.addEventListener('scroll', checkScrollability)
            window.addEventListener('resize', checkScrollability)

            // Clean up
            return () => {
                container.removeEventListener('scroll', checkScrollability)
                window.removeEventListener('resize', checkScrollability)
            }
        }
    }, [checkScrollability])

    return <Show when={(session.status === 'authenticated') && (session.data?.user?.provider !== 'anonymous')}
                 fallback={
                     <Show when={session.status === 'loading'}
                           fallback={<Login/>}>
                         <Loader height={350}/>
                     </Show>
                 }>
        <div className="flex flex-col rounded-none sm:rounded-lg w-full border-none sm:border border-border bg-gradient-to-br from-secondary to-background drop-shadow text-foreground
        dark:border-border dark:bg-gradient-to-br dark:from-secondary dark:to-background dark:text-foreground overflow-hidden">
            <div className="relative flex w-full">
                <button 
                    ref={leftArrowRef}
                    className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-muted dark:bg-muted hover:bg-accent dark:hover:bg-accent rounded-r-md p-1 items-center justify-center ${canScrollLeft ? 'flex' : 'hidden'}`}
                    onClick={() => {
                        if (tabsContainerRef.current) {
                            tabsContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
                        }
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>
                <nav 
                    ref={tabsContainerRef}
                    id="tabs-container" 
                    className="flex flex-row w-full bg-muted dark:bg-muted overflow-x-auto whitespace-nowrap scrollbar-hide"
                >
                    {profileTabs.map(tab =>
                        <Tab
                            key={tab.slug}
                            type="button"
                            onClick={() => {
                                // Don't allow clicking on the already active tab
                                if (activeTab === tab.slug) {
                                    return
                                }
                                // Update the active tab state immediately
                                setActiveTab(tab.slug)
                                // Set the loading state to true
                                setIsLoading(true)
                                // Then initiate route change
                                router.push('/' + tab.slug + search)
                            }}
                            active={activeTab === tab.slug}
                            isLoading={isLoading && activeTab === tab.slug}
                            icon={tab.icon}
                            iconSize="h-4 w-4"
                        >
                            {t(tab.name)}
                        </Tab>
                    )}
                </nav>
                <button 
                    ref={rightArrowRef}
                    className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-muted dark:bg-muted hover:bg-accent dark:hover:bg-accent rounded-l-md p-1 items-center justify-center ${canScrollRight ? 'flex' : 'hidden'}`}
                    onClick={() => {
                        if (tabsContainerRef.current) {
                            tabsContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
                        }
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </button>
            </div>
            <div className="h-full justify-center gap-4 p-6">
                {isLoading ? (
                    <SkeletonLoader/>
                ) : (
                    children
                )}
            </div>
        </div>
    </Show>
}
