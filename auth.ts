import NextAuth, {Account, Profile, User} from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import {kcAddSocial, kcCreateUser, kcExists, kcGetAdminToken, kcLoginCreds, kcLoginToken, kcUpdateUser, redExists} from '@/app/api/auth/[...nextauth]/restRequests'
import {UserRepresentation} from '@/app/api/types/UserRepresentation'
import {jwtDecode} from 'jwt-decode'
import {KCApiAccessToken} from '@/app/api/types/KCApiAccessToken'
import {getLocale} from 'next-intl/server'
import {geoip} from '@/app/[locale]/utils/geoip'
import qs from 'querystring'
import {headers} from 'next/headers'
import {refreshAccessToken} from '@/app/api/auth/[...nextauth]/refresh'
import {AdapterUser} from '@auth/core/adapters'

declare module 'next-auth' {
    interface User {
        username?: string,
        phone?: string,
        access_token: string,
        refresh_token: string,
        maxAge?: number
    }

    interface Session {
        token: string,
        error: string
    }
}
declare module 'next-auth/jwt' {
    /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
    interface JWT {
        /** OpenID ID Token */
        accessToken: string,
        accessTokenExpires: number,
        refreshToken: string,
    }
}

export const {handlers, signIn, signOut, auth} = NextAuth({
    pages: {
        signIn: '/',
        error: '/'
    },
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
        CredentialsProvider({
            id: 'kccreds',
            name: 'KC',
            credentials: {
                username: {label: 'Email', type: 'text', placeholder: 'name@example.com'},
                password: {label: 'Password', type: 'password'},
                rememberMe: {label: 'Remember Me', type: 'boolean'}
            },
            async authorize(credentials: Partial<Record<'username' | 'password' | 'rememberMe', unknown>>): Promise<User | null> {
                const username = credentials.username as string
                const password = credentials.password as string
                const rememberMe = credentials.rememberMe as boolean

                if (credentials && credentials.username && credentials.password) {
                    const adminToken = await kcGetAdminToken() //Get Admin token on KC
                    const search: Array<UserRepresentation> = await kcExists(username, adminToken)
                    if (search && search.length === 1) {
                        console.log('User exists on KC')
                        const found: UserRepresentation = search[0]
                        if (!found.emailVerified) throw new Error('email_unverified')
                        const kcApiToken = await kcLoginCreds(username, password)
                        if (kcApiToken) {
                            const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60
                            const access_token = jwtDecode(kcApiToken.access_token) as KCApiAccessToken
                            console.log('Success login ', access_token)
                            return {
                                id: access_token.jti,
                                email: access_token.email,
                                username: access_token.email,
                                phone: access_token.phone,
                                access_token: kcApiToken.access_token,
                                refresh_token: kcApiToken.refresh_token,
                                maxAge: maxAge
                            }
                        } else {
                            return null
                        }

                    } else {
                        console.log('No such user on KC')
                        const search = await redExists(username) //Check if user exist on Red
                        if (search && search !== -1) { //User exists as we've got ID
                            const req = await redExists(username, password) //Check if user exist on Red and creds are right
                            if (req && req !== -1) { //User exists and creds are ok as we've got ID
                                const adminToken = await kcGetAdminToken() //Get Admin token on KC
                                const locale = await getLocale()
                                const res = await kcCreateUser(adminToken, username, password, '', locale) //Create user on KC
                                if (res === 201) { //Success
                                    const kcApiToken = await kcLoginCreds(username, password) //Second try KC
                                    if (kcApiToken) {
                                        const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60
                                        const access_token = jwtDecode(kcApiToken.access_token) as KCApiAccessToken
                                        console.log('Success login ', access_token)
                                        return {
                                            id: access_token.jti,
                                            email: access_token.email,
                                            username: access_token.email,
                                            access_token: kcApiToken.access_token,
                                            refresh_token: kcApiToken.refresh_token,
                                            maxAge: maxAge
                                        }
                                    } else {
                                        return null
                                    }
                                }
                            } else { //No user with this creds on Red
                                console.log('Bad credentials')
                                throw new Error('bad_credentials')
                            }
                        } else {
                            console.log('No such user on Red')
                            console.log('User not found')
                            throw new Error('no_user')
                        }
                    }
                }
                return null
            }
        })
    ],
    callbacks: {
        async signIn(params: {
            user: User | AdapterUser,
            account: Account | null,
            profile?: Profile | undefined,
            email?: {
                verificationRequest?: boolean | undefined
            } | undefined,
        }): Promise<string | boolean> {

            if (!params.account || params.account.provider !== 'google') return true

            let kcUser = await kcLoginToken(params.account.access_token!) //First try KC
            if (kcUser) {
                const access_token = jwtDecode(kcUser.access_token) as KCApiAccessToken
                if (!access_token.email_verified) { //this is just for newbies
                    const country = await geoip()
                    const headersList = await headers()
                    const cookies = headersList.get('cookie')
                    const cookiesObj = qs.decode(cookies!, '; ')
                    const lang = cookiesObj.NEXT_LOCALE
                    const adminToken = await kcGetAdminToken() //Get Admin token on KC
                    const attributes = {
                        'phone': '',
                        'telegram': '',
                        'lang': lang,
                        'country': country,
                    }
                    await kcUpdateUser(
                        adminToken,
                        access_token.sub,
                        {
                            'email': params.user.email!,
                            'emailVerified': true,
                            'attributes': attributes
                        }
                    ) //Set email as verified as we believe Google at this point
                    kcUser = await kcLoginToken(params.account.access_token!) //Second login KC to get token with verified email
                }
                params.user.access_token = kcUser!.access_token
                params.user.refresh_token = kcUser!.refresh_token
                //user.id = req.id
            } else {
                const addSoc = await kcAddSocial({
                    email: params.user.email!,
                    provider: 'google',
                })
                if (addSoc) {
                    const kcUser = await kcLoginToken(params.account.access_token!) //Second try KC
                    params.user.access_token = kcUser!.access_token
                    params.user.refresh_token = kcUser!.refresh_token
                    //user.id = req.id
                }
            }
            return false
        },
        async jwt({token, user}) {
            if (user) {
                return {
                    accessToken: user.access_token,
                    accessTokenExpires: Date.now() + 200 * 1000,
                    refreshToken: user.refresh_token,
                    user,
                }
            }
            if (Date.now() < token.accessTokenExpires) {
                // token has not expired yet, return it
                return token
            }
            const refreshedToken = await refreshAccessToken(token)
            console.log('Token is refreshed.')
            return refreshedToken
        },
        async session({session, token}) {
            // Send properties to the client
            if (token) {
                session.token = token.accessToken
            }
            return session
        },
    }
})