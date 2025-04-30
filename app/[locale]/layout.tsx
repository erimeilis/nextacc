//'use server'
import '@/app/[locale]/globals.css'
import {AuthProvider} from '@/providers/AuthProvider'
import React from 'react'
import {routing} from '@/i18n/routing'
import {notFound} from 'next/navigation'
import {getMessages} from 'next-intl/server'
import {NextIntlClientProvider} from 'next-intl'
import { ThemeProvider } from 'next-themes'
import Nav from '@/components/service/Nav'
import {Metadata} from 'next'
import SWRProvider from '@/providers/SWRProvider'

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
    const messages = await getMessages()

    return (
        <html lang={locale} suppressHydrationWarning>
        <head>
            <title>NextAcc</title>
            <link rel="icon" href="/icon.png" type="image/png" />
        </head>
        <body className="bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SWRProvider>
                <AuthProvider>
                    <NextIntlClientProvider messages={messages}>
                        <Nav/>
                        <main className="flex items-center justify-center px-4 pt-4 pb-96">
                            <div className="flex flex-col sm:w-full md:w-5/6 lg:w-3/4 max-w-4xl gap-4">
                                {offers}
                                {dashboard}
                            </div>
                        </main>
                    </NextIntlClientProvider>
                </AuthProvider>
            </SWRProvider>
        </ThemeProvider>
        </body>
        </html>
    )
}
