'use client'

import { useSession } from '@/lib/auth-client'
import { useClientStore } from '@/stores/useClientStore'

/**
 * Custom hook that wraps BetterAuth's useSession hook.
 * Also checks for demo session state from Zustand store.
 * Note: Store reset is handled by AuthProvider, not here.
 *
 * @returns The session data from BetterAuth's useSession hook
 */
export function useAuthSession() {
    const session = useSession()
    const isDemoSession = useClientStore(state => state.isDemoSession)
    const profile = useClientStore(state => state.profile)

    // Demo profile ID for comparison (must match DEMO_PROFILE.id in useClientStore)
    const DEMO_PROFILE_ID = 999999
    const isDemoProfile = profile?.id === DEMO_PROFILE_ID

    // Check if authenticated via BetterAuth OR demo session OR demo profile (for hydration race conditions)
    const isAuthenticated = !!session.data?.user || isDemoSession || isDemoProfile

    // Return a compatible interface for existing components
    // Demo user object needs all properties that BetterAuth user has
    const demoUser = (isDemoSession || isDemoProfile) && profile ? {
        id: String(profile.id),
        email: profile.email,
        name: `${profile.firstname} ${profile.lastname}`,
        image: null,
        isAnonymous: false,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    } : null

    return {
        data: demoUser ? { user: demoUser } : session.data,
        status: session.isPending ? 'loading' : isAuthenticated ? 'authenticated' : 'unauthenticated',
        isPending: session.isPending,
        error: session.error,
    }
}
