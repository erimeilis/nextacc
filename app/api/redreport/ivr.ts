'use server'
import {auth} from '@/auth'
import {IvrResponse} from '@/types/IvrTypes'

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
            console.log('redGetIvr: Response status:', res.status)
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
