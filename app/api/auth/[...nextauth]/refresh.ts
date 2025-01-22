import {JWT} from 'next-auth/jwt'

export async function refreshAccessToken(token: JWT) {
    const details = {
        /* eslint-disable camelcase */
        client_id: process.env.KEYCLOAK_CLIENT_ID,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
    }
    const formBody: string[] = []
    Object.entries(details).forEach(([key, value]) => {
        const encodedKey = encodeURIComponent(key)
        const encodedValue = encodeURIComponent(value as string)
        formBody.push(`${encodedKey}=${encodedValue}`)
    })
    const formData = formBody.join('&')
    const url = process.env.KEYCLOAK_REALM + '/protocol/openid-connect/token'

    //console.log('Sending refresh request to:', url)
    //console.log('Request body:', formData)


    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
    })

    const refreshedTokens = await response.json()

    //console.log('Refresh token response:', refreshedTokens)

    if (!response.ok) {
        //console.log('Failed to refresh token:', refreshedTokens)
        throw refreshedTokens
    }
    return {
        ...token,
        accessToken: refreshedTokens.access_token,
        idToken: refreshedTokens.id_token,
        expiresAt: Math.floor(Date.now() / 1000) + refreshedTokens.expires_in,
        refreshed: refreshedTokens.refresh_token,
    }
}