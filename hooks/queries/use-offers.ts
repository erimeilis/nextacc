'use client'

import { useQuery } from '@tanstack/react-query'
import { getDiscounts, getCountries, getAreas, getAvailableNumbers } from '@/lib/api'

export const offersKeys = {
    all: ['offers'] as const,
    discounts: () => [...offersKeys.all, 'discounts'] as const,
    countries: (type: string) => [...offersKeys.all, 'countries', type] as const,
    areas: (type: string, countryId: number) => [...offersKeys.all, 'areas', type, countryId] as const,
    numbers: (type: string, countryId: number, areaPrefix: number) => [...offersKeys.all, 'numbers', type, countryId, areaPrefix] as const,
}

/**
 * useDiscounts - Fetch available discount tiers
 */
export function useDiscounts() {
    return useQuery({
        queryKey: offersKeys.discounts(),
        queryFn: async () => {
            const discounts = await getDiscounts()
            return discounts
        },
        staleTime: 1000 * 60 * 60, // 1 hour - discounts don't change often
    })
}

/**
 * useCountries - Fetch countries for a number type
 */
export function useCountries(type: string) {
    return useQuery({
        queryKey: offersKeys.countries(type),
        queryFn: async () => {
            return await getCountries(type)
        },
        enabled: !!type,
        staleTime: 1000 * 60 * 60, // 1 hour
    })
}

/**
 * useAreas - Fetch areas for a country
 */
export function useAreas(type: string, countryId: number | null) {
    return useQuery({
        queryKey: offersKeys.areas(type, countryId ?? 0),
        queryFn: async () => {
            if (!countryId) return []
            return await getAreas(type, countryId)
        },
        enabled: !!type && !!countryId,
        staleTime: 1000 * 60 * 60, // 1 hour
    })
}

/**
 * useAvailableNumbers - Fetch available numbers for an area
 */
export function useAvailableNumbers(type: string, countryId: number | null, areaPrefix: number | null) {
    return useQuery({
        queryKey: offersKeys.numbers(type, countryId ?? 0, areaPrefix ?? 0),
        queryFn: async () => {
            if (!countryId || !areaPrefix) return []
            return await getAvailableNumbers(type, countryId, areaPrefix)
        },
        enabled: !!type && !!countryId && !!areaPrefix,
        staleTime: 1000 * 60 * 5, // 5 minutes - numbers change more frequently
    })
}
