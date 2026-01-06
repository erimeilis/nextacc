'use client'
import React from 'react'
import {useAuthSession} from '@/hooks/use-auth-session'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/display/Avatar'
import {Button} from '@/components/ui/primitives/Button'
import {Drawer} from '@/components/ui/primitives/Drawer'
import {createHash} from 'crypto'
import Client from '@/components/drawers/Client'

interface MobileProfileDrawerProps {
    session: ReturnType<typeof useAuthSession>
    profileDrawerOpen: boolean
    handleProfileDrawerChangeAction: (openState: boolean | ((prevState: boolean) => boolean)) => void
    drawerDirection: 'bottom' | 'right'
    resetClientStoreAction: () => void
    resetCartStoreAction: () => void
    lAction: (key: string) => string
    tAction: (key: string) => string
    search: string
}

export default function MobileClientButton({
                                               session,
                                               profileDrawerOpen,
                                               handleProfileDrawerChangeAction,
                                               drawerDirection,
                                               resetClientStoreAction,
                                               resetCartStoreAction,
                                               lAction,
                                               tAction,
                                               search
                                           }: MobileProfileDrawerProps) {

    return (
        <div className="sm:hidden">
            <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
                data-drawer-trigger="profile"
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleProfileDrawerChangeAction(!profileDrawerOpen)
                }}
            >
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

            <Drawer
                open={profileDrawerOpen}
                onOpenChange={handleProfileDrawerChangeAction}
                direction={drawerDirection}
                snapPoints={[1]}
            >
                <Client
                    session={session}
                    handleCloseAction={() => handleProfileDrawerChangeAction(false)}
                    resetClientStoreAction={resetClientStoreAction}
                    resetCartStoreAction={resetCartStoreAction}
                    lAction={lAction}
                    tAction={tAction}
                    search={search}
                />
            </Drawer>
        </div>
    )
}
