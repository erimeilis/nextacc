'use client'
import React from 'react'
import {signOut, useSession} from 'next-auth/react'
import {useRouter} from 'next/navigation'
import {resetPersistentId} from '@/utils/resetPersistentId'
import {profileTabs} from '@/constants/profileTabs'
import {Button} from '@/components/ui/button'
import {DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle} from '@/components/ui/drawer'
import MobileSwitchers from '@/components/nav/MobileSwitchers'

interface ProfileDrawerContentProps {
    session: ReturnType<typeof useSession>
    handleCloseAction: () => void
    resetClientStoreAction: () => void
    resetCartStoreAction: () => void
    lAction: (key: string) => string
    tAction: (key: string) => string
    search: string
}

export default function Client({
                                   session,
                                   handleCloseAction,
                                   resetClientStoreAction,
                                   resetCartStoreAction,
                                   lAction,
                                   tAction,
                                   search
                               }: ProfileDrawerContentProps) {
    const router = useRouter()

    return (
        <DrawerContent
            className="w-full h-[80vh] sm:min-w-[20vw] sm:w-fit sm:max-w-[80vw] sm:rounded-l-lg sm:border-l sm:border-border/50 sm:fixed sm:right-0 sm:left-auto sm:h-full sm:inset-y-0 sm:bottom-auto sm:mt-0 sm:top-0">
            <div className="flex flex-col h-full w-full pb-9 sm:pb-2">
                <DrawerHeader className="flex flex-row items-center justify-between">
                    <DrawerTitle className="hidden"></DrawerTitle>
                    <DrawerClose onClick={handleCloseAction}/>
                </DrawerHeader>

                <div
                    className="flex-1 overflow-y-auto px-4 pt-6"
                    style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'hsl(var(--primary)) hsl(var(--muted))',
                        maxHeight: 'calc(100vh - 120px)',
                        overflowY: 'auto'
                    }}
                >
                    <div className="flex flex-row w-full justify-between items-center p-4 mb-4">
                        <div className="flex flex-col space-y-2">
                            <p className="text-lg font-medium">{session.data?.user?.name || 'User'}</p>
                            <p className="text-sm text-muted-foreground">{session.data?.user?.email || ''}</p>
                        </div>
                        <MobileSwitchers/>
                    </div>

                    <div className="space-y-2">
                        {profileTabs.map(tab => (
                            <Button
                                key={tab.slug}
                                variant="ghost"
                                className="w-full justify-start text-left"
                                onClick={() => {
                                    router.push('/' + tab.slug + search)
                                    handleCloseAction()
                                }}
                            >
                                {tab.icon && React.createElement(tab.icon, {className: 'mr-2 h-5 w-5'})}
                                <span>{tAction(tab.name)}</span>
                            </Button>
                        ))}
                    </div>
                </div>

                <DrawerFooter className="px-4 py-6">
                    <Button
                        variant="link"
                        onClick={() => {
                            resetClientStoreAction()
                            resetCartStoreAction()
                            handleCloseAction()
                            signOut({redirectTo: '/' + search})
                                .then(() => {
                                    resetPersistentId()
                                })
                        }}
                    >
                        {lAction('signout')}
                    </Button>
                </DrawerFooter>
            </div>
        </DrawerContent>
    )
}