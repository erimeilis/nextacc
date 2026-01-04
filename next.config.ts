import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
    output: 'standalone',

    experimental: {
        serverActions: {
            bodySizeLimit: '50mb',
        },
    },

    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'red.telecomax.net',
                pathname: '/payment-methods/**',
            },
        ],
    },
}

export default withNextIntl(nextConfig)
