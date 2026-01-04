'use client'

import { useSession } from '@/lib/auth-client'
import { useEffect } from 'react'
import { useClientStore } from '@/stores/useClientStore'

/**
 * Custom hook that wraps BetterAuth's useSession hook and adds error handling
 * to flush the clientStore when an auth error occurs.
 *
 * @returns The session data from BetterAuth's useSession hook
 */
export function useAuthSession() {
    const session = useSession()
    const resetClientStore = useClientStore(state => state.reset)

    useEffect(() => {
        // If there's an error with the session or user is not authenticated, flush the clientStore
        if (!session.isPending && !session.data?.user) {
            console.log('User not authenticated, flushing clientStore')
            resetClientStore()
        }
    }, [session.isPending, session.data?.user, resetClientStore])

    // Return a compatible interface for existing components
    return {
        data: session.data,
        status: session.isPending ? 'loading' : session.data?.user ? 'authenticated' : 'unauthenticated',
        isPending: session.isPending,
        error: session.error,
    }
}
