'use client'
import {SessionProvider} from 'next-auth/react'
import React, {useEffect} from 'react'
import usePersistState from '@/utils/usePersistState'
import {v4 as uuidv4} from 'uuid'

export const AuthProvider = ({children}: React.PropsWithChildren<object>) => {
    const [persistentId, setPersistentId] = usePersistState<string>('no-id', 'persistentId')
    useEffect(() => {
        if (persistentId === 'no-id') setPersistentId(uuidv4())
    }, [persistentId, setPersistentId])
    return <SessionProvider>
        {children}
    </SessionProvider>
}