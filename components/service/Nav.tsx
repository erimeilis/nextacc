'use client'
import LocaleSwitcher from '@/components/service/LocaleSwitcher'
import logoLight from '@/app/[locale]/icon-light.png'
import logo from '@/app/[locale]/icon.png'
import {signOut, useSession} from 'next-auth/react'
import {useTranslations} from 'next-intl'
import Image from 'next/image'
import {resetPersistentId} from '@/utils/resetPersistentId'
import React, {useEffect, useState} from 'react'
import {createHash} from 'crypto'
import Link from 'next/link'
import {profileTabs} from '@/constants/profileTabs'
import {useRouter, useSearchParams} from 'next/navigation'
import {ThemeToggle} from '@/components/ui/theme-toggle'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,} from '@/components/ui/dropdown-menu'
import {Button} from '@/components/ui/button'
import CartButton from '@/components/CartButton'
import {useClientStore} from '@/stores/useClientStore'
import {useCartStore} from '@/stores/useCartStore'
import {PlusCircle} from 'lucide-react'

export default function Nav() {
    //const [isMenuOpen, setIsMenuOpen] = useState(false)
    const session = useSession()
    const l = useTranslations('login')
    const p = useTranslations('profile')
    const router = useRouter()

    const t = useTranslations('dashboard')
    const searchParams = useSearchParams()
    const search = searchParams && searchParams.size > 0 ? `?${searchParams.toString()}` : ''

    //const toggleMenu = () => {
    //    setIsMenuOpen(!isMenuOpen)
    //}

    const [localBalance, setLocalBalance] = useState<number | null>(0)
    const {balance, updateProfile, reset: resetClientStore} = useClientStore()
    const {reset: resetCartStore} = useCartStore()

    useEffect(() => {
        if (!localBalance) {
            updateProfile()
                .then(() => setLocalBalance(balance))
        } else
            setLocalBalance(balance)
    }, [balance, localBalance, updateProfile])

    return (
        <nav className="w-full px-3 py-1 mx-auto backdrop sticky top-0 shadow lg:px-6 lg:py-2 z-[9999]">
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

                <div className="flex items-center gap-2 ml-4">
                    {(session &&
                        session.status === 'authenticated' &&
                        session.data &&
                        session.data.user &&
                        (session.data.user.provider !== 'anonymous')
                    ) ? (
                        <>
                            <span className="text-sm font-medium text-white">{p('balance')}:</span><span className="text-sm font-bold text-white">${localBalance}</span><Button
                            variant="navIcon" size="icon" className="h-8 w-8" onClick={() => router.push('/profile' + search)}>
                            <PlusCircle className="h-5 w-5"/>
                        </Button>
                        </>) : null}
                </div>

                <div className="flex md:order-2 gap-2 items-center ml-auto">
                    <LocaleSwitcher/>
                    <ThemeToggle/>
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
            </div>
        </nav>
    )
}
