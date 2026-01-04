'use server'
import { NumberInfo } from '@/types/NumberInfo'
import { NumberDestination } from '@/types/NumberDestination'
import { getAuthenticatedSession } from '@/lib/auth-server'
import { ClientInfo } from '@/types/ClientInfo'
import { CartItem } from '@/types/CartItem'
import { dataSource } from '@/lib/data-source'

export async function redAddToCart(
    {
        clientInfo,
        uid,
        number,
        countryId,
        areaCode,
        qty,
        voice,
        sms,
        docs
    }: {
        clientInfo: ClientInfo | null,
        uid: string,
        number: NumberInfo | null,
        countryId: number | null,
        areaCode: number | null,
        qty: number,
        voice?: NumberDestination,
        sms?: NumberDestination,
        docs?: { [doc_slug: string]: string } | Array<{ type: string, file: string }>
    }): Promise<{
    data: CartItem[] | null,
    error?: { status: number, message: string }
}> {
    if (!uid || !number) {
        return { data: [] }
    }

    const session = await getAuthenticatedSession()
    if (!session) {
        return { data: null, error: { status: 401, message: 'not_authenticated' } }
    }

    return dataSource.addToCart({
        clientInfo,
        uid,
        number,
        countryId,
        areaCode,
        qty,
        voice,
        sms,
        docs
    })
}

export async function redGetCart(
    {
        uid,
    }: {
        uid: string,
    }): Promise<CartItem[] | null> {
    if (!uid) {
        return []
    }

    const session = await getAuthenticatedSession()
    if (!session) return null

    return dataSource.getCart(uid)
}

export async function redRemoveFromCart(
    {
        uid,
        id
    }: {
        uid: string,
        id: number[]
    }): Promise<CartItem[] | null> {
    if (!uid) {
        return []
    }

    const session = await getAuthenticatedSession()
    if (!session) return null

    return dataSource.removeFromCart(uid, id)
}
