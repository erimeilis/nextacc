'use server'
import {NumberInfo} from '@/types/NumberInfo'
import {auth} from '@/auth'

export async function addToCart(
    {
        uid,
        number,
        countryId,
        areaCode,
        qty,
        voice,
        sms
    }: {
        uid: string,
        number: NumberInfo | null,
        countryId: number | null,
        areaCode: number | null,
        qty: number,
        voice?: { type: string, destination: string },
        sms?: { type: string, destination: string }
    }) {
    if (!uid || !number) {
        console.log('buyNumber: no uid or number')
        return []
    }
    const session = await auth()
    const anonymous = !session || !session.user || session.user.provider === 'anonymous'
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
        },
        credentials: 'include',
        body: JSON.stringify({
            'site': process.env.SITE_ID,
            'did': number.did,
            'where_did': number.where_did,
            'country_id': countryId,
            'area_code': areaCode,
            'qty': qty,
            'voice': voice,
            'sms': sms
        })
    }
    return fetch(process.env.REDREPORT_URL + (!anonymous ? '/api/kc/add-to-cart' : '/api/add-to-cart'), options)
        .then((res: Response) => {
            if (!res.ok) return []
            return res.json()
        })
        .then(async (data) => {
            console.log('buyNumber: ', data)
            return data.data
        })
        .catch((err) => {
            console.log('buyNumber error: ', err.message)
            return []
        })
}