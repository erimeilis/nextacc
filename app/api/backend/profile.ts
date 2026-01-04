'use server'
import { UserProfile } from '@/types/UserProfile'
import { getAuthenticatedSession } from '@/lib/auth-server'
import { dataSource } from '@/lib/data-source'

export async function redGetUserProfile(): Promise<UserProfile | null> {
    const session = await getAuthenticatedSession()
    if (!session) return null

    return dataSource.getProfile()
}

export async function redSetUserProfile(fields: Partial<UserProfile>): Promise<UserProfile | null> {
    const session = await getAuthenticatedSession()
    if (!session) return null

    return dataSource.updateProfile(fields)
}
