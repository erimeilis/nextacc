import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import {jwtDecode} from "jwt-decode"
import axios from 'axios'
import NextAuth from "next-auth"

const handler = NextAuth({
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/',
        error: '/'
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        CredentialsProvider({
            name: "KC",
            credentials: {
                username: {label: "Email", type: "text", placeholder: "name@example.com"},
                password: {label: "Password", type: "password"},
                rememberMe: {label: "Remember Me", type: "boolean"}
            },
            async authorize(credentials) {
                if (credentials && credentials.username && credentials.password) {
                    try {
                        const response = await axios.post(
                            process.env.KEYCLOAK_REALM + '/protocol/openid-connect/token',
                            'client_id=' + process.env.KEYCLOAK_CLIENT_ID +
                            '&client_secret=' + process.env.KEYCLOAK_CLIENT_SECRET +
                            '&grant_type=password' +
                            '&username=' + credentials.username +
                            '&password=' + credentials.password,
                            {
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded'
                                }
                            }
                        )
                        const maxAge = credentials.rememberMe === 'true' ? 30 * 24 * 60 * 60 : 24 * 60 * 60
                        const access_token = jwtDecode(response.data.access_token)
                        return {
                            id: access_token.jti,
                            email: access_token.email,
                            username: access_token.email,
                            access_token: response.data.access_token,
                            maxAge: maxAge
                        }
                    } catch (error) {
                        if (axios.isAxiosError(error)) {
                            console.log(error.status)
                            //console.error(error.response)
                            if (error.response && error.response.status === 401) {
                                const request = await axios.post(
                                    process.env.REDREPORT_URL + '/api/usercheck',
                                    'username=' + credentials.username +
                                    '&password=' + credentials.password +
                                    '&site=' + process.env.SITE_ID,
                                    {
                                        headers: {
                                            'Content-Type': 'application/x-www-form-urlencoded',
                                            //'Content-Type': 'application/json',
                                            'Accept': 'application/json',
                                            'Authorization': 'Bearer ' + process.env.REDREPORT_TOKEN,
                                        }
                                    }
                                )
                                console.log(request.data);
                                if (!isNaN(parseFloat(request.data)) && isFinite(request.data)) {
                                    try {
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
                                        console.log(response.data.access_token)
                                        const request = await axios.post(
                                            process.env.KEYCLOAK_ADMIN_REALM + '/users',
                                            {
                                                'username': credentials.username,
                                                'email': credentials.username,
                                                'emailVerified': true,
                                                'enabled': true,
                                                'credentials': [{
                                                    'temporary': false,
                                                    'type': 'password',
                                                    'value': credentials.password
                                                }]
                                            },
                                            {
                                                headers: {
                                                    'Authorization': 'Bearer ' + response.data.access_token,
                                                }
                                            }
                                        );
                                        console.log(request.status);
                                        if (request.status === 201) {
                                            try {
                                                const response = await axios.post(
                                                    process.env.KEYCLOAK_REALM + '/protocol/openid-connect/token',
                                                    'client_id=' + process.env.KEYCLOAK_CLIENT_ID +
                                                    '&client_secret=' + process.env.KEYCLOAK_CLIENT_SECRET +
                                                    '&grant_type=password' +
                                                    '&username=' + credentials.username +
                                                    '&password=' + credentials.password,
                                                    {
                                                        headers: {
                                                            'Content-Type': 'application/x-www-form-urlencoded'
                                                        }
                                                    }
                                                )
                                                const maxAge = credentials.rememberMe === 'true' ? 30 * 24 * 60 * 60 : 24 * 60 * 60
                                                const access_token = jwtDecode(response.data.access_token)
                                                return {
                                                    id: access_token.jti,
                                                    email: access_token.email,
                                                    username: access_token.email,
                                                    access_token: response.data.access_token,
                                                    maxAge: maxAge
                                                }
                                            } catch (error) {
                                                if (axios.isAxiosError(error)) {
                                                    console.log(error.status)
                                                    console.error(error.response)
                                                }else {
                                                    console.error(error)
                                                }
                                            }
                                        }
                                    } catch (error) {
                                        if (axios.isAxiosError(error)) {
                                            console.log(error.status)
                                            console.error(error.response)
                                        }else {
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
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async signIn({account, user}) {
            //console.log({account, user})
            if (account && account.provider === 'google') {
                try {
                    const response = await axios.post(
                        process.env.KEYCLOAK_REALM + '/protocol/openid-connect/token',
                        'client_id=' + process.env.KEYCLOAK_CLIENT_ID +
                        '&client_secret=' + process.env.KEYCLOAK_CLIENT_SECRET +
                        '&grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Atoken-exchange' +
                        '&subject_token_type=urn%3Aietf%3Aparams%3Aoauth%3Atoken-type%3Aaccess_token' +
                        '&subject_token=' + account.access_token +
                        '&subject_issuer=google',
                        {
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }
                        }
                    );
                    //console.log(response.data);
                    try {
                        const request = await axios.get(
                            process.env.REDREPORT_URL + '/api/kc/userinfo?site=' + process.env.SITE_ID,
                            {
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json',
                                    'Authorization': 'Bearer ' + response.data.access_token,
                                }
                            }
                        );
                        console.log(request.data)
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
            } else if (account && account.provider === 'credentials' && user && user.access_token) {
                try {
                    const request = await axios.get(
                        process.env.REDREPORT_URL + '/api/kc/userinfo?site=' + process.env.SITE_ID,
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                'Authorization': 'Bearer ' + user.access_token,
                            }
                        }
                    );
                    console.log(request.data)
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
        /*jwt: ({token, user, account})=> {
            console.log({token, user, account})
            if (account) {
                token.access_token = account.access_token
            }
            return token
        },
        session({ session, token, user }) {
            console.log({session, token, user})
            return session
        }*/
        async session({session, token}) {
            if (token) {
                session.user.id = token.sub
                session.user.username = token["username"]
                if (token["maxAge"]) {
                    session.maxAge = token["maxAge"]
                    session.expires = new Date(Date.now() + session.maxAge * 1000).toISOString()
                    console.log(session.expires);
                } // Use maxAge from token
                return session
            }
            return session
        },
        async jwt({token, user}) {
            if (user) {
                token.sub = user.id
                token["username"] = user.username
                if (user.maxAge) token["maxAge"] = user.maxAge
            }
            return token
        },
    },
})

export {handler as GET, handler as POST}