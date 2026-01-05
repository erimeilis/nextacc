'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getIvrOptions, getIvrOrders, orderIvr } from '@/lib/api'
import type { OrderIvrParams } from '@/types/IvrTypes'

export const ivrKeys = {
    all: ['ivr'] as const,
    options: () => [...ivrKeys.all, 'options'] as const,
    orders: () => [...ivrKeys.all, 'orders'] as const,
}

/**
 * useIvrOptions - Fetch IVR options (voices, music, effects)
 */
export function useIvrOptions() {
    return useQuery({
        queryKey: ivrKeys.options(),
        queryFn: async () => {
            const result = await getIvrOptions()
            if (!result.success) {
                throw new Error(result.error)
            }
            return result.data
        },
    })
}

/**
 * useIvrOrders - Fetch IVR orders
 */
export function useIvrOrders() {
    return useQuery({
        queryKey: ivrKeys.orders(),
        queryFn: async () => {
            const result = await getIvrOrders()
            if (!result.success) {
                throw new Error(result.error)
            }
            return result.data
        },
    })
}

/**
 * useOrderIvr - Create a new IVR order
 */
export function useOrderIvr() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (params: OrderIvrParams) => {
            const result = await orderIvr(params)
            if (!result.success) {
                throw new Error(result.error)
            }
            return result.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ivrKeys.orders() })
        },
    })
}
