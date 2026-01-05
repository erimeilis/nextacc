'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from '@/lib/auth-client'
import usePersistState from '@/utils/usePersistState'
import { v4 as uuidv4 } from 'uuid'
import { useClientStore } from '@/stores/useClientStore'
import { useQueryClient } from '@tanstack/react-query'

// Wrapper component that has access to the session
const SessionHandler = ({ children }: React.PropsWithChildren<object>) => {
    const { data: session, isPending, error } = useSession()
    const reset = useClientStore(state => state.reset)
    const isDemoSession = useClientStore(state => state.isDemoSession)
    const queryClient = useQueryClient()
    const [wasAuthenticated, setWasAuthenticated] = useState(false)

    // Demo profile ID for comparison (must match DEMO_PROFILE.id in useClientStore)
    const DEMO_PROFILE_ID = 999999

    // Determine authentication status - either BetterAuth session OR demo session
    const hasBetterAuthSession = !isPending && !!session?.user
    const isAuthenticated = hasBetterAuthSession || isDemoSession

    // Reset store and query cache when session becomes unauthenticated
    useEffect(() => {
        if (wasAuthenticated && !isAuthenticated && !isPending) {
            console.log('Session no longer authenticated, resetting stores')
            reset()
            // Clear all TanStack Query caches
            queryClient.clear()
        }

        if (!isPending) {
            setWasAuthenticated(isAuthenticated)
        }
    }, [isAuthenticated, isPending, reset, wasAuthenticated, queryClient])

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
    const queryClient = useQueryClient()

    useEffect(() => {
        if (persistentId === 'no-id') setPersistentId(uuidv4())
    }, [persistentId, setPersistentId])

    // Add error event listener to handle auth errors
    useEffect(() => {
        const handleError = (event: ErrorEvent) => {
            // Check if it's an auth-related fetch error
            if (event.error?.message?.includes('Failed to fetch') ||
                event.message?.includes('auth')) {
                console.log('Auth error detected, flushing stores')
                resetClientStore()
                queryClient.clear()
            }
        }

        // Add global error handler
        window.addEventListener('error', handleError)

        return () => {
            window.removeEventListener('error', handleError)
        }
    }, [resetClientStore, queryClient])

    // BetterAuth doesn't need a SessionProvider wrapper like next-auth
    return (
        <SessionHandler>
            {children}
        </SessionHandler>
    )
}
