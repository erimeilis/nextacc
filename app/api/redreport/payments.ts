'use server'
import {auth} from '@/auth'
import {PaymentRegion} from '@/types/PaymentTypes'

export async function redGetPaymentsMethods(sum?: number): Promise<PaymentRegion[] | null> {
    const session = await auth()
    if (!session || !session.user || session.user.provider === 'anonymous') {
        console.log('redGetPaymentsMethods: No valid session, returning null')
        return null
    }

    const url = new URL(process.env.REDREPORT_URL + '/api/kc/payment-methods')
    url.searchParams.append('site_id', process.env.SITE_ID || '')

    // Add sum parameter if provided
    if (sum !== undefined) {
        url.searchParams.append('sum', sum.toString())
    }

    const options: RequestInit = {
        cache: 'reload',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': 'Bearer ' + session?.token,
        }
    }

    return fetch(url.toString(), options)
        .then(async (res: Response) => {
            console.log('redGetPaymentsMethods: Response status:', res.status)
            if (!res.ok) {
                const errorData = await res.json()
                console.log('redGetPaymentsMethods error response: ', errorData)
                return null
            }
            return res.json()
        })
        .then(async (data) => {
            //console.log('redGetPaymentsMethods: Response data:', data)
            return data
        })
        .catch((err) => {
            console.log('redGetPaymentsMethods error: ', err.message)
            return null
        })
}
