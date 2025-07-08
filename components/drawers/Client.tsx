'use client'
import React from 'react'
import {signOut} from 'next-auth/react'
import {useAuthSession} from '@/hooks/use-auth-session'
import {useRouter} from 'next/navigation'
import {resetPersistentId} from '@/utils/resetPersistentId'
import {profileTabs} from '@/constants/profileTabs'
import {Button} from '@/components/ui/Button'
import {DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle} from '@/components/ui/Drawer'
import MobileSwitchers from '@/components/nav/MobileSwitchers'

interface ProfileDrawerContentProps {
    session: ReturnType<typeof useAuthSession>
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
            className="w-full h-[80vh]
            sm:min-w-[40vw] md:min-w-[20vw]
            md:w-fit sm:max-w-[80vw]
            sm:rounded-l-lg sm:border-l sm:border-border/50 sm:fixed sm:right-0 sm:left-auto sm:h-full sm:inset-y-0 sm:bottom-auto sm:mt-0 sm:top-0">
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
                        <MobileSwitchers dropDirection="down"/>
                    </div>

                    <div className="space-y-2">
                        {profileTabs.map(tab => (
                            <Button
                                key={tab.slug}
                                variant="ghost"
                                className="w-full justify-start text-left cursor-pointer transition-all duration-200"
                                onClick={() => {
                                    // Create target path without the profile parameter
                                    let targetSearch = search
                                    if (search.includes('profile=open')) {
                                        const url = new URL(window.location.origin + window.location.pathname + search)
                                        url.searchParams.delete('profile')
                                        targetSearch = url.search
                                    }
                                    const targetPath = '/' + tab.slug + targetSearch

                                    // Close the drawer
                                    handleCloseAction()

                                    // Delay navigation to ensure drawer is closed first
                                    setTimeout(() => {
                                        router.push(targetPath)
                                    }, 100)
                                }}
                            >
                                {tab.icon && React.createElement(tab.icon, {className: 'mr-2 h-4 w-4'})}
                                <span>{tAction(tab.name)}</span>
                            </Button>
                        ))}
                    </div>
                </div>

                <DrawerFooter className="px-4 py-6">
                    <Button
                        variant="link"
                        className="cursor-pointer transition-all duration-200"
                        onClick={() => {
                            resetClientStoreAction()
                            resetCartStoreAction()

                            // Create redirect path without the profile parameter
                            let targetSearch = search
                            if (search.includes('profile=open')) {
                                const url = new URL(window.location.origin + window.location.pathname + search)
                                url.searchParams.delete('profile')
                                targetSearch = url.search
                            }

                            // Close the drawer
                            handleCloseAction()

                            // Delay signOut to ensure drawer is closed first
                            setTimeout(() => {
                                signOut({redirectTo: '/' + targetSearch})
                                    .then(() => {
                                        resetPersistentId()
                                    })
                            }, 100)
                        }}
                    >
                        {lAction('signout')}
                    </Button>
                </DrawerFooter>
            </div>
        </DrawerContent>
    )
}
