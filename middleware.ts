import createMiddleware from 'next-intl/middleware'
import {routing} from './i18n/routing'
import {NextRequest, NextResponse} from 'next/server'
import NextAuth from 'next-auth'
import {authConfig} from './auth.config' // You'll need to create this file

// Initialize Auth.js with your config
const { auth } = NextAuth(authConfig)

// Create a custom middleware function that combines next-auth and next-intl middleware
// and filters out the callbackUrl parameter from the URL
const intlMiddleware = createMiddleware(routing)

// First middleware to handle callbackUrl parameter removal
const removeCallbackUrlMiddleware = async (request: NextRequest) => {
    // Get the original URL
    const url = request.nextUrl.clone()

    // Check if the URL has a callbackUrl parameter
    if (url.searchParams.has('callbackUrl')) {
        // Remove the callbackUrl parameter
        url.searchParams.delete('callbackUrl')

        // Return a redirect response to the URL without the callbackUrl parameter
        return NextResponse.redirect(url)
    }

    // If there's no callbackUrl parameter, proceed to the next middleware
    return intlMiddleware(request)
}

// Wrap the middleware with next-auth authentication
export default auth(async function middleware(request) {
    // Pass to our middleware for processing
    return removeCallbackUrlMiddleware(request)
})

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|icon.png).*)'],
}