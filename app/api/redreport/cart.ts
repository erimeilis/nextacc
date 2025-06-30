'use server'
import {NumberInfo} from '@/types/NumberInfo'
import {NumberDestination} from '@/types/NumberDestination'
import {auth} from '@/auth'
import {getAppIp} from '@/utils/getAppIp'
import {ClientInfo} from '@/types/ClientInfo'
import {CartItem} from '@/types/CartItem'

export async function addToCart(
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
    }): Promise<{ data: CartItem[] | null, error?: { status: number, message: string } }> {
    if (!uid || !number) {
        console.log('addToCart: no uid or number')
        return {data: []}
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
    return fetch(process.env.REDREPORT_URL + (!anonymous ? '/api/kc/cart' : '/api/cart'), options)
        .then((res: Response) => {
            console.log('addToCart: ', res)
            if (!res.ok) {
                // Return error information including status code
                if (res.status === 404) {
                    return {data: null, error: {status: 404, message: 'number_not_available'}}
                }
                return {data: null, error: {status: res.status, message: 'cart_add_error'}}
            }
            return res.json().then(data => ({data: data.data.cart}))
        })
        .catch((err) => {
            console.log('addToCart error: ', err.message)
            return {data: null, error: {status: 500, message: 'cart_add_error'}}
        })
}

export async function getCart(
    {
        uid,
    }: {
        uid: string,
    }): Promise<CartItem[] | null> {
    if (!uid) {
        console.log('getCart: no uid')
        return []
    }
    const session = await auth()
    const anonymous = !session || !session.user || session.user.provider === 'anonymous'

    const url = new URL(process.env.REDREPORT_URL + (!anonymous ? '/api/kc/cart' : '/api/cart'))
    url.searchParams.append('site_id', process.env.SITE_ID || '')

    const options: RequestInit = {
        cache: 'no-store',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': (!anonymous ?
                    ('Bearer ' + session?.token) :
                    ('Bearer ' + process.env.REDREPORT_TOKEN)
            ),
            'X-UID': uid,
        },
        credentials: 'include'
    }
    return fetch(url.toString(), options)
        .then(async (res: Response) => {
            if (!res.ok) {
                const errorData = await res.json()
                console.log('getCart error response: ', errorData)
                return null
            }
            return res.json()
        })
        .then(async (data) => {
            return data.data
        })
        .catch((err) => {
            console.log('getCart error: ', err.message)
            return null
        })
}

export async function removeFromCart(
    {
        uid,
        id
    }: {
        uid: string,
        id: number[]
    }): Promise<CartItem[] | null> {
    if (!uid) {
        console.log('getCart: no uid')
        return []
    }
    const session = await auth()
    const anonymous = !session || !session.user || session.user.provider === 'anonymous'

    const url = new URL(process.env.REDREPORT_URL + (!anonymous ? '/api/kc/cart' : '/api/cart'))
    url.searchParams.append('site_id', process.env.SITE_ID || '')
    id.forEach(itemId => {
        url.searchParams.append('id[]', itemId.toString())
    })

    const options: RequestInit = {
        cache: 'no-store',
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': (!anonymous ?
                    ('Bearer ' + session?.token) :
                    ('Bearer ' + process.env.REDREPORT_TOKEN)
            ),
            'X-UID': uid,
        },
        credentials: 'include'
    }
    return fetch(url.toString(), options)
        .then(async (res: Response) => {
            if (!res.ok) {
                const errorData = await res.json()
                console.log('removeFromCart error response: ', errorData)
                return null
            }
            return res.json()
        })
        .then(async (data) => {
            return data.data
        })
        .catch((err) => {
            console.log('removeFromCart error: ', err.message)
            return null
        })
}
