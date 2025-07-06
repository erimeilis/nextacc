'use client'
import React, {useCallback, useEffect, useRef, useState} from 'react'
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

    // Check if scrolling is possible and update arrow visibility
    const checkScrollability = useCallback(() => {
        const container = tabsContainerRef.current
        if (container) {
            // Force a reflow to ensure accurate measurements
            void container.offsetWidth

            // Check if we can scroll left
            const canScrollLeftValue = container.scrollLeft > 0
            setCanScrollLeft(canScrollLeftValue)

            // Check if we can scroll right
            // Add a small buffer (1px) to account for rounding errors
            const canScrollRightValue = container.scrollLeft < (container.scrollWidth - container.clientWidth - 1)
            setCanScrollRight(canScrollRightValue)

            // Debug info
            console.log('Scroll check:', {
                scrollLeft: container.scrollLeft,
                scrollWidth: container.scrollWidth,
                clientWidth: container.clientWidth,
                canScrollLeft: canScrollLeftValue,
                canScrollRight: canScrollRightValue
            })
        }
    }, [])

    // Track previous session status to detect when user logs in
    const [prevSessionStatus, setPrevSessionStatus] = useState(session.status)

    // Check scrollability when user logs in
    useEffect(() => {
        // If session status changed from loading/unauthenticated to authenticated
        if (prevSessionStatus !== 'authenticated' && session.status === 'authenticated') {
            // Wait for the dashboard to render, then check scrollability
            const timeoutId = setTimeout(() => {
                checkScrollability()
            }, 500)

            return () => {
                clearTimeout(timeoutId)
            }
        }

        // Update previous session status
        setPrevSessionStatus(session.status)
    }, [session.status, prevSessionStatus, checkScrollability])

    // Get the current active tab from the URL
    const getCurrentTab = useCallback(() => {
        if (!pathName) {
            return 'profile'
        } else {
            const segments = pathName.split('/')
            // Make the "numbers" tab active for both "numbers" and "waiting-numbers" paths
            if (segments[2] === 'waiting-numbers') {
                return 'numbers'
            }
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

        // Check scrollability after tab change and a short delay to ensure DOM updates
        const timeoutId = setTimeout(() => {
            checkScrollability()
        }, 300)

        return () => {
            clearTimeout(timeoutId)
        }
    }, [getCurrentTab, checkScrollability])

    // Set up scroll event listener and initial check
    useEffect(() => {
        const container = tabsContainerRef.current
        if (container) {
            // Check scrollability initially
            checkScrollability()

            // Add multiple delayed checks to ensure DOM is fully rendered
            // at different time intervals to catch various rendering scenarios
            const timeoutIds = [
                setTimeout(() => checkScrollability(), 100),
                setTimeout(() => checkScrollability(), 300),
                setTimeout(() => checkScrollability(), 500),
                setTimeout(() => checkScrollability(), 1000)
            ]

            // Add event listeners
            container.addEventListener('scroll', checkScrollability)

            // Handle resize with debounce to avoid too many calls
            let resizeTimer: NodeJS.Timeout | null = null
            const handleResize = () => {
                if (resizeTimer) clearTimeout(resizeTimer)
                resizeTimer = setTimeout(() => {
                    checkScrollability()
                    // Check again after a short delay to ensure measurements are accurate
                    setTimeout(checkScrollability, 100)
                }, 100)
            }
            window.addEventListener('resize', handleResize)

            // Also check on window load event
            const handleLoad = () => {
                checkScrollability()
                // Check again after a short delay
                setTimeout(checkScrollability, 100)
            }
            window.addEventListener('load', handleLoad)

            // Set up media query for mobile detection
            const mobileMediaQuery = window.matchMedia('(max-width: 768px)')

            // Function to handle media query changes
            const handleMediaQueryChange = (e: MediaQueryListEvent | MediaQueryList) => {
                console.log('Media query changed:', e.matches ? 'mobile' : 'desktop')
                // Wait for layout to adjust, then check scrollability multiple times
                setTimeout(() => checkScrollability(), 100)
                setTimeout(() => checkScrollability(), 300)
                setTimeout(() => checkScrollability(), 500)
            }

            // Add listener for media query changes
            mobileMediaQuery.addEventListener('change', handleMediaQueryChange)

            // Also check immediately with the current state
            handleMediaQueryChange(mobileMediaQuery)

            // Set up MutationObserver to detect changes in the tabs container
            const observer = new MutationObserver(() => {
                // Check multiple times with delays to ensure DOM is updated
                setTimeout(checkScrollability, 50)
                setTimeout(checkScrollability, 150)
                setTimeout(checkScrollability, 300)
            })

            // Observe changes to the container and its children
            observer.observe(container, {
                childList: true,
                subtree: true,
                attributes: true,
                characterData: true
            })

            // Clean up
            return () => {
                timeoutIds.forEach(id => clearTimeout(id))
                if (resizeTimer) clearTimeout(resizeTimer)
                container.removeEventListener('scroll', checkScrollability)
                window.removeEventListener('resize', handleResize)
                window.removeEventListener('load', handleLoad)
                mobileMediaQuery.removeEventListener('change', handleMediaQueryChange)
                observer.disconnect()
            }
        }
    }, [checkScrollability])

    // Special handling for mobile view
    useEffect(() => {
        // This effect specifically handles mobile view issues

        // Function to check if we're on mobile
        const isMobile = () => window.innerWidth <= 768

        // Function to force check scrollability on mobile
        const forceCheckOnMobile = () => {
            if (isMobile()) {
                console.log('Forcing mobile check')

                // Force scroll to start to ensure correct initial state
                if (tabsContainerRef.current) {
                    tabsContainerRef.current.scrollLeft = 0
                }

                // Check multiple times with increasing delays
                setTimeout(checkScrollability, 50)
                setTimeout(checkScrollability, 200)
                setTimeout(checkScrollability, 500)
                setTimeout(checkScrollability, 1000)
            }
        }

        // Check on initial render
        forceCheckOnMobile()

        // Set up a visibility change listener to handle when the user returns to the tab
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                forceCheckOnMobile()
            }
        }
        document.addEventListener('visibilitychange', handleVisibilityChange)

        // Also check when the orientation changes (important for mobile)
        const handleOrientationChange = () => {
            console.log('Orientation changed')
            setTimeout(forceCheckOnMobile, 100)
            setTimeout(forceCheckOnMobile, 500)
        }
        window.addEventListener('orientationchange', handleOrientationChange)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            window.removeEventListener('orientationchange', handleOrientationChange)
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
                    className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-muted dark:bg-muted hover:bg-accent dark:hover:bg-accent rounded-r-md p-1.5 shadow-md items-center justify-center ${canScrollLeft ? 'flex' : 'hidden'}`}
                    onClick={() => {
                        if (tabsContainerRef.current) {
                            tabsContainerRef.current.scrollBy({left: -200, behavior: 'smooth'})
                            // Check scrollability after scrolling
                            setTimeout(checkScrollability, 300)
                        }
                    }}
                    aria-label="Scroll left"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                         strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6"/>
                    </svg>
                </button>
                <nav
                    ref={tabsContainerRef}
                    id="tabs-container"
                    className="flex flex-row w-full bg-muted dark:bg-muted overflow-x-auto whitespace-nowrap scrollbar-hide relative"
                    style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
                    onScroll={() => {
                        // Check scrollability on every scroll event
                        checkScrollability()
                    }}
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
                    className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-muted dark:bg-muted hover:bg-accent dark:hover:bg-accent rounded-l-md p-1.5 shadow-md items-center justify-center ${canScrollRight ? 'flex' : 'hidden'}`}
                    onClick={() => {
                        if (tabsContainerRef.current) {
                            tabsContainerRef.current.scrollBy({left: 200, behavior: 'smooth'})
                            // Check scrollability after scrolling
                            setTimeout(checkScrollability, 300)
                        }
                    }}
                    aria-label="Scroll right"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                         strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6"/>
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
