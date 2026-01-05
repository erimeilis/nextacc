'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { getCallStatistics, getSmsStatistics, sendCallStatistics, sendSmsStatistics } from '@/lib/api'

export const statsKeys = {
    all: ['stats'] as const,
    calls: (params: { startDate: string; endDate: string; did?: string }) =>
        [...statsKeys.all, 'calls', params] as const,
    sms: (params: { startDate: string; endDate: string; did?: string }) =>
        [...statsKeys.all, 'sms', params] as const,
}

/**
 * useCallStats - Fetch call statistics
 */
export function useCallStats(params: { startDate: string; endDate: string; did?: string }) {
    return useQuery({
        queryKey: statsKeys.calls(params),
        queryFn: async () => {
            const result = await getCallStatistics(params)
            if (!result.success) {
                throw new Error(result.error)
            }
            return result.data
        },
        enabled: !!params.startDate && !!params.endDate,
    })
}

/**
 * useSmsStats - Fetch SMS statistics
 */
export function useSmsStats(params: { startDate: string; endDate: string; did?: string }) {
    return useQuery({
        queryKey: statsKeys.sms(params),
        queryFn: async () => {
            const result = await getSmsStatistics(params)
            if (!result.success) {
                throw new Error(result.error)
            }
            return result.data
        },
        enabled: !!params.startDate && !!params.endDate,
    })
}

/**
 * useSendCallStats - Send call statistics to email
 */
export function useSendCallStats() {
    return useMutation({
        mutationFn: async (params: { startDate: string; endDate: string; did?: string }) => {
            const result = await sendCallStatistics(params)
            if (!result.success) {
                throw new Error(result.error)
            }
            return result.data
        },
    })
}

/**
 * useSendSmsStats - Send SMS statistics to email
 */
export function useSendSmsStats() {
    return useMutation({
        mutationFn: async (params: { startDate: string; endDate: string; did?: string }) => {
            const result = await sendSmsStatistics(params)
            if (!result.success) {
                throw new Error(result.error)
            }
            return result.data
        },
    })
}
