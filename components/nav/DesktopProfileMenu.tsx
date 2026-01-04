'use client'
import React from 'react'
import {signOut} from '@/lib/auth-client'
import {useAuthSession} from '@/hooks/use-auth-session'
import {useRouter} from 'next/navigation'
import {resetPersistentId} from '@/utils/resetPersistentId'
import {profileTabs} from '@/constants/profileTabs'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/Avatar'
import {Button} from '@/components/ui/Button'
import {DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger} from '@/components/ui/DropdownMenu'
import {createHash} from 'crypto'

interface DesktopProfileMenuProps {
    session: ReturnType<typeof useAuthSession>
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
                <DropdownMenuContent className="min-w-[100px] w-fit z-[10000] shadow-md shadow-mute/50 dark:shadow-black/50" align="end" forceMount>
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
                                className="cursor-pointer transition-all duration-200"
                                onClick={() => router.push('/' + tab.slug + search)}
                            >
                                {tab.icon && React.createElement(tab.icon, {className: 'mr-2 h-4 w-4'})}
                                <span>{tAction(tab.name)}</span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem className="cursor-pointer transition-all duration-200" onClick={() => {
                        resetClientStoreAction()
                        resetCartStoreAction()
                        signOut().then(() => {
                            resetPersistentId()
                            window.location.href = '/' + search
                        })
                    }}>
                        {lAction('signout')}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
