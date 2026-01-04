import { headers } from 'next/headers'
import { auth } from './auth'

/**
 * Get the current session in server actions and API routes.
 * Returns null if no session exists.
 */
export async function getServerSession() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })
    return session
}

/**
 * Check if the current user is authenticated (not anonymous).
 * Returns the session if authenticated, null otherwise.
 */
export async function getAuthenticatedSession() {
    const session = await getServerSession()
    if (!session?.user) return null
    // Check if user is anonymous
    if (session.user.email?.endsWith('@anonymous.user')) return null
    return session
}

export type ServerSession = Awaited<ReturnType<typeof getServerSession>>
