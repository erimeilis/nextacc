'use server'
import { getAuthenticatedSession } from '@/lib/auth-server'
import { MyWaitingNumberInfo } from '@/types/MyWaitingNumberInfo'
import { dataSource } from '@/lib/data-source'

export async function redGetMyWaitingDids(): Promise<MyWaitingNumberInfo[] | null> {
    const session = await getAuthenticatedSession()
    if (!session) return null

    return dataSource.getWaitingDids()
}

export async function redGetWaitingDidSettings(id: string): Promise<MyWaitingNumberInfo | null> {
    const session = await getAuthenticatedSession()
    if (!session) return null

    const waitingDids = await dataSource.getWaitingDids()
    return waitingDids?.find(d => d.id === id) || null
}

export async function redUpdateWaitingDidSettings(id: string, data: Partial<MyWaitingNumberInfo>): Promise<MyWaitingNumberInfo | null> {
    const session = await getAuthenticatedSession()
    if (!session) return null

    // TODO: Implement update in data source when available
    console.log('redUpdateWaitingDidSettings: Update not yet implemented', { id, data })
    const waitingDids = await dataSource.getWaitingDids()
    const existing = waitingDids?.find(d => d.id === id)
    if (!existing) return null
    return { ...existing, ...data }
}

export async function redDeleteWaitingDid(id: string): Promise<MyWaitingNumberInfo[] | null> {
    const session = await getAuthenticatedSession()
    if (!session) return null

    const result = await dataSource.deleteWaitingDid(id)
    return result.data
}

export async function redConfirmWaitingDid(id: string): Promise<MyWaitingNumberInfo | null> {
    const session = await getAuthenticatedSession()
    if (!session) return null

    const result = await dataSource.confirmWaitingDid(id)
    return result.data
}
