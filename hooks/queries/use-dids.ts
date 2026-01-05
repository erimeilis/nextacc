'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDids, getDidSettings, updateDidSettings, deleteDid } from '@/lib/api'
import type { MyNumberInfo } from '@/types/MyNumberInfo'

export const didsKeys = {
    all: ['dids'] as const,
    lists: () => [...didsKeys.all, 'list'] as const,
    details: () => [...didsKeys.all, 'detail'] as const,
    detail: (number: string) => [...didsKeys.details(), number] as const,
}

/**
 * useDids - Fetch all user phone numbers
 */
export function useDids() {
    return useQuery({
        queryKey: didsKeys.lists(),
        queryFn: async () => {
            const result = await getDids()
            if (!result.success) {
                throw new Error(result.error)
            }
            return result.data
        },
    })
}

/**
 * useDidSettings - Fetch settings for a specific phone number
 */
export function useDidSettings(number: string) {
    return useQuery({
        queryKey: didsKeys.detail(number),
        queryFn: async () => {
            const result = await getDidSettings(number)
            if (!result.success) {
                throw new Error(result.error)
            }
            return result.data
        },
        enabled: !!number,
    })
}

/**
 * useUpdateDidSettings - Update phone number settings
 */
export function useUpdateDidSettings() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ number, data }: { number: string; data: Partial<MyNumberInfo> }) => {
            const result = await updateDidSettings(number, data)
            if (!result.success) {
                throw new Error(result.error)
            }
            return result.data
        },
        onSuccess: (data, variables) => {
            queryClient.setQueryData(didsKeys.detail(variables.number), data)
            queryClient.invalidateQueries({ queryKey: didsKeys.all })
        },
    })
}

/**
 * useDeleteDid - Delete a phone number
 */
export function useDeleteDid() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (number: string) => {
            const result = await deleteDid(number)
            if (!result.success) {
                throw new Error(result.error)
            }
            return result.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: didsKeys.all })
        },
    })
}
