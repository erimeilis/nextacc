import type {Metadata} from "next"
import localFont from "next/font/local"
import "./globals.css"
import Navbar from "@/app/[lang]/components/Navbar"
import {AuthProvider} from "./AuthProvider"
import {getDictionary} from "@/get-dictionary"
import {i18n, type Locale} from "@/i18n-config"
import DictionaryProvider from "@/app/[lang]/DictionaryProvider"
import {StyleProvider} from "@/app/[lang]/StyleProvider";

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
})
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
})

export const metadata: Metadata = {
    title: "Next Acc",
    description: "New version on next.js",
}

export async function generateStaticParams() {
    return i18n.locales.map((locale) => ({lang: locale}))
}

export default async function RootLayout({
                                             children,
                                             params,
                                         }: {
    children: React.ReactNode
    params: { lang: Locale }
}) {
    const dictionary = await getDictionary(params.lang)
    return (
        <AuthProvider>
            <html lang={params.lang} suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
            <StyleProvider>
                <Navbar loc={params.lang}/>
                <DictionaryProvider dictionary={dictionary}>
                    {children}
                </DictionaryProvider>
            </StyleProvider>
            </body>
            </html>
        </AuthProvider>
    )
}