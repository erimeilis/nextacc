'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCart, addToCart, removeFromCart, buyNumbers } from '@/lib/api'
import type { NumberInfo } from '@/types/NumberInfo'
import type { NumberDestination } from '@/types/NumberDestination'
import type { ClientInfo } from '@/types/ClientInfo'
import { didsKeys } from './use-dids'
import { waitingDidsKeys } from './use-waiting-dids'

export const cartKeys = {
    all: ['cart'] as const,
    detail: (uid: string) => [...cartKeys.all, uid] as const,
}

/**
 * useCart - Fetch cart items
 */
export function useCart(uid: string) {
    return useQuery({
        queryKey: cartKeys.detail(uid),
        queryFn: async () => {
            const result = await getCart(uid)
            if (!result.success) {
                throw new Error(result.error)
            }
            return result.data
        },
        enabled: !!uid,
    })
}

/**
 * useAddToCart - Add item to cart
 */
export function useAddToCart() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (params: {
            clientInfo: ClientInfo | null
            uid: string
            number: NumberInfo | null
            countryId: number | null
            areaCode: number | null
            qty: number
            voice?: NumberDestination
            sms?: NumberDestination
            docs?: { [doc_slug: string]: string } | Array<{ type: string; file: string }>
        }) => {
            const result = await addToCart(params)
            if (!result.success) {
                throw new Error(result.error)
            }
            return result.data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: cartKeys.detail(variables.uid) })
        },
    })
}

/**
 * useRemoveFromCart - Remove items from cart
 */
export function useRemoveFromCart() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ uid, ids }: { uid: string; ids: number[] }) => {
            const result = await removeFromCart(uid, ids)
            if (!result.success) {
                throw new Error(result.error)
            }
            return result.data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: cartKeys.detail(variables.uid) })
        },
    })
}

/**
 * useBuyNumbers - Purchase numbers (checkout)
 */
export function useBuyNumbers() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (params: {
            clientInfo: ClientInfo | null
            uid: string
            numbers: NumberInfo[]
            countryId: number | null
            areaCode: number | null
            qty: number
            voice?: NumberDestination
            sms?: NumberDestination
            docs?: { [doc_slug: string]: string } | Array<{ type: string; file: string }>
        }) => {
            const result = await buyNumbers(params)
            if (!result.success) {
                throw new Error(result.error)
            }
            return result.data
        },
        onSuccess: (_, variables) => {
            // Invalidate cart, dids, and waiting dids after purchase
            queryClient.invalidateQueries({ queryKey: cartKeys.detail(variables.uid) })
            queryClient.invalidateQueries({ queryKey: didsKeys.all })
            queryClient.invalidateQueries({ queryKey: waitingDidsKeys.all })
        },
    })
}
