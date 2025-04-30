'use client'
import {SessionProvider} from 'next-auth/react'
import React from 'react'
import AnonymousSessionProvider from './AnonymousSessionProvider'

export const AuthProvider = ({children}: React.PropsWithChildren<object>) => {
    return <SessionProvider>
        <AnonymousSessionProvider>
            {children}
        </AnonymousSessionProvider>
    </SessionProvider>
}