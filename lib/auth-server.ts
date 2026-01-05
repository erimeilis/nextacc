import { headers } from 'next/headers'
import { auth } from './auth'
import { getDataMode } from '@/lib/data-source'

// Demo session for demo mode - matches DEMO_PROFILE in useClientStore
const DEMO_SESSION = {
    user: {
        id: '999999',
        email: 'demo@example.com',
        name: 'Demo User',
        image: null,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    session: {
        id: 'demo-session',
        userId: '999999',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        createdAt: new Date(),
        updatedAt: new Date(),
        token: 'demo-token',
    },
}

/**
 * Get the current session in server actions and API routes.
 * Returns null if no session exists.
 * In demo mode, returns a demo session.
 */
export async function getServerSession() {
    // In demo mode, return demo session
    if (getDataMode() === 'demo') {
        return DEMO_SESSION
    }

    const session = await auth.api.getSession({
        headers: await headers(),
    })
    return session
}

/**
 * Check if the current user is authenticated (not anonymous).
 * Returns the session if authenticated, null otherwise.
 * In demo mode, always returns the demo session.
 */
export async function getAuthenticatedSession() {
    // In demo mode, always return demo session
    if (getDataMode() === 'demo') {
        return DEMO_SESSION
    }

    const session = await getServerSession()
    if (!session?.user) return null
    // Check if user is anonymous
    if (session.user.email?.endsWith('@anonymous.user')) return null
    return session
}

export type ServerSession = Awaited<ReturnType<typeof getServerSession>>
