import {del, get, set} from 'idb-keyval'

const isBrowser = typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined'

export const idbStorage = {
    getItem: async (key: string) => {
        if (!isBrowser) return null
        const value = await get(key)
        return value ?? null
    },
    setItem: async (key: string, value: unknown) => {
        if (!isBrowser) return
        await set(key, value)
    },
    removeItem: async (key: string) => {
        if (!isBrowser) return
        await del(key)
    },
}