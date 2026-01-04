'use server'
import { NumberInfo } from '@/types/NumberInfo'
import { NumberDestination } from '@/types/NumberDestination'
import { getAuthenticatedSession } from '@/lib/auth-server'
import { ClientInfo } from '@/types/ClientInfo'
import { MyWaitingNumberInfo } from '@/types/MyWaitingNumberInfo'
import { MyNumberInfo } from '@/types/MyNumberInfo'
import { dataSource } from '@/lib/data-source'

export async function redBuy(
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
    type: string,
    data: MyWaitingNumberInfo[] | MyNumberInfo[] | null,
    error?: { status: number, message: string }
}> {
    if (!uid || !number) {
        return { type: 'fail', data: null }
    }

    const session = await getAuthenticatedSession()
    if (!session) {
        return { type: 'fail', data: null, error: { status: 401, message: 'not_authenticated' } }
    }

    const result = await dataSource.buyNumbers({
        clientInfo,
        uid,
        numbers: [number],
        countryId,
        areaCode,
        qty,
        voice,
        sms,
        docs
    })

    if (result.error) {
        return { type: 'fail', data: null, error: result.error }
    }

    // Determine if the purchase was confirmed or is waiting for verification
    const data = result.data
    if (data && 'pay_sum' in data) {
        return { type: 'wait', data: [data as MyWaitingNumberInfo] }
    }

    return { type: 'confirm', data: data ? [data as MyNumberInfo] : null }
}
