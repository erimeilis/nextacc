'use client'
import React from 'react'
import {signOut, useSession} from 'next-auth/react'
import {useRouter} from 'next/navigation'
import {resetPersistentId} from '@/utils/resetPersistentId'
import {profileTabs} from '@/constants/profileTabs'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {Button} from '@/components/ui/button'
import {DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger} from '@/components/ui/dropdown-menu'
import {createHash} from 'crypto'

interface DesktopProfileMenuProps {
    session: ReturnType<typeof useSession>
    resetClientStoreAction: () => void
    resetCartStoreAction: () => void
    lAction: (key: string) => string
    tAction: (key: string) => string
    search: string
}

export default function DesktopProfileMenu({
                                               session,
                                               resetClientStoreAction,
                                               resetCartStoreAction,
                                               lAction,
                                               tAction,
                                               search
                                           }: DesktopProfileMenuProps) {
    const router = useRouter()

    return (
        <div className="hidden sm:block">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar>
                            <AvatarImage
                                src={
                                    session.data?.user?.image ??
                                    'https://gravatar.com/avatar/' + createHash('sha256').update(session.data?.user?.email?.toLowerCase() || '').digest('hex')
                                }
                                alt="User settings"
                            />
                            <AvatarFallback>
                                {session.data?.user?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-[100px] w-fit z-[10000] shadow-2xl shadow-mute dark:shadow-black" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium">{session.data?.user?.name || 'User'}</p>
                            <p className="text-xs text-muted-foreground">{session.data?.user?.email || ''}</p>
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
                                <span>{tAction(tab.name)}</span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem onClick={() => {
                        resetClientStoreAction()
                        resetCartStoreAction()
                        signOut({redirectTo: '/' + search})
                            .then(() => {
                                resetPersistentId()
                            })
                    }}>
                        {lAction('signout')}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
