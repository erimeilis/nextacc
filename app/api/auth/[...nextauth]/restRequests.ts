'use server'
import {KCApiExchangeToken} from '@/app/api/types/KCApiExchangeToken'
import {UserRepresentation} from '@/app/api/types/UserRepresentation'
import {geoip} from '@/app/[locale]/utils/geoip'

const urlKcToken: string = process.env.KEYCLOAK_REALM + '/protocol/openid-connect/token'
const urlKcUsers: string = process.env.KEYCLOAK_ADMIN_REALM + '/users'

export async function kcLoginToken(token: string): Promise<KCApiExchangeToken | null> {
    const options: RequestInit = {
        cache: 'no-store',
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
        },
        body: JSON.stringify({
            'client_id': process.env.KEYCLOAK_CLIENT_ID,
            'client_secret': process.env.KEYCLOAK_CLIENT_SECRET,
            'grant_type': 'urn:ietf:params:oauth:grant-type:token-exchange',
            'subject_token_type': 'urn:ietf:params:oauth:token-type:access_token',
            'subject_token': token,
            'subject_issuer': 'google',
        })
    }
    fetch(urlKcToken, options)
        .then((res) => {
            if (!res.ok) {
                throw Error(`kcLoginToken error: ${res.status} \n ${res.statusText}`)
            }
            res.json()
        })
        .then((data) => {
            console.log('KcLoginToken success:', data)
            return data
        })
    return null
}

export async function kcRefreshToken(token: string) {
    const options: RequestInit = {
        cache: 'no-store',
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
        },
        body: JSON.stringify({
            'client_id': process.env.KEYCLOAK_CLIENT_ID,
            'client_secret': process.env.KEYCLOAK_CLIENT_SECRET,
            'grant_type': 'refresh_token',
            'refresh_token': token,
        })
    }
    fetch(urlKcToken, options)
        .then((res) => {
            if (!res.ok) {
                throw Error(`kcRefreshToken error: ${res.status} \n ${res.statusText}`)
            }
            res.json()
        })
        .then((data) => {
            console.log('KcRefreshToken success:', data)
            return data
        })
}

export async function kcLoginCreds(username: string, password: string): Promise<KCApiExchangeToken | null> {
    const options: RequestInit = {
        cache: 'no-store',
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
        },
        body: JSON.stringify({
            'client_id': process.env.KEYCLOAK_CLIENT_ID,
            'client_secret': process.env.KEYCLOAK_CLIENT_SECRET,
            'grant_type': 'password',
            'username': username,
            'password': password,
        })
    }
    fetch(urlKcToken, options)
        .then(res => {
            if (!res.ok) {
                throw Error(`kcLoginCreds error: ${res.status} \n ${res.statusText}`)
            }
            res.json()
        })
        .then((data) => {
            console.log('KcLoginCreds success:', data)
            return data
        })
    return null
}

export async function kcGetAdminToken(): Promise<string> {
    const options: RequestInit = {
        cache: 'no-store',
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
        },
        body: JSON.stringify({
            'client_id': process.env.KEYCLOAK_ADMIN_ID,
            'client_secret': process.env.KEYCLOAK_ADMIN_SECRET,
            'grant_type': 'client_credentials',
        })
    }
    fetch(urlKcToken, options)
        .then(res => {
            if (!res.ok) {
                throw Error(`kcGetAdminToken error: ${res.status} \n ${res.statusText}`)
            }
            res.json()
        })
        .then((data) => {
            console.log('KcGetAdminToken success:', data)
            const typed = data! as KCApiExchangeToken
            return typed.access_token
        })
    return ''
}

export async function kcCreateUser(adminToken: string, username: string, password: string, phone: string = '', locale: string = 'en', country: string = 'hn'): Promise<number> {
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
    fetch(urlKcUsers, options)
        .then(res => {
            if (!res.ok) {
                throw Error(`kcCreateUser error: ${res.status} \n ${res.statusText}`)
            }
            console.log('KcCreateUser success:', res.status)
            return res.status
        })
    return 0
}

export async function kcUpdateUser(adminToken: string, userId: string, userRepresentation: UserRepresentation) {
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
    fetch(urlKcUsers + '/' + userId, options)
        .then(res => {
            if (!res.ok) {
                throw Error(`kcUpdateUser error: ${res.status} \n ${res.statusText}`)
            }
            return true
        })
}

export async function kcGetUser(adminToken: string, userId: string) {
    const options: RequestInit = {
        cache: 'no-store',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': 'Bearer ' + adminToken,
        }
    }
    fetch(urlKcUsers + '/' + userId, options)
        .then(res => {
            if (!res.ok) {
                throw Error(`kcGetUser error: ${res.status} \n ${res.statusText}`)
            }
            res.json()
        })
        .then((data) => {
            console.log('KcGetUser success:', data)
            return data
        })
}

export async function kcExists(username: string, adminToken: string): Promise<Array<UserRepresentation>> {
    const options: RequestInit = {
        cache: 'no-store',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': 'Bearer ' + adminToken,
        }
    }
    fetch(urlKcUsers + '/' + '/users?exact=true&email=' + username, options)
        .then(res => {
            if (!res.ok) {
                throw Error(`kcExists error: ${res.status} \n ${res.statusText}`)
            }
            res.json()
        })
        .then((data) => {
            console.log('KcExists success:', data)
            return data! as Array<UserRepresentation>
        })
    return []
}

export async function kcAddSocial({
                                      email,
                                      provider = 'google'
                                  }: {
    email: string
    provider: string
}) {
    const adminToken = await kcGetAdminToken()
    const search: Array<UserRepresentation> = await kcExists(email, adminToken)
    if (!search || search.length !== 1) return false

    console.log('User already exists on KC')
    const found: UserRepresentation = search[0]
    const options: RequestInit = {
        cache: 'no-store',
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': 'Bearer ' + adminToken,
        }
    }
    fetch(urlKcUsers + '/' + found.id + '/federated-identity/' + provider, options)
        .then(async res => {
            if (!res.ok) {
                throw Error(`kcAddSocial error: ${res.status} \n ${res.statusText}`)
            }
            await kcUpdateUser(
                adminToken,
                found.id!,
                {
                    'email': email,
                    'emailVerified': true,
                }
            ) //Set email as verified as we believe Google at this point
            return true
        })
    return false
}

export async function kcEmail({
                                  email,
                                  reason
                              }: {
    email: string
    reason: string
}) {
    const adminToken = await kcGetAdminToken()
    const search: Array<UserRepresentation> = await kcExists(email, adminToken)
    if (!search || search.length !== 1) return false

    console.log('User already exists on KC')
    const found: UserRepresentation = search[0]
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
    fetch(urlKcUsers + '/' + found.id + '/execute-actions-email', options)
        .then(res => {
            if (!res.ok) {
                throw Error(`kcEmail error: ${res.status} \n ${res.statusText}`)
            }
            return true
        })
}


export async function redLoginToken(token: string) {
    const options: RequestInit = {
        cache: 'no-store',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': 'Bearer ' + token,
        }
    }
    fetch(process.env.REDREPORT_URL + '/api/kc/userinfo?site=' + process.env.SITE_ID, options)
        .then(res => {
            if (!res.ok) {
                throw Error(`kcExists error: ${res.status} \n ${res.statusText}`)
            }
            return res.status
        })
}

export async function redExists(username: string, password = ''): Promise<number> {
    const pass = (password !== '') ? ('&password=' + password) : ''
    const options: RequestInit = {
        cache: 'no-store',
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': 'Bearer ' + process.env.REDREPORT_TOKEN,
        },
        body: JSON.stringify({
            'username': username,
            'site': process.env.SITE_ID,
            'password': pass
        })
    }
    fetch(process.env.REDREPORT_URL + '/api/kc/userinfo?site=' + process.env.SITE_ID, options)
        .then(res => {
            if (!res.ok) {
                throw Error(`kcExists error: ${res.status} \n ${res.statusText}`)
            }
            res.json()
        })
        .then((data) => {
            console.log('KcExists success:', data)
            return parseInt(data!)
        })
    return -1
}

export async function registerUser(username: string, password: string, phone: string, locale = 'en') {
    const adminToken = await kcGetAdminToken()
    const search: Array<UserRepresentation> = await kcExists(username, adminToken)
    if (search.length > 0) {
        console.log('User already exists on KC')
        return {error: 'user_exist'}
    }
    console.log('Look for user on Red')
    const red = await redExists(username)
    if (!isNaN(red) && isFinite(red) && red !== 0) {
        console.log('User already exists on Red')
        return {error: 'user_exist'}
    }
    console.log('Let us register user')
    const country = await geoip()
    const kc = await kcCreateUser(adminToken, username, password, phone, locale, country)
    if (kc === 201) { //Success
        console.log('User created on KC')
        await kcEmail({
            email: username,
            reason: 'VERIFY_EMAIL'
        })
        return {error: 'email_verify_sent'}
        //But it won't be able to login until verify email
        //it's enough as Red users are created automatically on successful login via KC
    }
}