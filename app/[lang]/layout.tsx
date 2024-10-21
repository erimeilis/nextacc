import type {Metadata} from "next"
import localFont from "next/font/local"
import "./globals.css"
import Navbar from "@/app/[lang]/components/Navbar"
import {AuthProvider} from "./AuthProvider"
import {getDictionary} from "@/get-dictionary"
import {i18n, type Locale} from "@/i18n-config"
import DictionaryProvider from "@/app/[lang]/DictionaryProvider"
import {StyleProvider} from "@/app/[lang]/StyleProvider";
import React from "react";

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
                                             profile,
                                             params,
                                         }: {
    children: React.ReactNode
    profile: React.ReactNode
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
                    <main className="flex items-center justify-center px-4 pt-32 pb-96 bg-white dark:bg-indigo-900">
                        <div className="sm:w-full md:w-3/4 lg:w-1/2 max-w-4xl">
                            {profile}
                            {children}
                        </div>
                    </main>
                </DictionaryProvider>
            </StyleProvider>
            </body>
            </html>
        </AuthProvider>
)
}