'use server'
import { getAuthenticatedSession } from '@/lib/auth-server'
import { NumberInfo } from '@/types/NumberInfo'
import { MyNumberInfo } from '@/types/MyNumberInfo'
import { dataSource } from '@/lib/data-source'

export async function redGetMyDids(): Promise<NumberInfo[] | null> {
    const session = await getAuthenticatedSession()
    if (!session) return null

    return dataSource.getMyDids()
}

export async function redGetDidSettings(number: string): Promise<MyNumberInfo | null> {
    const session = await getAuthenticatedSession()
    if (!session) return null

    return dataSource.getDidSettings(number)
}

export async function redUpdateDidSettings(number: string, data: Partial<MyNumberInfo>): Promise<MyNumberInfo | null> {
    const session = await getAuthenticatedSession()
    if (!session) return null

    return dataSource.updateDidSettings(number, data)
}

export async function redDeleteDid(number: string): Promise<NumberInfo[] | null> {
    const session = await getAuthenticatedSession()
    if (!session) return null

    return dataSource.deleteDid(number)
}
