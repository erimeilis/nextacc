// Create this file at /app/fonts.ts
import {Ubuntu} from 'next/font/google'

export const ubuntu = Ubuntu({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin', 'cyrillic'],
    display: 'swap',
    variable: '--font-ubuntu', // This creates a CSS variable
})