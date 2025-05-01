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
import SWRProvider from '@/providers/SWRProvider'

// Dynamically import Nav component to reduce initial bundle size
const Nav = dynamic(() => import('@/components/service/Nav'), {
  ssr: true,
  loading: () => <div className="h-16"></div> // Simple placeholder while loading
})

export const metadata: Metadata = {
  title: 'NextAcc',
}

// This function generates a script that will be included in the HTML head
// It immediately sets the correct theme based on localStorage before any content renders
function ThemeScript() {
  return (
    <>
      {/* Add the meta tag for color-scheme to tell browsers about our color scheme */}
      <meta name="color-scheme" content="dark light" />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                // Block theme transitions until page is loaded
                document.documentElement.style.setProperty('transition', 'none');
                
                // Get color theme from localStorage
                var colorTheme = localStorage.getItem('state:color-theme');
                colorTheme = colorTheme ? JSON.parse(colorTheme) : 'blue';
                
                // Get dark mode setting from localStorage
                var isDarkMode = localStorage.getItem('state:dark-mode');
                isDarkMode = isDarkMode ? JSON.parse(isDarkMode) : true;
                
                // Apply the themes immediately to prevent flash
                var root = document.documentElement;
                
                // First add the color theme
                var colorThemes = ['blue', 'pink', 'orange', 'teal', 'violet'];
                colorThemes.forEach(function(theme) {
                  root.classList.remove(theme);
                });
                root.classList.add(colorTheme);
                
                // Then add dark mode if needed
                if (isDarkMode) {
                  root.classList.add('dark');
                  document.querySelector('meta[name="color-scheme"]').setAttribute('content', 'dark');
                } else {
                  root.classList.remove('dark');
                  document.querySelector('meta[name="color-scheme"]').setAttribute('content', 'light');
                }
                
                // Re-enable transitions after page load
                window.addEventListener('load', function() {
                  // Remove the transition blocking after a small delay to ensure everything is rendered
                  setTimeout(function() {
                    document.documentElement.style.removeProperty('transition');
                  }, 100);
                });
              } catch (e) {
                console.error('Error applying theme:', e);
              }
            })();
          `,
        }}
      />
    </>
  );
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
        <html lang={locale} suppressHydrationWarning>
        <head>
            <title>NextAcc</title>
            <link rel="icon" href="/icon.png" type="image/png" />
            <ThemeScript />
        </head>
        <body className="bg-background text-foreground">
        <ThemeProvider 
          attribute="class" 
          defaultTheme="dark" 
          enableSystem={true}
          disableTransitionOnChange={true}
          storageKey="theme"
        >
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
