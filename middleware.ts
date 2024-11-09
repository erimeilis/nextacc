import {NextRequest} from 'next/server'
import createMiddleware from 'next-intl/middleware'
import {routing} from './i18n/routing'

export {auth} from '@/auth'

const handleI18nRouting = createMiddleware(routing)

export default function middleware(request: NextRequest) {
    //console.log('Nextrequest ', request)
    const {pathname} = request.nextUrl

    const shouldHandle =
        pathname === '/' ||
        new RegExp(`^/(${routing.locales.join('|')})(/.*)?$`).test(
            request.nextUrl.pathname
        )
    if (!shouldHandle) return

    const response = handleI18nRouting(request)
    // Add new request headers
    //response.headers.append('request-ip', request.ip ?? '')
    response.headers.append('request-url', request.url)
    //response.headers.append('request-geo', JSON.stringify(request.geo))
    return response
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}