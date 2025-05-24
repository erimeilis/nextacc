export type SortDirection = 'asc' | 'desc' | null
export type SortConfig<T> = {
    key: keyof T | null
    direction: SortDirection
}

export type FilterConfig = {
    startDate: Date | null
    endDate: Date | null
    amount: string
    operation: string
    description: string
    reseller: boolean | null
}
