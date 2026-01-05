'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getWaitingDids, confirmWaitingDid, deleteWaitingDid, getWaitingDidSettings, updateWaitingDidSettings } from '@/lib/api'
import { didsKeys } from './use-dids'
import type { MyWaitingNumberInfo } from '@/types/MyWaitingNumberInfo'

export const waitingDidsKeys = {
    all: ['waiting-dids'] as const,
    list: () => [...waitingDidsKeys.all, 'list'] as const,
    settings: (id: string) => [...waitingDidsKeys.all, 'settings', id] as const,
}

/**
 * useWaitingDids - Fetch waiting phone numbers (pending confirmation)
 */
export function useWaitingDids() {
    return useQuery({
        queryKey: waitingDidsKeys.list(),
        queryFn: async () => {
            const result = await getWaitingDids()
            if (!result.success) {
                throw new Error(result.error)
            }
            return result.data
        },
    })
}

/**
 * useConfirmWaitingDid - Confirm a waiting phone number
 */
export function useConfirmWaitingDid() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            const result = await confirmWaitingDid(id)
            if (!result.success) {
                throw new Error(result.error)
            }
            return result.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: waitingDidsKeys.all })
            queryClient.invalidateQueries({ queryKey: didsKeys.all })
        },
    })
}

/**
 * useDeleteWaitingDid - Cancel/delete a waiting phone number
 */
export function useDeleteWaitingDid() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            const result = await deleteWaitingDid(id)
            if (!result.success) {
                throw new Error(result.error)
            }
            return result.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: waitingDidsKeys.all })
        },
    })
}

/**
 * useWaitingDidSettings - Fetch settings for a specific waiting phone number
 */
export function useWaitingDidSettings(id: string | undefined) {
    return useQuery({
        queryKey: waitingDidsKeys.settings(id || ''),
        queryFn: async () => {
            if (!id) return null
            const result = await getWaitingDidSettings(id)
            if (!result.success) {
                throw new Error(result.error)
            }
            return result.data
        },
        enabled: !!id,
    })
}

/**
 * useUpdateWaitingDidSettings - Update settings for a waiting phone number
 */
export function useUpdateWaitingDidSettings() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<MyWaitingNumberInfo> }) => {
            const result = await updateWaitingDidSettings(id, data)
            if (!result.success) {
                throw new Error(result.error)
            }
            return result.data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: waitingDidsKeys.settings(variables.id) })
            queryClient.invalidateQueries({ queryKey: waitingDidsKeys.list() })
        },
    })
}
