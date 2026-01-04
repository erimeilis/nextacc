import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    {
        rules: {
            '@next/next/no-img-element': 'off',
            // React Compiler rules - downgraded to warnings during migration
            // TODO: Fix these patterns and upgrade back to errors
            'react-hooks/set-state-in-effect': 'warn',
            'react-hooks/preserve-manual-memoization': 'warn',
            'react-hooks/error-boundaries': 'warn',
        },
    },
    globalIgnores([
        '.next/**',
        'out/**',
        'build/**',
        'next-env.d.ts',
        'node_modules/**',
    ]),
])

export default eslintConfig
