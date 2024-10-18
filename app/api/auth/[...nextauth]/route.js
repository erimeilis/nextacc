import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import {jwtDecode} from "jwt-decode"
import axios from 'axios'
import NextAuth from "next-auth"

async function kcToken(token) {
    const response = await axios.post(
        process.env.KEYCLOAK_REALM + '/protocol/openid-connect/token',
        'client_id=' + process.env.KEYCLOAK_CLIENT_ID +
        '&client_secret=' + process.env.KEYCLOAK_CLIENT_SECRET +
        '&grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Atoken-exchange' +
        '&subject_token_type=urn%3Aietf%3Aparams%3Aoauth%3Atoken-type%3Aaccess_token' +
        '&subject_token=' + token +
        '&subject_issuer=google',
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    )
    return response.data
}
async function kcCreds(username, password) {
    const response = await axios.post(
        process.env.KEYCLOAK_REALM + '/protocol/openid-connect/token',
        'client_id=' + process.env.KEYCLOAK_CLIENT_ID +
        '&client_secret=' + process.env.KEYCLOAK_CLIENT_SECRET +
        '&grant_type=password' +
        '&username=' + username +
        '&password=' + password,
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    )
    return response.data
}
async function kcGetAdminToken () {
    const response = await axios.post(
        process.env.KEYCLOAK_REALM + '/protocol/openid-connect/token',
        'client_id=' + process.env.KEYCLOAK_ADMIN_ID +
        '&client_secret=' + process.env.KEYCLOAK_ADMIN_SECRET +
        '&grant_type=client_credentials',
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    )
    return response.data.access_token
}
async function kcCreateUser(username, password, adminToken) {
    const request = await axios.post(
        process.env.KEYCLOAK_ADMIN_REALM + '/users',
        {
            'username': username,
            'email': username,
            'emailVerified': true,
            'enabled': true,
            'credentials': [{
                'temporary': false,
                'type': 'password',
                'value': password
            }]
        },
        {
            headers: {
                'Authorization': 'Bearer ' + adminToken,
            }
        }
    );
    return request.status
}
async function redToken(token) {
    const response = await axios.get(
        process.env.REDREPORT_URL + '/api/kc/userinfo?site=' + process.env.SITE_ID,
        {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + token,
            }
        }
    )
    return response.data
}
async function redCreds(username, password) {
    const response = await axios.post(
        process.env.REDREPORT_URL + '/api/usercheck',
        'username=' + username +
        '&password=' + password +
        '&site=' + process.env.SITE_ID,
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + process.env.REDREPORT_TOKEN,
            }
        }
    )
    return response.data
}

const handler = NextAuth({
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/',
        error: '/'
    },
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        CredentialsProvider({
            id: 'kccreds',
            name: "KC",
            credentials: {
                username: {label: "Email", type: "text", placeholder: "name@example.com"},
                password: {label: "Password", type: "password"},
                rememberMe: {label: "Remember Me", type: "boolean"}
            },
            async authorize(credentials) {
                if (credentials && credentials.username && credentials.password) {
                    try {
                        const res = await kcCreds(credentials.username, credentials.password) //First try KC
                        const access_token = jwtDecode(res.access_token)
                        return {
                            id: access_token.jti,
                            email: access_token.email,
                            username: access_token.email,
                            access_token: res.access_token,
                            maxAge: credentials.rememberMe === 'true' ? 30 * 24 * 60 * 60 : 24 * 60 * 60
                        }
                    } catch (error) {
                        if (axios.isAxiosError(error)) {
                            console.log(error.status)
                            if (error.response && error.response.status === 401) { //User not found on KC
                                const req = await redCreds(credentials.username, credentials.password) //Check if user exist on Red
                                if (!isNaN(parseFloat(req)) && isFinite(req)) { //User exists as we've got ID
                                    try {
                                        const adminToken = await kcGetAdminToken() //Get Admin token on KC
                                        const res = await kcCreateUser(credentials.username, credentials.password, adminToken) //Create user on KC
                                        if (res === 201) { //Success
                                            try {
                                                const res = await kcCreds(credentials.username, credentials.password) //Second try KC
                                                const maxAge = credentials.rememberMe === 'true' ? 30 * 24 * 60 * 60 : 24 * 60 * 60
                                                const access_token = jwtDecode(res.access_token)
                                                return {
                                                    id: access_token.jti,
                                                    email: access_token.email,
                                                    username: access_token.email,
                                                    access_token: res.access_token,
                                                    maxAge: maxAge
                                                }
                                            } catch (error) {
                                                if (axios.isAxiosError(error)) {
                                                    console.log(error.status)
                                                    console.error(error.response)
                                                } else {
                                                    console.error(error)
                                                }
                                            }
                                        }
                                    } catch (error) {
                                        if (axios.isAxiosError(error)) {
                                            console.log(error.status)
                                            console.error(error.response)
                                        } else {
                                            console.error(error)
                                        }
                                    }
                                }
                            }
                        } else {
                            console.error(error)
                        }
                    }
                }
                return null
            }
        })
    ],
    callbacks: {
        async signIn({user, account}) {
            if (account && account.provider === 'google') {
                try {
                    const res = await kcToken(account.access_token);
                    try {
                        const req = await redToken(res.access_token)
                        console.log(req);
                        user.access_token = res.access_token
                        user.id = req
                        //user.maxAge = 30 * 24 * 60 * 60
                    } catch (error) {
                        if (axios.isAxiosError(error)) {
                            console.log(error.status)
                            console.error(error.response)
                            // Do something with this error...
                        } else {
                            console.error(error)
                        }
                    }
                } catch (error) {
                    if (axios.isAxiosError(error)) {
                        console.log(error.status)
                        console.error(error.response)
                        // Do something with this error...
                    } else {
                        console.error(error)
                    }
                }
            } else if (account && account.provider === 'kccreds' && user && user.access_token) {
                try {
                    const req = await redToken(user.access_token)
                    user.access_token = req.access_token
                    user.id = req
                } catch (error) {
                    if (axios.isAxiosError(error)) {
                        console.log(error.status)
                        console.error(error.response)
                        // Do something with this error...
                    } else {
                        console.error(error)
                    }
                }
            }
            return true
        },
        async jwt({token, user}) {
            if (user) {
                token.sub = user.id
                token.accessToken = user.access_token
                token.expires = user.maxAge ?
                    new Date(Date.now() + user.maxAge * 1000).toISOString() :
                    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            }
            return token
        },
        async session({session, token}) {
            if (token) {
                session.user.id = token.sub
                session.accessToken = token.accessToken
                session.expires = token.expires
            }
            return session
        }
    }
})

export {handler as GET, handler as POST}