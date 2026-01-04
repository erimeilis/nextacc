'use server'
import { CallStatistics } from '@/types/Statistics'
import { getAuthenticatedSession } from '@/lib/auth-server'
import { dataSource } from '@/lib/data-source'

export async function redGetCallStatisticsReport(): Promise<CallStatistics[]> {
    const session = await getAuthenticatedSession()
    if (!session) return []

    // Default to last 30 days
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const endDate = new Date().toISOString()

    const result = await dataSource.getCallStatistics({ startDate, endDate })
    return result || []
}
