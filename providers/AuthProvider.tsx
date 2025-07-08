'use client'
import {SessionProvider} from 'next-auth/react'
import React, {useEffect} from 'react'
import usePersistState from '@/utils/usePersistState'
import {v4 as uuidv4} from 'uuid'
import {useClientStore} from '@/stores/useClientStore'

export const AuthProvider = ({children}: React.PropsWithChildren<object>) => {
    const [persistentId, setPersistentId] = usePersistState<string>('no-id', 'persistentId')
    const resetClientStore = useClientStore(state => state.reset)

    useEffect(() => {
        if (persistentId === 'no-id') setPersistentId(uuidv4())
    }, [persistentId, setPersistentId])

    // Add error event listener to handle auth errors
    useEffect(() => {
        const handleError = (event: ErrorEvent) => {
            // Check if it's a ClientFetchError from next-auth
            if (event.error?.name === 'ClientFetchError' || 
                (event.message && event.message.includes('ClientFetchError')) ||
                (event.error?.message && event.error.message.includes('Failed to fetch'))) {
                console.log('Auth error detected, flushing clientStore')
                resetClientStore()
            }
        }

        // Add global error handler
        window.addEventListener('error', handleError)

        return () => {
            window.removeEventListener('error', handleError)
        }
    }, [resetClientStore])

    return <SessionProvider>
        {children}
    </SessionProvider>
}
