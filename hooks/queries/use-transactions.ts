'use client'

import { useQuery } from '@tanstack/react-query'
import { getTransactions } from '@/lib/api'

export const transactionKeys = {
    all: ['transactions'] as const,
    list: () => [...transactionKeys.all, 'list'] as const,
}

/**
 * useTransactions - Fetch user transactions
 */
export function useTransactions() {
    return useQuery({
        queryKey: transactionKeys.list(),
        queryFn: async () => {
            const result = await getTransactions()
            if (!result.success) {
                throw new Error(result.error)
            }
            return result.data
        },
    })
}
