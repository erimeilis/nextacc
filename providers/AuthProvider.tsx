'use client'
import {SessionProvider, useSession} from 'next-auth/react'
import React, {useEffect, useRef, useState} from 'react'
import usePersistState from '@/utils/usePersistState'
import {v4 as uuidv4} from 'uuid'
import {useClientStore} from '@/stores/useClientStore'

// Wrapper component that has access to the session
const SessionHandler = ({children}: React.PropsWithChildren<object>) => {
    const {data: session, status} = useSession()
    const fetchData = useClientStore(state => state.fetchData)
    const reset = useClientStore(state => state.reset)
    const [previousStatus, setPreviousStatus] = useState<string | null>(null)
    const fetchDataCalledRef = useRef(false)

    // Call fetchData when session becomes authenticated
    // Reset store when session becomes unauthenticated
    useEffect(() => {
        if (previousStatus === 'authenticated' && status !== 'authenticated') {
            console.log('Session no longer authenticated, resetting client store')
            reset()
            fetchDataCalledRef.current = false
        } else if (status === 'authenticated' && session && !fetchDataCalledRef.current) {
            console.log('Session authenticated, fetching client data')
            fetchDataCalledRef.current = true
            fetchData().then()
        }

        setPreviousStatus(status)
    }, [status, session, fetchData, reset, previousStatus])

    return <>{children}</>
}

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

    return (
        <SessionProvider>
            <SessionHandler>
                {children}
            </SessionHandler>
        </SessionProvider>
    )
}
