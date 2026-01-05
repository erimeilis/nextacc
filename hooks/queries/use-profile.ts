'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProfile, updateProfile } from '@/lib/api'
import type { UserProfile } from '@/types/UserProfile'

/**
 * Query Keys
 */
export const profileKeys = {
    all: ['profile'] as const,
    detail: () => [...profileKeys.all, 'detail'] as const,
}

/**
 * useProfile - Fetch user profile
 *
 * Replaces the old pattern:
 * - useClientStore().getProfile() + useClientStore().fetchProfile()
 * - Local state + useRef for fetch tracking
 *
 * Now you get:
 * - data: UserProfile | undefined
 * - isLoading: boolean
 * - error: Error | null
 * - refetch: () => void
 */
export function useProfile() {
    return useQuery({
        queryKey: profileKeys.detail(),
        queryFn: async () => {
            const result = await getProfile()
            if (!result.success) {
                throw new Error(result.error)
            }
            return result.data
        },
    })
}

/**
 * useUpdateProfile - Update user profile
 *
 * Replaces: redSetUserProfile() from app/api/backend/profile
 *
 * Features:
 * - Automatic cache invalidation on success
 * - isPending for loading state
 * - error for error handling
 */
export function useUpdateProfile() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (fields: Partial<UserProfile>) => {
            const result = await updateProfile(fields)
            if (!result.success) {
                throw new Error(result.error)
            }
            return result.data
        },
        onSuccess: (data) => {
            // Update the cache with the new data
            queryClient.setQueryData(profileKeys.detail(), data)
            // Also invalidate to ensure freshness
            queryClient.invalidateQueries({ queryKey: profileKeys.all })
        },
    })
}
