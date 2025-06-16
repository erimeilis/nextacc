//'use server'
import '@/app/[locale]/globals.css'
import {AuthProvider} from '@/providers/AuthProvider'
import React from 'react'
import {routing} from '@/i18n/routing'
import {notFound} from 'next/navigation'
import {getMessages} from 'next-intl/server'
import {NextIntlClientProvider} from 'next-intl'
import {ThemeProvider} from 'next-themes'
import dynamic from 'next/dynamic'
import {Metadata} from 'next'
import {Toaster} from '@/components/ui/Toaster'
import {ubuntu} from '@/app/fonts' // Import from the font file

// Dynamically import a Nav component to reduce the initial bundle size
const Nav = dynamic(() => import('@/components/nav/Nav'), {
    ssr: true,
    loading: () => <div className="h-16"></div> // Simple placeholder while loading
})

export const metadata: Metadata = {
    title: 'NextAcc',
}

export default async function RootLayout(
    props: {
        dashboard: React.ReactNode,
        offers: React.ReactNode,
        params: Promise<{ locale: string }>
    }
) {
    const params = await props.params

    const {
        locale
    } = params

    const {
        dashboard,
        offers
    } = props

    if (!routing.locales.includes(locale as never)) {
        notFound()
    }

    // Get messages
    // Using the revalidate option for caching instead of 'cache'
    const messages = await getMessages({
        locale
    })

    return (
        <html lang={locale} suppressHydrationWarning className={`${ubuntu.variable}`}>
        <head>
            <title>NextAcc</title>
            <link rel="icon" href="/icon.png" type="image/png"/>
            <script dangerouslySetInnerHTML={{
                __html: `
                (function() {
                  // Apply dark/light theme
                  try {
                    const theme = localStorage.getItem('theme');
                    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                      document.documentElement.classList.add('dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                    }

                    // Apply color theme
                    const colorThemeStr = localStorage.getItem('state:color-theme');
                    if (colorThemeStr) {
                      const colorTheme = JSON.parse(colorThemeStr);
                      const colorThemes = ['equinox', 'reef'];
                      document.documentElement.classList.remove(...colorThemes);
                      document.documentElement.classList.add(colorTheme);
                    }
                  } catch (e) {
                    console.error('Error applying theme:', e);
                  }
                })();
              `
            }}/>
        </head>
        <body className={`${ubuntu.className} bg-background text-foreground border-border overflow-hidden h-screen`}>
        <ThemeProvider
            attribute="class"
            disableTransitionOnChange={true}
            storageKey="theme"
            defaultTheme="system"
        >
            <AuthProvider>
                <NextIntlClientProvider messages={messages}>
                    <Nav/>
                    <div className="h-full overflow-y-auto pt-0 pb-16 sm:pt-16 sm:pb-0">
                        <main className="flex items-center justify-center px-0 sm:px-2 pb-0">
                            <div className="flex flex-col w-full sm:w-full md:w-5/6 lg:w-3/4 max-w-4xl gap-1 sm:gap-4">
                                {offers}
                                {dashboard}
                            </div>
                        </main>
                    </div>
                </NextIntlClientProvider>
            </AuthProvider>
            <Toaster/>
        </ThemeProvider>
        </body>
        </html>
    )
}
