'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useSession } from '@/lib/auth-client'
import usePersistState from '@/utils/usePersistState'
import { v4 as uuidv4 } from 'uuid'
import { useClientStore } from '@/stores/useClientStore'

// Wrapper component that has access to the session
const SessionHandler = ({ children }: React.PropsWithChildren<object>) => {
    const { data: session, isPending, error } = useSession()
    const fetchData = useClientStore(state => state.fetchData)
    const reset = useClientStore(state => state.reset)
    const [wasAuthenticated, setWasAuthenticated] = useState(false)
    const fetchDataCalledRef = useRef(false)

    // Determine authentication status
    const isAuthenticated = !isPending && !!session?.user

    // Call fetchData when session becomes authenticated
    // Reset store when session becomes unauthenticated
    useEffect(() => {
        if (wasAuthenticated && !isAuthenticated && !isPending) {
            console.log('Session no longer authenticated, resetting client store')
            reset()
            fetchDataCalledRef.current = false
        } else if (isAuthenticated && !fetchDataCalledRef.current) {
            console.log('Session authenticated, fetching client data')
            fetchDataCalledRef.current = true
            fetchData().then()
        }

        if (!isPending) {
            setWasAuthenticated(isAuthenticated)
        }
    }, [isAuthenticated, isPending, fetchData, reset, wasAuthenticated])

    // Log any auth errors
    useEffect(() => {
        if (error) {
            console.error('Auth error:', error)
        }
    }, [error])

    return <>{children}</>
}

export const AuthProvider = ({ children }: React.PropsWithChildren<object>) => {
    const [persistentId, setPersistentId] = usePersistState<string>('no-id', 'persistentId')
    const resetClientStore = useClientStore(state => state.reset)

    useEffect(() => {
        if (persistentId === 'no-id') setPersistentId(uuidv4())
    }, [persistentId, setPersistentId])

    // Add error event listener to handle auth errors
    useEffect(() => {
        const handleError = (event: ErrorEvent) => {
            // Check if it's an auth-related fetch error
            if (event.error?.message?.includes('Failed to fetch') ||
                event.message?.includes('auth')) {
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

    // BetterAuth doesn't need a SessionProvider wrapper like next-auth
    return (
        <SessionHandler>
            {children}
        </SessionHandler>
    )
}
