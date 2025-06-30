'use server'
import {NumberInfo} from '@/types/NumberInfo'
import {NumberDestination} from '@/types/NumberDestination'
import {auth} from '@/auth'
import {getAppIp} from '@/utils/getAppIp'
import {ClientInfo} from '@/types/ClientInfo'
import {MyWaitingNumberInfo} from '@/types/MyWaitingNumberInfo'
import {MyNumberInfo} from '@/types/MyNumberInfo'

export async function buy(
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
        console.log('buy: no uid or number')
        return {
            type: 'fail',
            data: null
        }
    }

    const session = await auth()
    const anonymous = !session || !session.user || session.user.provider === 'anonymous'
    const appIp = await getAppIp()
    // Process documents based on format (object or array)
    let processedDocs: { [key: string]: string } | Array<{ type: string, file: string }> | undefined = undefined
    if (docs) {
        if (Array.isArray(docs)) {
            processedDocs = docs
        } else {
            // Convert an object format to an array format
            processedDocs = Object.entries(docs).map(([key, value]) => {
                // Remove the 'doc _' prefix from a key
                const type = key.startsWith('doc_') ? key.substring(4) : key
                return {type, file: value}
            })
        }
    }

    const options: RequestInit = {
        cache: 'no-store',
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': (!anonymous ?
                    ('Bearer ' + session?.token) :
                    ('Bearer ' + process.env.REDREPORT_TOKEN)
            ),
            'X-UID': uid,
            'X-App-IP': appIp || '',
            'X-Client-IP': clientInfo?.ip || '',
            'X-Client-Country': clientInfo?.country || '',
        },
        credentials: 'include',
        body: JSON.stringify({
            'site_id': process.env.SITE_ID,
            'did': number.did,
            'where_did': number.where_did,
            'country_id': countryId,
            'area_code': areaCode,
            'qty': qty,
            'voice': voice,
            'sms': sms,
            'docs': processedDocs
        })
    }
    return fetch(process.env.REDREPORT_URL + (!anonymous ? '/api/kc/buy' : '/api/buy'), options)
        .then((res: Response) => {
            if (!res.ok) {
                // Return error information including status code
                if (res.status === 404) {
                    return {type: 'fail', data: null, error: {status: 404, message: 'number_not_available'}}
                }
                return {type: 'fail', data: null, error: {status: res.status, message: 'buy_error'}}
            }
            return res.json().then(data => ({
                type: data.data.type,
                data: data.data.dids
            }))
        })
        .catch((err) => {
            console.log('buy error: ', err.message)
            return {
                type: 'fail',
                data: null,
                error: {status: 500, message: 'buy_error'}
            }
        })
}
