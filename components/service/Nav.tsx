'use client'
import LocaleSwitcher from '@/components/service/LocaleSwitcher'
import logoLight from '@/app/[locale]/icon-light.png'
import logo from '@/app/[locale]/icon.png'
import {signOut, useSession} from 'next-auth/react'
import {useTranslations} from 'next-intl'
import Image from 'next/image'
import {resetPersistentId} from '@/utils/resetPersistentId'
import React, {useEffect, useRef, useState} from 'react'
import {createHash} from 'crypto'
import Link from 'next/link'
import {profileTabs} from '@/constants/profileTabs'
import {useRouter, useSearchParams} from 'next/navigation'
import {ThemeToggle} from '@/components/ui/theme-toggle'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,} from '@/components/ui/dropdown-menu'
import {Button} from '@/components/ui/button'
import CartButton from '@/components/CartButton'
import PaymentButton from '@/components/PaymentButton'
import {useClientStore} from '@/stores/useClientStore'
import {useCartStore} from '@/stores/useCartStore'

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
                           router
                       }: {
    session: ReturnType<typeof useSession>;
    balance?: number;
    displayBalance: number;
    resetClientStore: () => void;
    resetCartStore: () => void;
    l: (key: string) => string;
    p: (key: string) => string;
    t: (key: string) => string;
    search: string;
    router: ReturnType<typeof useRouter>;
}) => {
    return (
        <>
            {/* Balance - responsive for both mobile and desktop */}
            <div className="flex items-center gap-2 ml-4">
                {session &&
                session.status === 'authenticated' &&
                session.data &&
                session.data.user &&
                (session.data.user.provider !== 'anonymous') ? (
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
                        <PaymentButton />
                    </>
                ) : null}
            </div>

            <div className="flex md:order-2 gap-2 items-center ml-auto">
                <div className="hidden sm:block">
                    <LocaleSwitcher/>
                </div>
                <div className="hidden sm:block">
                    <ThemeToggle/>
                </div>
                <CartButton/>
                {(session &&
                    session.status === 'authenticated' &&
                    session.data &&
                    session.data.user &&
                    (session.data.user.provider !== 'anonymous')
                ) ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                <Avatar>
                                    <AvatarImage
                                        src={
                                            session.data.user.image ??
                                            'https://gravatar.com/avatar/' + createHash('sha256').update(session.data.user.email!.toLowerCase()).digest('hex')
                                        }
                                        alt="User settings"
                                    />
                                    <AvatarFallback>
                                        {session.data.user.name?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 z-[10000]" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium">{session.data.user.name}</p>
                                    <p className="text-xs text-muted-foreground">{session.data.user.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator/>
                            <DropdownMenuGroup>
                                {profileTabs.map(tab => (
                                    <DropdownMenuItem
                                        key={tab.slug}
                                        onClick={() => router.push('/' + tab.slug + search)}
                                    >
                                        {tab.icon && React.createElement(tab.icon, {className: 'mr-2 h-4 w-4'})}
                                        <span>{t(tab.name)}</span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator/>
                            <div className="sm:hidden block p-2 flex items-center space-x-2">
                                <LocaleSwitcher/>
                                <ThemeToggle/>
                            </div>
                            <DropdownMenuSeparator className="sm:hidden block"/>
                            <DropdownMenuItem onClick={() => {
                                resetClientStore()
                                resetCartStore()
                                signOut({redirectTo: '/' + search})
                                    .then(() => {
                                        resetPersistentId()
                                    })
                            }}>
                                {l('signout')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : null}
            </div>
        </>
    )
}

export default function Nav() {
    const session = useSession()
    const l = useTranslations('login')
    const p = useTranslations('profile')
    const router = useRouter()

    const t = useTranslations('dashboard')
    const searchParams = useSearchParams()
    const search = searchParams && searchParams.size > 0 ? `?${searchParams.toString()}` : ''

    const [displayBalance, setDisplayBalance] = useState<number>(0)
    const [isClient, setIsClient] = useState<boolean>(false)
    const [isAnimating, setIsAnimating] = useState<boolean>(false)
    const {getBalance, fetchData, reset: resetClientStore} = useClientStore()
    const balance = getBalance()
    const {reset: resetCartStore} = useCartStore()
    const animationRef = useRef<NodeJS.Timeout | null>(null)
    const targetBalanceRef = useRef<number>(0)

    // Fix hydration issues by only rendering on the client-side
    useEffect(() => {
        setIsClient(true)

        // Fetch profile data on component mount
        fetchData().then()

        return () => {
            // Clean up animation timeout on unmounting
            if (animationRef.current) {
                clearTimeout(animationRef.current)
            }
        }
    }, [fetchData])

    // Handle balance updates and animation
    useEffect(() => {
        if (!isClient) return

        const actualBalance = balance ?? 0
        targetBalanceRef.current = actualBalance

        // Don't animate on an initial load if the balance is 0
        if (displayBalance === 0 && actualBalance === 0) {
            return
        }

        // Start animation
        if (!isAnimating && displayBalance !== actualBalance) {
            setIsAnimating(true)

            const animateBalance = () => {
                setDisplayBalance(prev => {
                    const target = targetBalanceRef.current
                    const diff = target - prev

                    // If the difference is small enough, just set to target
                    if (Math.abs(diff) < 0.1) {
                        setIsAnimating(false)
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
    }, [balance, displayBalance, isAnimating, isClient])

    return (
        <nav className="w-full px-3 py-1 mx-auto backdrop fixed bottom-0 sm:fixed sm:bottom-auto sm:top-0 shadow lg:px-6 lg:py-2 z-[9999]">
            <div className="flex flex-wrap items-center justify-between">
                <Link href="/" className="flex items-center">
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
                    />
                ) : (
                    <>
                        {/* Server-side placeholder for balance display */}
                        <div className="flex items-center gap-2 ml-4"></div>

                        {/* Server-side placeholder for authentication UI */}
                        <div className="flex md:order-2 gap-2 items-center ml-auto">
                            <LocaleSwitcher/>
                            <ThemeToggle/>
                            <CartButton/>
                        </div>
                    </>
                )}
            </div>
        </nav>
    )
}
