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
        sms
    }: {
        clientInfo: ClientInfo | null,
        uid: string,
        number: NumberInfo | null,
        countryId: number | null,
        areaCode: number | null,
        qty: number,
        voice?: NumberDestination,
        sms?: NumberDestination
    }): Promise<CartItem[] | null> {
    if (!uid || !number) {
        console.log('addToCart: no uid or number')
        return []
    }
    console.log('addToCart: ', uid, number, countryId, areaCode, qty, voice, sms)
    const session = await auth()
    const anonymous = !session || !session.user || session.user.provider === 'anonymous'
    const appIp = await getAppIp()
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
            'sms': sms
        })
    }
    return fetch(process.env.REDREPORT_URL + (!anonymous ? '/api/kc/cart' : '/api/cart'), options)
        .then((res: Response) => {
            console.log('addToCart: ', res)
            if (!res.ok) return null
            return res.json()
        })
        .then(async (data) => {
            return data.data.cart
        })
        .catch((err) => {
            console.log('addToCart error: ', err.message)
            return null
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
        .then((res: Response) => {
            if (!res.ok) return null
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
        .then((res: Response) => {
            if (!res.ok) return null
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