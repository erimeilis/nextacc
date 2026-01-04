'use server'
import { CountryInfo } from '@/types/CountryInfo'
import { AreaInfo } from '@/types/AreaInfo'
import { NumberInfo } from '@/types/NumberInfo'
import { dataSource } from '@/lib/data-source'
import type { DiscountInfo } from '@/lib/data-source/types'

export async function redGetCountries({ type }: { type: string }): Promise<CountryInfo[]> {
    return dataSource.getCountries(type)
}

export async function redGetAreas({ type, country }: { type: string; country: number }): Promise<AreaInfo[]> {
    return dataSource.getAreas(type, country)
}

export async function redGetNumbers({ type, country, area }: { type: string; country: number; area: number }): Promise<NumberInfo[]> {
    return dataSource.getAvailableNumbers(type, country, area)
}

export async function redGetDiscounts(): Promise<DiscountInfo[]> {
    return dataSource.getDiscounts()
}
