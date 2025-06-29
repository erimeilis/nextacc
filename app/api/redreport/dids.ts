'use server'
import {auth} from '@/auth'
import {NumberInfo} from '@/types/NumberInfo'
import {DetailedNumberInfo} from '@/types/DetailedNumberInfo'

export async function redGetMyDids(): Promise<NumberInfo[] | null> {
    const session = await auth()
    if (!session || !session.user || session.user.provider === 'anonymous') {
        console.log('redGetMyDids: No valid session, returning null')
        return null
    }

    const url = new URL(process.env.REDREPORT_URL + '/api/kc/dids')
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
            console.log('redGetMyDids: Response status:', res.status)
            if (!res.ok) {
                const errorData = await res.json()
                console.log('redGetMyDids error response: ', errorData)
                return null
            }
            return res.json()
        })
        .then(async (data) => {
            return data.data
        })
        .catch((err) => {
            console.log('redGetMyDids error: ', err.message)
            return null
        })
}

export async function redGetDidSettings(number: string): Promise<DetailedNumberInfo | null> {
    const session = await auth()
    if (!session || !session.user || session.user.provider === 'anonymous') return null

    const url = new URL(process.env.REDREPORT_URL + `/api/kc/dids/${number}`)
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
            console.log('redGetDidSettings: ', res.status)
            if (!res.ok) {
                const errorData = await res.json()
                console.log('redGetDidSettings error response: ', errorData)
                return null
            }
            return res.json()
        })
        .then(async (data) => {
            console.log('redGetDidSettings: ', data)
            return data.data
        })
        .catch((err) => {
            console.log('redGetDidSettings error: ', err.message)
            return null
        })
}

export async function redUpdateDidSettings(number: string, data: Partial<DetailedNumberInfo>): Promise<DetailedNumberInfo | null> {
    const session = await auth()
    if (!session || !session.user || session.user.provider === 'anonymous') return null

    const url = new URL(process.env.REDREPORT_URL + `/api/kc/dids/${number}`)
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
            console.log('redUpdateDidSettings: ', res.status)
            if (!res.ok) {
                const errorData = await res.json()
                console.log('redUpdateDidSettings error response: ', errorData)
                return null
            }
            return res.json()
        })
        .then(async (data) => {
            return data.data
        })
        .catch((err) => {
            console.log('redUpdateDidSettings error: ', err.message)
            return null
        })
}
