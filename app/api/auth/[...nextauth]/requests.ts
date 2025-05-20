'use server'
import {KCApiExchangeToken} from '@/types/KCApiExchangeToken'
import {KCUserRepresentation} from '@/types/KCUserRepresentation'
import {geoip} from '@/utils/geoip'
import {KCFederatedIdentityRepresentation} from '@/types/KCFederatedIdentityRepresentation'

const urlKcToken: string = process.env.KEYCLOAK_REALM + '/protocol/openid-connect/token'
const urlKcUsers: string = process.env.KEYCLOAK_ADMIN_REALM + '/users/'

export async function kcLoginWithToken(token: string): Promise<KCApiExchangeToken | null> {
    const options: RequestInit = {
        cache: 'no-store',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'client_id': process.env.KEYCLOAK_CLIENT_ID as string,
            'client_secret': process.env.KEYCLOAK_CLIENT_SECRET as string,
            'grant_type': 'urn:ietf:params:oauth:grant-type:token-exchange',
            'subject_token_type': 'urn:ietf:params:oauth:token-type:access_token',
            'subject_token': token,
            'subject_issuer': 'google'
        })
    }

    return fetch(urlKcToken, options)
        .then((res: Response) => {
            if (res.status !== 200) {
                console.log('KcLoginWithToken: ', res.status + ' ' + res.statusText)
                throw new Error('not ok')
            }
            return res.json()
        })
        .catch((err) => {
            console.log('KcLoginWithToken error: ', err.message)
            return null
        })
}

export async function kcRefreshToken(token: string): Promise<KCApiExchangeToken | null> {
    const options: RequestInit = {
        cache: 'no-store',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'client_id': process.env.KEYCLOAK_CLIENT_ID as string,
            'client_secret': process.env.KEYCLOAK_CLIENT_SECRET as string,
            'grant_type': 'refresh_token',
            'refresh_token': token,
        })
    }
    return fetch(urlKcToken, options)
        .then((res: Response) => {
            if (!res.ok) {
                throw new Error('not ok')
            }
            return res.json()
        })
        .catch((err) => {
            console.log('kcRefreshToken error: ', err)
            return null
        })
}

export async function kcLoginWithCreds(username: string, password: string): Promise<KCApiExchangeToken | null> {
    const options: RequestInit = {
        cache: 'no-store',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'client_id': process.env.KEYCLOAK_CLIENT_ID as string,
            'client_secret': process.env.KEYCLOAK_CLIENT_SECRET as string,
            'grant_type': 'password',
            'username': username,
            'password': password,
        })
    }
    return fetch(urlKcToken, options)
        .then((res: Response) => {
            if (!res.ok) {
                throw new Error('not ok')
            }
            return res.json()
        })
        .catch((err) => {
            console.log('kcLoginWithCreds error: ', err)
            return null
        })
}

export async function kcGetAdminAccessToken(): Promise<string | null> {
    const options: RequestInit = {
        cache: 'no-store',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'client_id': process.env.KEYCLOAK_ADMIN_ID as string,
            'client_secret': process.env.KEYCLOAK_ADMIN_SECRET as string,
            'grant_type': 'client_credentials',
        })
    }
    return fetch(urlKcToken, options)
        .then((res: Response) => {
            if (!res.ok) {
                throw new Error('not ok')
            }
            return res.json()
        })
        .then((data) => {
            const typed = data! as KCApiExchangeToken
            return typed.access_token
        })
        .catch((err) => {
            console.log('kcGetAdminToken: ', err)
            return null
        })
}

export async function kcCreateUser(adminToken: string, username: string, password: string, phone: string = '', locale: string = 'en', country: string = 'hn'): Promise<boolean> {
    const options: RequestInit = {
        cache: 'no-store',
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': 'Bearer ' + adminToken,
        },
        body: JSON.stringify({
            'username': username,
            'email': username,
            'emailVerified': false,
            'enabled': true,
            'credentials': [{
                'temporary': false,
                'type': 'password',
                'value': password
            }],
            'attributes': {
                'phone': phone,
                'lang': locale,
                'country': country,
            }
        })
    }
    return fetch(urlKcUsers, options)
        .then((res: Response) => {
            return res.ok
        })
        .catch((err) => {
            console.log('kcCreateUser error: ', err)
            return false
        })
}

export async function kcUpdateUser(adminToken: string, userId: string, userRepresentation: KCUserRepresentation): Promise<boolean> {
    const options: RequestInit = {
        cache: 'no-store',
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': 'Bearer ' + adminToken,
        },
        body: JSON.stringify(
            userRepresentation,
        )
    }
    return fetch(urlKcUsers + '/' + userId, options)
        .then((res: Response) => {
            return res.ok
        })
        .catch((err) => {
            console.log('kcUpdateUser error: ', err)
            return false
        })
}

export async function kcGetUserById(adminToken: string, userId: string): Promise<KCUserRepresentation | null> {
    const options: RequestInit = {
        cache: 'no-store',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': 'Bearer ' + adminToken,
        }
    }
    return fetch(urlKcUsers + '/' + userId, options)
        .then((res: Response) => {
            if (!res.ok) {
                throw new Error('not ok')
            }
            return res.json()
        })
        .then((data) => {
            //console.log('kcGetUserById success: ', data)
            return data as KCUserRepresentation
        })
        .catch((err) => {
            console.log('kcGetUserById error: ', err)
            return null
        })
}

export async function kcGetUserByUsername(username: string, adminToken: string): Promise<Array<KCUserRepresentation> | null> {
    const options: RequestInit = {
        cache: 'no-store',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': 'Bearer ' + adminToken,
        }
    }
    return fetch(urlKcUsers + '/?exact=true&email=' + username, options)
        .then((res: Response) => {
            if (!res.ok) {
                throw new Error('not ok')
            }
            return res.json()
        })
        .then((data) => {
            //console.log('kcGetUserByUsername success: ', data)
            return data as Array<KCUserRepresentation>
        })
        .catch((err) => {
            console.log('kcGetUserByUsername error: ', err)
            return null
        })
}

export async function kcGetUserSocials(userid: string, adminToken: string): Promise<Array<KCFederatedIdentityRepresentation> | null> {
    const options: RequestInit = {
        cache: 'no-store',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': 'Bearer ' + adminToken,
        }
    }
    return fetch(urlKcUsers + userid + '/federated-identity', options)
        .then((res: Response) => {
            if (!res.ok) {
                throw new Error('not ok')
            }
            return res.json()
        })
        .then((data) => {
            //console.log('kcGetUserSocials success: ', data)
            return data as Array<KCFederatedIdentityRepresentation>
        })
        .catch((err) => {
            console.log('kcGetUserSocials error: ', err)
            return null
        })
}

export async function kcAddSocial({
                                      email,
                                      provider = 'google',
                                      rep
                                  }: {
    email: string
    provider: string
    rep: { [index: string]: string }
}): Promise<boolean> {
    const adminToken = await kcGetAdminAccessToken()
    if (!adminToken) return false

    const search = await kcGetUserByUsername(email, adminToken)
    if (!search || search.length !== 1) {
        console.log('User not found')
        return false
    }

    console.log('User exists on KC')
    const found: KCUserRepresentation = search[0]
    console.log('Found user representation: ', found.id)
    const checkIDP: KCFederatedIdentityRepresentation[] | null = await kcGetUserSocials(found.id!, adminToken)

    console.log('Check IDP: ', checkIDP)
    if (checkIDP && checkIDP.length > 0) {
        for (let step = 0; step < checkIDP.length; step++) {
            if (checkIDP[step].identityProvider && checkIDP[step].identityProvider === provider) {
                console.log('Already have ' + provider + ' linked')
                return false
            }
        }
    }
    const options: RequestInit = {
        cache: 'no-store',
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken,
        },
        body: JSON.stringify(rep)
    }

    return fetch(urlKcUsers + found.id + '/federated-identity/' + provider, options)
        .then((res: Response) => {
            if (!(res.status == 204)) {
                console.log('kcAddSocial: ', res.status + ' ' + res.statusText)
                throw new Error('not ok')
            }
            return kcUpdateUser(
                adminToken,
                found.id!,
                {
                    'email': email,
                    'emailVerified': true,
                })
        }) //Set email as verified as we believe Google at this point
        .catch((err) => {
            console.log('kcAddSocial error: ', err)
            return false
        })
}

export async function kcSendServiceEmail({
                                             email,
                                             reason
                                         }: {
    email: string
    reason: string
}): Promise<boolean> {
    const adminToken = await kcGetAdminAccessToken()
    if (!adminToken) return false
    console.log('kcSendServiceEmail got admin token')

    const search: Array<KCUserRepresentation> | null = await kcGetUserByUsername(email, adminToken)
    console.log('kcSendServiceEmail searched user: ', search)

    if (!search || search.length !== 1) return false

    console.log('User exists on KC')
    const found: KCUserRepresentation = search[0]
    const options: RequestInit = {
        cache: 'no-store',
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': 'Bearer ' + adminToken,
        },
        body: JSON.stringify([
            reason,
        ])
    }
    return fetch(urlKcUsers + '/' + found.id + '/execute-actions-email', options)
        .then((res: Response) => {
            console.log('kcServiceEmail: ', res.status + ' ' + res.statusText)
            return res.ok
        })
        .catch((err) => {
            console.log('kcServiceEmail error: ', err)
            return false
        })
}


export async function redLoginOrSignupWithToken(token: string): Promise<number | null> {
    const options: RequestInit = {
        cache: 'no-store',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({
            'site': process.env.SITE_ID
        })
    }
    return fetch(process.env.REDREPORT_URL + '/api/kc/check', options)
        .then((res: Response) => {
            console.log('redLoginOrSignupWithToken: ', res.status)
            return res.json()
        })
        .then((data) => {
            //console.log('redLoginOrSignupWithToken success: ', data)
            return parseInt(data)
        })
        .catch((err) => {
            console.log('redLoginOrSignupWithToken error: ', err)
            return null
        })
}

export async function redGetUserByCreds(username: string, password = ''): Promise<number | null> {
    let body = {
        'username': username,
        'site': process.env.SITE_ID,
    }
    if (password !== '') body = Object.assign(body, {
        'password': password
    })

    const options: RequestInit = {
        cache: 'no-store',
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': 'Bearer ' + process.env.REDREPORT_TOKEN,
        },
        body: JSON.stringify({
            body
        })
    }
    return fetch(process.env.REDREPORT_URL + '/api/usercheck', options)
        .then((res: Response) => {
            console.log('redGetUserByCreds: ', res.status)
            if (!res.ok) return null
            return res.json()
        })
        .then((data) => {
            if (!data || parseInt(data) == 0) return null
            console.log('redGetUserByCreds success: ', data)
            return parseInt(data)
        })
        .catch((err) => {
            console.log('redGetUserByCreds error: ', err)
            return null
        })
}

export async function registerUser({
                                       username,
                                       password,
                                       phone,
                                       locale = 'en'
                                   }: {
    username: string
    password: string
    phone: string
    locale: string
}) {
    const adminToken = await kcGetAdminAccessToken()
    if (!adminToken) return null

    console.log('Look for user on Kc')
    const search: Array<KCUserRepresentation> | null = await kcGetUserByUsername(username, adminToken)
    if (search && search.length > 0) {
        console.log('User already exists on KC')
        return {error: 'user_exist'}
    }

    console.log('Look for user on Red')
    const red = await redGetUserByCreds(username)
    if (red && red !== 0) {
        console.log('User already exists on Red')
        return {error: 'user_exist'}
    }

    console.log('Let us register user')
    const country = await geoip()
    const create = await kcCreateUser(adminToken, username, password, phone, locale, country)
    if (!create) return {error: 'unknown'}

    console.log('User created on KC')
    const mail = await kcSendServiceEmail({
        email: username,
        reason: 'VERIFY_EMAIL'
    })
    if (mail) return {error: 'email_verify_sent'}
    //But it won't be able to log in until verify email
    //it's enough as Red users are created automatically on successful login via KC
    return {error: 'unknown'}
}
