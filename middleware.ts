import createMiddleware from 'next-intl/middleware'
import {routing} from './i18n/routing'
import {auth} from './auth'
import {NextRequest} from 'next/server'

// Create the next-intl middleware
const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // First, check authentication with next-auth if needed,
  // We're not using the response directly as next-auth v5 handles auth via middleware
  await auth()

  // Then, handle internationalization with next-intl
  return intlMiddleware(request)
}

export const config = {
  // Exclude auth-related paths to prevent infinite redirects as per NextAuth.js documentation
  matcher: [
    // Apply middleware to all routes except the ones specified
    '/((?!api/auth|_next/static|_next/image|favicon.ico|icon.png).*)'
  ],
}
