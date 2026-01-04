import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextRequest } from 'next/server'

// Create the next-intl middleware
const intlMiddleware = createMiddleware(routing)

export default function proxy(request: NextRequest) {
  // Handle internationalization with next-intl
  // Auth validation is done in pages/routes using BetterAuth's useSession or getSession
  return intlMiddleware(request)
}

export const config = {
  // Exclude auth-related paths to prevent infinite redirects
  matcher: [
    // Apply middleware to all routes except the ones specified
    '/((?!api/auth|_next/static|_next/image|favicon.ico|icon.png).*)'
  ],
}
