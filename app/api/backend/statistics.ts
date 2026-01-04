'use server'
import { getAuthenticatedSession } from '@/lib/auth-server'
import { CallStatistics, SmsStatistics } from '@/types/Statistics'
import { dataSource } from '@/lib/data-source'

// Function to get call statistics
export async function redGetCallStatistics(from?: string, to?: string, did?: string): Promise<CallStatistics[]> {
    const session = await getAuthenticatedSession()
    if (!session) return []

    const startDate = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const endDate = to || new Date().toISOString()

    const result = await dataSource.getCallStatistics({ startDate, endDate, did })
    return result || []
}

// Function to send call statistics to email
export async function redSendCallStatistics(from?: string, to?: string, did?: string): Promise<boolean> {
    const session = await getAuthenticatedSession()
    if (!session) return false

    // TODO: Implement email sending when available
    console.log('redSendCallStatistics: Email sending not yet implemented', { from, to, did })
    return true // Simulate success in demo mode
}

// Function to get SMS statistics
export async function redGetSmsStatistics(from?: string, to?: string, did?: string): Promise<SmsStatistics[]> {
    const session = await getAuthenticatedSession()
    if (!session) return []

    const startDate = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const endDate = to || new Date().toISOString()

    const result = await dataSource.getSmsStatistics({ startDate, endDate, did })
    return result || []
}

// Function to send SMS statistics to email
export async function redSendSmsStatistics(from?: string, to?: string, did?: string): Promise<boolean> {
    const session = await getAuthenticatedSession()
    if (!session) return false

    // TODO: Implement email sending when available
    console.log('redSendSmsStatistics: Email sending not yet implemented', { from, to, did })
    return true // Simulate success in demo mode
}
