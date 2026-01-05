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
    const isDemoSession = useClientStore(state => state.isDemoSession)
    const profile = useClientStore(state => state.profile)
    const [wasAuthenticated, setWasAuthenticated] = useState(false)
    const fetchDataCalledRef = useRef(false)

    // Demo profile ID for comparison (must match DEMO_PROFILE.id in useClientStore)
    const DEMO_PROFILE_ID = 999999

    // Determine authentication status - either BetterAuth session OR demo session
    // Also check if profile exists (indicates active session even during hydration)
    const hasBetterAuthSession = !isPending && !!session?.user
    const hasProfileData = !!profile?.id
    const isDemoProfile = profile?.id === DEMO_PROFILE_ID
    const isAuthenticated = hasBetterAuthSession || isDemoSession || isDemoProfile || hasProfileData

    // Call fetchData when session becomes authenticated
    // Reset store when session becomes unauthenticated
    // Skip fetchData for demo session - it has mock data already
    useEffect(() => {
        // Only reset if truly unauthenticated AND no profile data exists AND not demo profile
        // This prevents reset during Zustand hydration race conditions
        if (wasAuthenticated && !isAuthenticated && !isPending && !hasProfileData && !isDemoProfile) {
            console.log('Session no longer authenticated, resetting client store')
            reset()
            fetchDataCalledRef.current = false
        } else if (isAuthenticated && !fetchDataCalledRef.current) {
            // Only fetch real data for non-demo sessions
            if (!isDemoSession && !isDemoProfile && !hasProfileData) {
                console.log('Session authenticated, fetching client data')
                fetchDataCalledRef.current = true
                fetchData().then()
            } else {
                console.log('Demo session active or profile exists, using existing data')
                fetchDataCalledRef.current = true
            }
        }

        if (!isPending) {
            setWasAuthenticated(isAuthenticated)
        }
    }, [isAuthenticated, isPending, fetchData, reset, wasAuthenticated, isDemoSession, isDemoProfile, hasProfileData])

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
