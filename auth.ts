import NextAuth, {Account, AuthError, Profile, User} from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import {
    kcAddSocial,
    kcCreateUser,
    kcGetAdminAccessToken,
    kcGetUserByUsername,
    kcLoginWithCreds,
    kcLoginWithToken,
    kcUpdateUser,
    redGetUserByCreds
} from '@/app/api/auth/[...nextauth]/requests'
import {KCUserRepresentation} from '@/types/KCUserRepresentation'
import {jwtDecode} from 'jwt-decode'
import {KCApiAccessToken} from '@/types/KCApiAccessToken'
import {getLocale} from 'next-intl/server'
import {geoip} from '@/utils/geoip'
import qs from 'querystring'
import {headers} from 'next/headers'
import {AdapterUser} from '@auth/core/adapters'
import {KCApiExchangeToken} from '@/types/KCApiExchangeToken'
import {refreshAccessToken} from '@/app/api/auth/[...nextauth]/refresh'

declare module 'next-auth' {
    interface User {
        username?: string,
        phone?: string,
        access_token: string,
        refresh_token: string,
        expires_in: number,
        maxAge?: number
        error?: string
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
                    const adminToken = await kcGetAdminAccessToken() //Get Admin token on KC
                    if (!adminToken) return null

                    const kcSearch: Array<KCUserRepresentation> | null = await kcGetUserByUsername(username, adminToken)
                    if (kcSearch && kcSearch.length === 1) {
                        console.log('User exists on KC')
                        const found: KCUserRepresentation = kcSearch[0]
                        if (!found.emailVerified) throw new Error('email_unverified')

                        const kcApiToken = await kcLoginWithCreds(username, password)
                        if (kcApiToken) {
                            const access_token = jwtDecode(kcApiToken.access_token) as KCApiAccessToken
                            const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60
                            return {
                                id: access_token.jti,
                                email: access_token.email,
                                username: access_token.email,
                                phone: access_token.phone,
                                access_token: kcApiToken.access_token,
                                refresh_token: kcApiToken.refresh_token,
                                maxAge: maxAge
                            } as User
                        } else {
                            return null
                        }

                    } else {
                        console.log('No such user on KC')
                        let redSearch = await redGetUserByCreds(username) //Check if user exist on Red
                        if (!redSearch) {
                            console.log('No such user on Red')
                            console.log('User not found')
                            return {
                                error: 'no_user'
                            } as User
                            //throw new AuthError('no_user')
                        }
                        redSearch = await redGetUserByCreds(username, password) //Check if user exist on Red and creds are right
                        if (!redSearch) {
                            console.log('Bad credentials')
                            return {
                                error: 'bad_credentials'
                            } as User
                            //throw new AuthError('bad_credentials')
                        }

                        //User exists and creds are ok as we've got ID
                        //const adminToken = await kcGetAdminToken() //Get Admin token on KC
                        //if (!adminToken) return null

                        const locale = await getLocale()
                        if (await kcCreateUser(adminToken, username, password, '', locale)) { //Create user on KC
                            const kcApiToken = await kcLoginWithCreds(username, password) //Second try KC
                            if (kcApiToken) {
                                const access_token = jwtDecode(kcApiToken.access_token) as KCApiAccessToken
                                const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60
                                return {
                                    id: access_token.jti,
                                    email: access_token.email,
                                    username: access_token.email,
                                    access_token: kcApiToken.access_token,
                                    refresh_token: kcApiToken.refresh_token,
                                    maxAge: maxAge
                                } as User
                            }
                        }
                    }
                } else {
                    console.log('Bad credentials')
                    return {
                        error: 'bad_credentials'
                    } as User
                    //throw new AuthError('bad_credentials')
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
        }): Promise<boolean> {
            if (params.user.error) {
                console.log('catch error on callback')
                throw new AuthError(params.user.error)
            }
            if (!params.account || params.account.provider !== 'google') return true
            if (!params.account.access_token) return false

            const adminToken = await kcGetAdminAccessToken() //Get Admin token on KC
            if (!adminToken) return false

            const email = params.user.email!
            console.log('Try to add social to ' + email)

            const addsocial = await kcAddSocial({
                email: email,
                provider: 'google',
                rep: {
                    identityProvider: 'google',
                    userId: params.user.id!,
                    userName: params.user.name!
                }
            })
            if (addsocial) console.log('Social added, log in KC')

            const accessToken: string = params.account.access_token
            let kcApiToken: KCApiExchangeToken | null = await kcLoginWithToken(accessToken) //First try KC

            if (kcApiToken) { //login successfull
                console.log('Logged in KC')
                const access_token = jwtDecode(kcApiToken.access_token) as KCApiAccessToken
                console.log(access_token)

                if (!access_token.email_verified) { //this is just for newbies
                    console.log('let us make email verified, as it is google')
                    const country = await geoip()
                    const headersList = await headers()
                    const cookies = headersList.get('cookie')
                    const cookiesObj = qs.decode(cookies!, '; ')
                    const lang = cookiesObj.NEXT_LOCALE
                    const adminToken = await kcGetAdminAccessToken() //Get Admin token on KC
                    if (!adminToken) return false

                    const attributes = {
                        'phone': '',
                        'telegram': '',
                        'lang': lang,
                        'country': country,
                    }

                    const update = await kcUpdateUser(
                        adminToken,
                        access_token.sub,
                        {
                            'email': params.user.email!,
                            'emailVerified': true, //Set email as verified as we believe Google at this point
                            'attributes': attributes
                        }
                    )
                    if (!update) {
                        console.log('update unsuccessful')
                        return false
                    }
                    kcApiToken = await kcLoginWithToken(accessToken) //Second login KC to get token with verified email
                    if (!kcApiToken) {
                        console.log('cannot login second time')
                        return false
                    }
                }
                params.user.access_token = kcApiToken.access_token
                params.user.refresh_token = kcApiToken.refresh_token
                params.user.expires_in = kcApiToken.expires_in
                return true
            }
            return false
        },
        async jwt({token, user}) {
            if (user) {
                const newToken = {
                    accessToken: user.access_token,
                    accessTokenExpires: Date.now() + user.expires_in * 1000,
                    refreshToken: user.refresh_token,
                    user,
                }
                //console.log(newToken)
                return newToken
            }
            if (Date.now() < token.accessTokenExpires - 1000) {
                // token has not expired yet, return it
                return token
            }
            const refreshedToken = await refreshAccessToken(token)
            console.log('🐥')
            return refreshedToken
        },
        async session({session, token}) {
            // console.log({session, token})
            // Send properties to the client
            if (token) {
                session.token = token.accessToken
                session.user = token.user as AdapterUser
            }
            return session
        },
    }
})