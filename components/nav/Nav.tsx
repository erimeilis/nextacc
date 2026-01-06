'use client'
import LocaleSwitcher from '@/components/nav/LocaleSwitcher'
import logoLight from '@/app/[locale]/icon-light.png'
import logo from '@/app/[locale]/icon.png'
import {useAuthSession} from '@/hooks/use-auth-session'
import {useTranslations} from 'next-intl'
import Image from 'next/image'
import React, {useEffect, useRef, useState} from 'react'
import {useIsClient} from '@/hooks/use-is-client'
import Link from 'next/link'
import {useRouter, useSearchParams} from 'next/navigation'
import {ThemeToggle} from '@/components/nav/ThemeToggle'
import MobileSwitchers from '@/components/nav/MobileSwitchers'
import CartButton from '@/components/nav/CartButton'
import PaymentButton from '@/components/nav/PaymentButton'
import {useClientStore} from '@/stores/useClientStore'
import {useCartStore} from '@/stores/useCartStore'
import MobileClientButton from '@/components/nav/MobileClientButton'
import DesktopProfileMenu from '@/components/nav/DesktopProfileMenu'
import {useProfile} from '@/hooks/queries/use-profile'

// Component that only renders client-side to avoid hydration issues
const ClientOnlyNav = ({
                           session,
                           displayBalance,
                           resetClientStore,
                           resetCartStore,
                           l,
                           p,
                           t,
                           search,
                           router,
                           searchParams
                       }: {
    session: ReturnType<typeof useAuthSession>;
    balance?: number;
    displayBalance: number;
    resetClientStore: () => void;
    resetCartStore: () => void;
    l: (key: string) => string;
    p: (key: string) => string;
    t: (key: string) => string;
    search: string;
    router: ReturnType<typeof useRouter>;
    searchParams: ReturnType<typeof useSearchParams>;
}) => {
    const [showMobileSwitchers, setShowMobileSwitchers] = useState(false)
    const [drawerDirection, setDrawerDirection] = useState<'bottom' | 'right'>('right')

    // Effect to handle a responsive direction for the drawer
    useEffect(() => {
        const handleResize = () => {
            setDrawerDirection(window.innerWidth < 640 ? 'bottom' : 'right')
        }

        // Set the initial direction
        handleResize()

        // Add event listener for window resize
        window.addEventListener('resize', handleResize)

        // Cleanup
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Derive drawer open state directly from URL (React 19 pattern - no useEffect sync)
    const profileDrawerOpen = searchParams?.get('profile') === 'open'

    // Custom function to handle drawer open/close and update URL
    const handleProfileDrawerChangeAction = (openState: boolean | ((prevState: boolean) => boolean)) => {
        // Determine the new open state
        const open = typeof openState === 'function'
            ? (openState as ((prevState: boolean) => boolean))(profileDrawerOpen)
            : openState

        // Update URL based on drawer state (state is derived from URL, no setState needed)
        const url = new URL(window.location.href)
        if (open) {
            url.searchParams.set('profile', 'open')
        } else {
            url.searchParams.delete('profile')
        }
        router.push(url.pathname + url.search)
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowMobileSwitchers(true)
        }, 1200)

        return () => clearTimeout(timer)
    }, [])
    return (
        <>
            {/* Balance - responsive for both mobile and desktop */}
            <div className="flex items-center gap-2 ml-4">
                {session &&
                session.status === 'authenticated' &&
                session.data &&
                session.data.user &&
                !session.data.user.isAnonymous ? (
                    <>
                        {/* For mobile - without label */}
                        <span className="sm:hidden text-xs font-bold text-white">
                            ${displayBalance.toFixed(2)}
                        </span>

                        {/* For desktop - with label */}
                        <span className="hidden sm:inline text-xs sm:text-sm font-medium text-white">{p('balance')}:</span>
                        <span className="hidden sm:inline text-xs sm:text-sm font-bold text-white">
                            ${displayBalance.toFixed(2)}
                        </span>

                        {/* Single PaymentButton for both mobile and desktop */}
                        <PaymentButton/>
                    </>
                ) : null}
            </div>

            <div className="flex md:order-2 gap-2 items-center ml-auto">
                {/* Desktop switchers - always visible */}
                <div className="hidden sm:flex items-center gap-2">
                    <LocaleSwitcher/>
                    <ThemeToggle/>
                </div>
                {/* Mobile switchers - only visible when not logged in */}
                {!(session &&
                    session.status === 'authenticated' &&
                    session.data &&
                    session.data.user &&
                    !session.data.user.isAnonymous
                ) ? (
                    <div className={`sm:hidden transition-opacity duration-500 ${showMobileSwitchers ? 'opacity-100' : 'opacity-0'}`}>
                        <MobileSwitchers/>
                    </div>
                ) : null}
                <CartButton/>
                {(session &&
                    session.status === 'authenticated' &&
                    session.data &&
                    session.data.user &&
                    !session.data.user.isAnonymous
                ) ? (
                    <>
                        {/* Desktop: DropdownMenu */}
                        <DesktopProfileMenu
                            session={session}
                            resetClientStoreAction={resetClientStore}
                            resetCartStoreAction={resetCartStore}
                            lAction={l}
                            tAction={t}
                            search={search}
                        />

                        {/* Mobile: Drawer */}
                        <MobileClientButton
                            session={session}
                            profileDrawerOpen={profileDrawerOpen}
                            handleProfileDrawerChangeAction={handleProfileDrawerChangeAction}
                            drawerDirection={drawerDirection}
                            resetClientStoreAction={resetClientStore}
                            resetCartStoreAction={resetCartStore}
                            lAction={l}
                            tAction={t}
                            search={search}
                        />
                    </>
                ) : null}
            </div>
        </>
    )
}

export default function Nav() {
    const session = useAuthSession()
    const l = useTranslations('login')
    const p = useTranslations('profile')
    const router = useRouter()

    const t = useTranslations('dashboard')
    const searchParams = useSearchParams()
    const search = searchParams && searchParams.size > 0 ? `?${searchParams.toString()}` : ''

    const [displayBalance, setDisplayBalance] = useState<number>(0)
    const isClient = useIsClient()
    const isAnimatingRef = useRef<boolean>(false)
    const {reset: resetClientStore} = useClientStore()
    const {data: profile} = useProfile()
    const balance = profile?.balance ?? null
    const {reset: resetCartStore} = useCartStore()
    const animationRef = useRef<NodeJS.Timeout | null>(null)
    const targetBalanceRef = useRef<number>(0)

    // Clean up animation timeout on unmounting
    useEffect(() => {
        return () => {
            if (animationRef.current) {
                clearTimeout(animationRef.current)
            }
        }
    }, [])

    // Handle balance updates and animation
    useEffect(() => {
        if (!isClient) return

        const actualBalance = balance ?? 0
        targetBalanceRef.current = actualBalance

        // Don't animate on an initial load if the balance is 0
        if (displayBalance === 0 && actualBalance === 0) {
            return
        }

        // Start animation using ref to track animation state (avoids setState in useEffect)
        if (!isAnimatingRef.current && displayBalance !== actualBalance) {
            isAnimatingRef.current = true

            const animateBalance = () => {
                setDisplayBalance(prev => {
                    const target = targetBalanceRef.current
                    const diff = target - prev

                    // If the difference is small enough, just set to target
                    if (Math.abs(diff) < 0.1) {
                        isAnimatingRef.current = false
                        return target
                    }

                    // Otherwise, increment/decrement by a step
                    const step = diff * 0.1
                    const newValue = prev + step

                    // Continue animation
                    animationRef.current = setTimeout(animateBalance, 16) // ~60fps
                    return newValue
                })
            }

            animateBalance()
        }
    }, [balance, displayBalance, isClient])

    // Function to close drawers by removing cart, payment, and profile parameters from URL
    const closeDrawers = (e: React.MouseEvent) => {
        // Don't close drawers if clicking on drawer triggers or their children
        const target = e.target as HTMLElement
        const isCartButton = target.closest('[data-drawer-trigger="cart"]')
        const isPaymentButton = target.closest('[data-drawer-trigger="payment"]')
        const isProfileButton = target.closest('[data-drawer-trigger="profile"]')

        if (isCartButton || isPaymentButton || isProfileButton) {
            return
        }

        const url = new URL(window.location.href)
        const hasCart = url.searchParams.has('cart')
        const hasPayment = url.searchParams.has('payment')
        const hasProfile = url.searchParams.has('profile')

        if (hasCart || hasPayment || hasProfile) {
            url.searchParams.delete('cart')
            url.searchParams.delete('payment')
            url.searchParams.delete('profile')
            router.push(url.pathname + url.search)
        }
    }

    return (
        <nav
            className="w-full px-3 py-1 mx-auto backdrop fixed bottom-0 sm:top-0 sm:bottom-auto shadow lg:px-6 lg:py-2 z-[9999]"
            onClick={closeDrawers}
        >
            <div className="flex flex-wrap items-center justify-between">
                <Link href="/public" className="flex items-center">
                    <Image
                        src={logo}
                        width={48}
                        height={48}
                        alt="logo"
                        className="hidden dark:block"
                    />
                    <Image
                        src={logoLight}
                        width={48}
                        height={48}
                        alt="logo"
                        className="dark:hidden"
                    />
                </Link>

                {/* Conditionally render client-side-only components */}
                {isClient ? (
                    <ClientOnlyNav
                        session={session}
                        balance={balance ?? undefined}
                        displayBalance={displayBalance}
                        resetClientStore={resetClientStore}
                        resetCartStore={resetCartStore}
                        l={l}
                        p={p}
                        t={t}
                        search={search}
                        router={router}
                        searchParams={searchParams}
                    />
                ) : (
                    <>
                        {/* Server-side placeholder for balance display */}
                        <div className="flex items-center gap-2 ml-4"></div>

                        {/* Server-side placeholder for authentication UI */}
                        <div className="flex md:order-2 gap-2 items-center ml-auto">
                            {/* Desktop switchers */}
                            <div className="hidden sm:block">
                                <LocaleSwitcher/>
                            </div>
                            <div className="hidden sm:block">
                                <ThemeToggle/>
                            </div>
                            {/* Mobile switchers - match client-side size and initial opacity */}
                            <div className="sm:hidden opacity-0">
                                <MobileSwitchers/>
                            </div>
                            <CartButton/>
                        </div>
                    </>
                )}
            </div>
        </nav>
    )
}
