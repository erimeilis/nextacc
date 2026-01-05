'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { getPaymentMethods, makePayment } from '@/lib/api'

export const paymentsKeys = {
    all: ['payments'] as const,
    methods: (sum?: number) => [...paymentsKeys.all, 'methods', sum] as const,
}

/**
 * usePaymentMethods - Fetch available payment methods
 */
export function usePaymentMethods(sum?: number) {
    return useQuery({
        queryKey: paymentsKeys.methods(sum),
        queryFn: async () => {
            const result = await getPaymentMethods(sum)
            if (!result.success) {
                throw new Error(result.error)
            }
            return result.data
        },
    })
}

/**
 * useMakePayment - Process a payment
 */
export function useMakePayment() {
    return useMutation({
        mutationFn: async ({ amount, paymentMethod }: { amount: number; paymentMethod: string }) => {
            const result = await makePayment(amount, paymentMethod)
            if (!result.success) {
                throw new Error(result.error)
            }
            return result.data
        },
    })
}
