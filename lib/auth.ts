import { betterAuth } from 'better-auth'
import { anonymous } from 'better-auth/plugins'
import { adjectives, animals, colors, uniqueNamesGenerator, type Config } from 'unique-names-generator'

const nameConfig: Config = {
    dictionaries: [adjectives, colors, animals],
    separator: '-',
    length: 3,
}

export const auth = betterAuth({
    trustedOrigins: [
        process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    ],

    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            prompt: 'select_account',
        },
    },

    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5, // 5 minutes
        },
    },

    plugins: [
        anonymous({
            emailDomainName: 'anonymous.user',
            generateName: () => uniqueNamesGenerator(nameConfig),
        }),
    ],
})

export type Session = typeof auth.$Infer.Session
