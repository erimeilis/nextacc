'use server'
import {auth} from '@/auth'
import {NumberInfo} from '@/types/NumberInfo'
import {DetailedNumberInfo} from '@/types/DetailedNumberInfo'

export async function redGetMyNumbers(): Promise<NumberInfo[] | null> {
    const session = await auth()
    if (!session || !session.user || session.user.provider === 'anonymous') return null

    const url = new URL(process.env.REDREPORT_URL + '/api/kc/numbers')
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
        .then((res: Response) => {
            if (!res.ok) return null
            return res.json()
        })
        .then(async (data) => {
            return data.data.dids
        })
        .catch((err) => {
            console.log('redGetMyNumbers error: ', err.message)
            return null
        })
}

export async function redGetNumberDetails(number: string): Promise<DetailedNumberInfo | null> {
    const session = await auth()
    if (!session || !session.user || session.user.provider === 'anonymous') return null

    const url = new URL(process.env.REDREPORT_URL + `/api/kc/numbers/${number}`)
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
        .then((res: Response) => {
            console.log('redGetNumberDetails: ', res.status)
            if (!res.ok) return null
            return res.json()
        })
        .then(async (data) => {
            console.log('redGetNumberDetails: ', data.data)
            return data.data
        })
        .catch((err) => {
            console.log('redGetNumberDetails error: ', err.message)
            return null
        })
}

export async function redUpdateNumberDetails(number: string, data: Partial<DetailedNumberInfo>): Promise<DetailedNumberInfo | null> {
    const session = await auth()
    if (!session || !session.user || session.user.provider === 'anonymous') return null

    const url = new URL(process.env.REDREPORT_URL + `/api/kc/numbers/${number}`)
    console.log('redUpdateNumberDetails: ', url.toString())
    const requestBody = {
        ...data,
        site_id: process.env.SITE_ID || ''
    }
    console.log('redUpdateNumberDetails: ', JSON.stringify(requestBody))

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
        .then((res: Response) => {
            console.log('redUpdateNumberDetails: ', res.status)
            if (!res.ok) return null
            return res.json()
        })
        .then(async (data) => {
            console.log('redUpdateNumberDetails: ', data.data)
            return data.data
        })
        .catch((err) => {
            console.log('redUpdateNumberDetails error: ', err.message)
            return null
        })
}
