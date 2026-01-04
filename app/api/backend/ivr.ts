'use server'
import { getAuthenticatedSession } from '@/lib/auth-server'
import { IvrOrder, IvrResponse, OrderIvrParams, OrderIvrResponse } from '@/types/IvrTypes'
import { dataSource } from '@/lib/data-source'

export async function redGetIvr(): Promise<IvrResponse | null> {
    const session = await getAuthenticatedSession()
    if (!session) return null

    const data = await dataSource.getIvrOptions()
    if (!data) return null

    return {
        data,
        message: 'success'
    }
}

export async function redGetMyIvr(): Promise<IvrOrder[] | null> {
    const session = await getAuthenticatedSession()
    if (!session) return null

    return dataSource.getIvrOrders()
}

export async function redOrderIvr(params: OrderIvrParams): Promise<OrderIvrResponse | null> {
    const session = await getAuthenticatedSession()
    if (!session) return null

    return dataSource.orderIvr(params)
}
