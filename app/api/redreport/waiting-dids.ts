'use server'
import {auth} from '@/auth'
import {MyWaitingNumberInfo} from '@/types/MyWaitingNumberInfo'

export async function redGetMyWaitingDids(): Promise<MyWaitingNumberInfo[] | null> {
    const session = await auth()
    if (!session || !session.user || session.user.provider === 'anonymous') {
        console.log('redGetMyWaitingDids: No valid session, returning null')
        return null
    }

    const url = new URL(process.env.REDREPORT_URL + '/api/kc/waiting-dids')
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
            console.log('redGetMyWaitingDids: Response status:', res.status)
            if (!res.ok) {
                const errorData = await res.json()
                console.log('redGetMyWaitingDids error response: ', errorData)
                return null
            }
            return res.json()
        })
        .then(async (data) => {
            return data.data
        })
        .catch((err) => {
            console.log('redGetMyWaitingDids error: ', err.message)
            return null
        })
}

export async function redGetWaitingDidSettings(number: string): Promise<MyWaitingNumberInfo | null> {
    const session = await auth()
    if (!session || !session.user || session.user.provider === 'anonymous') return null

    const url = new URL(process.env.REDREPORT_URL + `/api/kc/waiting-dids/${number}`)
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
            console.log('redGetWaitingDidSettings: ', res.status)
            if (!res.ok) {
                const errorData = await res.json()
                console.log('redGetWaitingDidSettings error response: ', errorData)
                return null
            }
            return res.json()
        })
        .then(async (data) => {
            console.log('redGetWaitingDidSettings: ', data)
            return data.data
        })
        .catch((err) => {
            console.log('redGetWaitingDidSettings error: ', err.message)
            return null
        })
}

export async function redUpdateWaitingDidSettings(number: string, data: Partial<MyWaitingNumberInfo>): Promise<MyWaitingNumberInfo | null> {
    const session = await auth()
    if (!session || !session.user || session.user.provider === 'anonymous') return null

    const url = new URL(process.env.REDREPORT_URL + `/api/kc/waiting-dids/${number}`)
    const requestBody = {
        ...data,
        site_id: process.env.SITE_ID || ''
    }
    const options: RequestInit = {
        cache: 'no-store',
        method: 'PATCH',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': 'Bearer ' + session?.token,
        },
        body: JSON.stringify(requestBody)
    }

    return fetch(url.toString(), options)
        .then(async (res: Response) => {
            console.log('redUpdateWaitingDidSettings: ', res.status)
            if (!res.ok) {
                const errorData = await res.json()
                console.log('redUpdateWaitingDidSettings error response: ', errorData)
                return null
            }
            return res.json()
        })
        .then(async (data) => {
            return data.data
        })
        .catch((err) => {
            console.log('redUpdateWaitingDidSettings error: ', err.message)
            return null
        })
}
