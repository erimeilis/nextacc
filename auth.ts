import NextAuth, {Account, AuthError, Profile, Session, User} from 'next-auth'
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
import {headers} from 'next/headers'
import {AdapterSession, AdapterUser} from '@auth/core/adapters'
import {KCApiExchangeToken} from '@/types/KCApiExchangeToken'
import {refreshAccessToken} from '@/app/api/auth/[...nextauth]/refresh'
import {v4 as uuidv4} from 'uuid'
import {adjectives, animals, colors, Config, uniqueNamesGenerator} from 'unique-names-generator'
import {JWT} from 'next-auth/jwt'
// Custom cookie parser function instead of using 'querystring' which is not supported in Edge Runtime
const parseCookies = (cookieString: string, separator: string = '; '): Record<string, string> => {
    const cookies: Record<string, string> = {}
    if (!cookieString) return cookies

    cookieString.split(separator).forEach(cookie => {
        const [name, value] = cookie.split('=')
        if (name && value) {
            cookies[name.trim()] = decodeURIComponent(value.trim())
        }
    })

    return cookies
}

declare module 'next-auth' {
    interface User {
        username?: string,
        phone?: string,
        access_token: string,
        refresh_token: string,
        expires_in: number,
        maxAge?: number,
        error?: string,
        provider: string
    }
}

declare module 'next-auth' {
    interface Session {
        token: string,
        error: string,
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
        signIn: '',
        error: '',
        signOut: '',
        verifyRequest: '',
        newUser: ''

    },
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: 'jwt',
    },
    trustHost: true,
    providers: [
        CredentialsProvider({
            id: 'anonymous',
            name: 'Anonymous',
            credentials: {},
            async authorize() {
                return await createAnonymousUser() as User
            },
        }),
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
                                provider: 'keycloak',
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

                        //User exists, and creds are ok as we've got ID
                        //const adminToken = await kcGetAdminToken() //Get Admin token on KC
                        //if (!adminToken) return null

                        const locale = await getLocale()
                        if (await kcCreateUser(adminToken, username, password, '', locale)) { //Create user on KC
                            const kcApiToken = await kcLoginWithCreds(username, password) //Second try KC
                            if (kcApiToken) {
                                const access_token = jwtDecode(kcApiToken.access_token) as KCApiAccessToken
                                const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60
                                return {
                                    provider: 'keycloak',
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
            account?: Account | null,  // Added '?' to make it optional
            profile?: Profile | undefined,
            email?: {
                verificationRequest?: boolean | undefined
            } | undefined,
        }): Promise<boolean> {
            if (params.user.error) {
                console.log('catch error on callback')
                throw new AuthError(params.user.error)
            }
            if (params.user.provider === 'anonymous') return true
            if (!params.account || params.account.provider !== 'google') return true
            if (!params.account.access_token) return false

            // The Rest of your function remains the same
            const email = params.user.email!

            const adminToken = await kcGetAdminAccessToken() //Get Admin token on KC
            if (!adminToken) return false

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
                    const cookiesObj = parseCookies(cookies!, '; ')
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
        async jwt({token, user}: { token: JWT, user: User | AdapterUser | null }): Promise<JWT> {
            //console.log('jwt -> ', token, user)
            if (user) {
                return {
                    ...token,
                    accessToken: user.access_token,
                    accessTokenExpires: Date.now() + user.expires_in * 1000,
                    refreshToken: user.refresh_token,
                    user,
                }
            }
            if (Date.now() < token.accessTokenExpires - 1000) {
                // the token has not expired yet, return it
                return token
            }
            //console.log('🐥')
            return await refreshAccessToken(token)
        },
        async session({session, token}: { session: Session, token: JWT | null }) {
            // Send properties to the client
            if (token) {
                session.token = token.accessToken
                session.user = token.user as AdapterUser
            }
            return session
        }
    },
    events: {
        async signIn({user, account}: { user: User, account?: Account | null, profile?: Profile }): Promise<void> {
            console.log(`signIn of ${user.name} from ${user?.provider || account?.provider}`)
        },
        async signOut({token}: { session?: void | AdapterSession | null | undefined, token?: JWT & { user?: User } | null }): Promise<void> {
            if (token?.user) {
                console.log(`signOut of ${token.user.name} from ${token.user.provider}`)
            }
        },
    },
})

const createAnonymousUser = async () => {
    const nameConfig: Config = {
        dictionaries: [adjectives, colors, animals],
        separator: '-',
        length: 3,
    }
    const randomName = uniqueNamesGenerator(nameConfig)
    return {
        id: uuidv4(),
        name: randomName,
        email: `${randomName}@anonymous.user`,
        image: null,
        access_token: 'anonymous_token',
        refresh_token: 'anonymous_refresh',
        expires_in: 86400, // 24 hours
        provider: 'anonymous',
    }
}