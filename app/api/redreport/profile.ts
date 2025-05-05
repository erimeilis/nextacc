'use server'
import {UserProfile} from '@/types/UserProfile'
import {auth} from '@/auth'

//const urlKcToken: string = process.env.KEYCLOAK_REALM + '/protocol/openid-connect/token'
//const urlKcUsers: string = process.env.KEYCLOAK_ADMIN_REALM + '/users/'
//TODO maybe edit profile @ KC too?

export async function redGetUserProfile(): Promise<UserProfile | null> {
    const session = await auth()
    if (!session || !session.user || session.user.provider === 'anonymous') return null

    const url = new URL(process.env.REDREPORT_URL + '/api/kc/profile')
    url.searchParams.append('site', process.env.SITE_ID || '')

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
            //console.log('redGetUserProfile: ', res.status)
            if (!res.ok) return null
            return res.json()
        })
        .then((data) => {
            return data.data
        })
        .catch((err) => {
            console.log('redGetUserProfile error: ', err.message)
            return null
        })
}

export async function redSetUserProfile(fields: Partial<UserProfile>): Promise<UserProfile | null> {
    const session = await auth()
    if (!session || !session.user || session.user.provider === 'anonymous') return null
    const options: RequestInit = {
        cache: 'reload',
        method: 'PATCH',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': 'Bearer ' + session?.token,
        },
        body: JSON.stringify({
            'site': process.env.SITE_ID,
            'fields': fields
        })
    }
    return fetch(process.env.REDREPORT_URL + '/api/kc/profile', options)
        .then((res: Response) => {
            //console.log('redSetUserProfile: ', res.status)
            if (!res.ok) return null
            return res.json()
        })
        .then((data) => {
            return data.data
        })
        .catch((err) => {
            console.log('redSetUserProfile error: ', err.message)
            return null
        })
}
