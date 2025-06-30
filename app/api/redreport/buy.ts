'use server'
import {NumberInfo} from '@/types/NumberInfo'
import {NumberDestination} from '@/types/NumberDestination'
import {auth} from '@/auth'
import {getAppIp} from '@/utils/getAppIp'
import {ClientInfo} from '@/types/ClientInfo'

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
    type?: string,
    order_id?: string,
    error?: { status: number, message: string }
}> {
    if (!uid || !number) {
        console.log('buy: no uid or number')
        return {}
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
        // Log the processed docs to verify
        console.log('Processed docs:', JSON.stringify(processedDocs))
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
            console.log('buy: ', res)
            if (!res.ok) {
                // Return error information including status code
                if (res.status === 404) {
                    return {error: {status: 404, message: 'number_not_available'}}
                }
                return {error: {status: res.status, message: 'buy'}}
            }
            return res.json().then(data => {
                // Check if the response contains type and order_id
                if (data.type) {
                    return {
                        type: data.type,
                    }
                }
                // Default case - just return the data as is
                return data
            })
        })
        .catch((err) => {
            console.log('buy error: ', err.message)
            return {error: {status: 500, message: 'buy'}}
        })
}
