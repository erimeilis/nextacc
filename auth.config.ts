// auth.config.ts
import type {NextAuthConfig} from 'next-auth'

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/',
    error: '/'
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  trustHost: true,
  providers: [
    {
      id: 'anonymous',
      name: 'Anonymous',
      type: 'credentials',
      credentials: {},
      authorize: async () => {
        return {
          id: 'anonymous-user',
          access_token: '',
          refresh_token: '',
          expires_in: 0,
          provider: 'anonymous'
        };
      },
    },
    {
      id: 'google',
      name: 'Google',
      type: 'oauth',
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        url: "https://accounts.google.com/o/oauth2/v2/auth",
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      issuer: "https://accounts.google.com",
      token: "https://oauth2.googleapis.com/token",
    },
    {
      id: 'kccreds',
      name: 'KC',
      type: 'credentials',
      credentials: {
        username: {label: 'Email', type: 'text', placeholder: 'name@example.com'},
        password: {label: 'Password', type: 'password'},
        rememberMe: {label: 'Remember Me', type: 'boolean'}
      },
      authorize: async () => {
        // Implement your authentication logic here
        // Return null if authentication fails
        // to Return a user object if authentication succeeds
        return null;
      },
    }
  ],
  callbacks: {
    authorized() {
      return true
    },
  },
}
