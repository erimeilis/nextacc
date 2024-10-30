import axios from 'axios'
import {jwtDecode} from 'jwt-decode'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import {getLocale} from 'next-intl/server'
import {string} from 'zod'
import {kcAddSocial, kcCreateUser, kcExists, kcGetAdminToken, kcGetUser, kcLoginCreds, kcLoginToken, kcUpdateUser, redExists, redLoginToken} from './restRequests'

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
            authorization: {
                params: {
                    prompt: 'consent',
                    access_type: 'offline',
                    response_type: 'code',
                    lang: string
                }
            }
        }),
        CredentialsProvider({
            id: 'kccreds',
            name: 'KC',
            credentials: {
                username: {label: 'Email', type: 'text', placeholder: 'name@example.com'},
                password: {label: 'Password', type: 'password'},
                rememberMe: {label: 'Remember Me', type: 'boolean'}
            },
            async authorize(credentials) {
                if (credentials && credentials.username && credentials.password) {
                    try {
                        const adminToken = await kcGetAdminToken() //Get Admin token on KC
                        const req = await kcExists(credentials.username, adminToken)
                        if (req.length > 0) {
                            console.log('User exists on KC')
                            try {
                                const res = await kcLoginCreds(credentials.username, credentials.password)
                                const access_token = jwtDecode(res.access_token)
                                return {
                                    id: access_token.jti,
                                    email: access_token.email,
                                    username: access_token.email,
                                    phone: access_token.phone,
                                    access_token: res.access_token,
                                    maxAge: credentials.rememberMe === 'true' ? 30 * 24 * 60 * 60 : 24 * 60 * 60
                                }
                            } catch (error) { //Bad credentials
                                if (axios.isAxiosError(error)) {
                                    console.log('kcCreds ' + error.status)
                                    console.log('Bad credentials')
                                    return {error: 'bad_credentials'}
                                } else {
                                    console.error(error)
                                    return {error: error.message}
                                }
                            }
                        } else {
                            console.log('No such user on KC')
                            try {
                                const req = await redExists(credentials.username) //Check if user exist on Red
                                if (!isNaN(parseFloat(req)) && isFinite(req)) { //User exists as we've got ID
                                    try {
                                        const req = await redExists(credentials.username, credentials.password) //Check if user exist on Red and creds are right
                                        if (!isNaN(parseFloat(req)) && isFinite(req)) { //User exists and creds are ok as we've got ID
                                            try {
                                                const adminToken = await kcGetAdminToken() //Get Admin token on KC
                                                const locale = await getLocale()
                                                const res = await kcCreateUser(adminToken, credentials.username, credentials.password, '', locale) //Create user on KC
                                                if (res === 201) { //Success
                                                    try {
                                                        const res = await kcLoginCreds(credentials.username, credentials.password) //Second try KC
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
                                                            console.log('kcCreds2 ' + error.status)
                                                            return {error: error.message}
                                                        } else {
                                                            console.error(error)
                                                            return {error: error.message}
                                                        }
                                                    }
                                                }
                                            } catch (error) {
                                                if (axios.isAxiosError(error)) {
                                                    console.log('kcCreateUser ' + error.status)
                                                    return {error: error.message}
                                                } else {
                                                    console.error(error)
                                                    return {error: error.message}
                                                }
                                            }
                                        } else { //No user with this creds on Red
                                            console.log('Bad credentials')
                                            return {error: 'bad_credentials'}
                                        }
                                    } catch (error) {
                                        if (axios.isAxiosError(error)) {
                                            console.log('redCreds ' + error.status)
                                            return {error: error.message}
                                        } else {
                                            console.error(error)
                                            return {error: error.message}
                                        }
                                    }
                                } else {
                                    console.log('No such user on Red')
                                    console.log('User not found')
                                    return {error: 'no_user'}
                                }
                            } catch (error) {
                                if (axios.isAxiosError(error)) {
                                    console.log('redCreds ' + error.status)
                                    console.log('User not found')
                                    return {error: 'no_user'}
                                } else {
                                    console.error(error)
                                    return {error: error.message}
                                }
                            }
                        }
                    } catch (error) {
                        if (axios.isAxiosError(error)) {
                            console.log('kcExists ' + error.status)
                            return {error: error.message}
                        } else {
                            console.error(error)
                            return {error: error.message}
                        }
                    }
                }
                return null
            }
        })
    ],
    callbacks: {
        async signIn({user, account, credentials}) {
            if (user?.error) {
                throw new Error(user.error)
            }
            if (account && account.provider === 'google') {
                try {
                    let res = await kcLoginToken(account.access_token) //First try KC
                    const access_token = jwtDecode(res.access_token)
                    console.log(' ', credentials)
                    if (access_token.email_verified === false) { //this is just for newbies
                        const adminToken = await kcGetAdminToken() //Get Admin token on KC
                        res = await kcGetUser(adminToken, access_token.sub)
                        try {
                            res = await kcUpdateUser(
                                adminToken,
                                access_token.sub,
                                {
                                    'email': user.email,
                                    'emailVerified': true,
                                    'attributes': {
                                        'phone': '',
                                        'telegram': '',
                                        'lang': lang,
                                    }
                                }
                            ) //Set email as verified as we believe Google at this point
                        } catch (error) {
                            if (axios.isAxiosError(error)) {
                                console.log('kcUpdateUser ' + error.status)
                                console.error(error.response.data.error_description)
                                // Do something with this error...
                            } else {
                                console.error(error)
                            }
                        }
                        res = await kcLoginToken(account.access_token) //Second login KC to get token with verified email
                    }
                    try {
                        const req = await redLoginToken(res.access_token)
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
                        console.log('kcLoginToken ' + error.status)
                        console.log(error)
                        if (error.status === 400
                            && error.response
                            && error.response.data.error_description === 'User already exists') {
                            try {
                                const req = await kcAddSocial({
                                    email: user.email,
                                    provider: 'google',
                                    rep: {
                                        identityProvider: 'google',
                                        userId: user.id,
                                        userName: user.name
                                    }
                                })
                                if (req) {
                                    try {
                                        const res = await kcLoginToken(account.access_token) //Second try KC
                                        try {
                                            const req = await redLoginToken(res.access_token)
                                            console.log(req)
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
                                            console.log('ksToken ' + error.status)
                                            console.error(error.response)
                                            // Do something with this error...
                                        } else {
                                            console.error(error)
                                        }
                                    }
                                }
                            } catch (error) {
                                if (axios.isAxiosError(error)) {
                                    console.log('ksAddSocial ' + error.status)
                                    console.error(error.response)
                                    // Do something with this error...
                                } else {
                                    console.error(error)
                                }
                            }
                        }
                    } else {
                        console.error(error)
                    }
                }
            } else if (account && account.provider === 'kccreds' && user && user.access_token) {
                try {
                    const req = await redLoginToken(user.access_token)
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
            //console.log(token)
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
            //console.log(token)
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