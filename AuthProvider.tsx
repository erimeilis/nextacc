'use client'
import {SessionProvider} from 'next-auth/react'
import React from 'react'

export const AuthProvider = ({children}: React.PropsWithChildren<object>) => {
    return <SessionProvider>
        {children}
    </SessionProvider>
}