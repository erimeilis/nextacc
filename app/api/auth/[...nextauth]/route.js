import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import {jwtDecode} from "jwt-decode"
import NextAuth from "next-auth"
import {kcAddSocial, kcCreateUser, kcCreds, kcGetAdminToken, kcToken, redCreds, redToken} from "./restRequests"
import axios from "axios";

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
                            phone: access_token.phone,
                            access_token: res.access_token,
                            maxAge: credentials.rememberMe === 'true' ? 30 * 24 * 60 * 60 : 24 * 60 * 60
                        }
                    } catch (error) {
                        if (axios.isAxiosError(error)) {
                            console.log('kcCreds ' + error.status)
                            if (error.response && error.response.status === 401) { //User not found on KC
                                try {
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
                                                        console.log('kcCreds2 ' + error.status)
                                                        //console.error(error.response)
                                                    } else {
                                                        console.error(error)
                                                    }
                                                }
                                            }
                                        } catch (error) {
                                            if (axios.isAxiosError(error)) {
                                                console.log('kcGetAdminToken->kcCreateUser ' + error.status)
                                                //console.error(error.response)
                                            } else {
                                                console.error(error)
                                            }
                                        }
                                    }
                                } catch (error) {
                                    if (axios.isAxiosError(error)) {
                                        console.log('redCreds ' + error.status)
                                        //console.error(error.response)
                                    } else {
                                        console.error(error)
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
            //console.log({account, user})
            if (account && account.provider === 'google') {
                try {
                    const res = await kcToken(account.access_token) //First try KC
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
                        console.log('kcToken ' + error.status)
                        console.log(error.response.data.error_description)
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
                                        const res = await kcToken(account.access_token) //Second try KC
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