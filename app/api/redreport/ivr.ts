'use server'
import {auth} from '@/auth'
import {IvrOrder, IvrResponse, OrderIvrParams, OrderIvrResponse} from '@/types/IvrTypes'

export async function redGetIvr(): Promise<IvrResponse | null> {
    const session = await auth()
    if (!session || !session.user || session.user.provider === 'anonymous') {
        console.log('redGetIvr: No valid session, returning null')
        return null
    }

    const url = new URL(process.env.REDREPORT_URL + '/api/kc/ivr')
    url.searchParams.append('site_id', process.env.SITE_ID || '')

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
            console.log('redGetIvr: ', res.status)
            if (!res.ok) {
                const errorData = await res.json()
                console.log('redGetIvr error response: ', errorData)
                return null
            }
            return res.json()
        })
        .then(async (data) => {
            return data
        })
        .catch((err) => {
            console.log('redGetIvr error: ', err.message)
            return null
        })
}


export async function redGetMyIvr(): Promise<IvrOrder[] | null> {
    const session = await auth()
    if (!session || !session.user || session.user.provider === 'anonymous') {
        console.log('redGetMyIvr: No valid session, returning null')
        return null
    }

    const url = new URL(process.env.REDREPORT_URL + '/api/kc/ivr/orders')
    url.searchParams.append('site_id', process.env.SITE_ID || '')

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
            console.log('redGetMyIvr: ', res.status)
            if (!res.ok) {
                const errorData = await res.json()
                console.log('redGetMyIvr error response: ', errorData)
                return null
            }
            return res.json()
        })
        .then(async (data) => {
            return data.data
        })
        .catch((err) => {
            console.log('redGetMyIvr error: ', err.message)
            return null
        })
}

export async function redOrderIvr(params: OrderIvrParams): Promise<OrderIvrResponse | null> {
    const session = await auth()
    if (!session || !session.user || session.user.provider === 'anonymous') {
        console.log('redOrderIvr: No valid session, returning null')
        return null
    }

    const url = new URL(process.env.REDREPORT_URL + '/api/kc/ivr')
    url.searchParams.append('site_id', process.env.SITE_ID || '')

    const options: RequestInit = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': 'Bearer ' + session?.token,
        },
        body: JSON.stringify(params)
    }

    return fetch(url.toString(), options)
        .then(async (res: Response) => {
            console.log('redOrderIvr: ', res.status)
            if (!res.ok) {
                const errorData = await res.json()
                console.log('redOrderIvr error response: ', errorData)
                return null
            }
            return res.json()
        })
        .then(async (data) => {
            console.log('redOrderIvr: Response data:', data)
            return data.data
        })
        .catch((err) => {
            console.log('redOrderIvr error: ', err.message)
            return null
        })
}
