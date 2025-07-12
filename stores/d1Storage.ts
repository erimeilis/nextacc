// D1 Storage adapter for Zustand persist middleware
// This adapter provides the same interface as idbStorage.ts but uses Cloudflare D1 instead of IndexedDB
// with fallback to IndexedDB when D1 is unavailable

import { idbStorage } from './idbStorage'
import { StorageValue } from 'zustand/middleware'

// Define the base URL for the Cloudflare Worker
const D1_WORKER_URL = process.env.NEXT_PUBLIC_D1_WORKER_URL

// Helper function to handle D1 API requests with fallback to IndexedDB
const handleD1Request = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'DELETE',
  key: string,
  value?: unknown
): Promise<T | null> => {
  if (!D1_WORKER_URL) {
    console.warn('D1_WORKER_URL not defined, falling back to IndexedDB')
    return fallbackToIdb<T>(key, method, value)
  }

  try {
    const url = new URL(`${D1_WORKER_URL}/${endpoint}`)
    url.searchParams.append('key', key)

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    if (value !== undefined && method === 'POST') {
      options.body = JSON.stringify(value)
    }

    const response = await fetch(url.toString(), options)

    if (!response.ok) {
      console.warn(`D1 request failed: ${response.statusText}`)
      return fallbackToIdb<T>(key, method, value)
    }

    if (method === 'DELETE') {
      return null
    }

    const data = await response.json()
    return data.value
  } catch (error) {
    console.warn(`D1 ${method} operation failed, falling back to IndexedDB:`, error)
    return fallbackToIdb<T>(key, method, value)
  }
}

// Helper function to handle fallback to IndexedDB
const fallbackToIdb = async <T>(
  key: string,
  method: 'GET' | 'POST' | 'DELETE',
  value?: unknown
): Promise<T | null> => {
  switch (method) {
    case 'GET':
      return idbStorage.getItem(key) as Promise<T | null>
    case 'POST':
      await idbStorage.setItem(key, value)
      return null
    case 'DELETE':
      await idbStorage.removeItem(key)
      return null
    default:
      return null
  }
}

// D1 storage adapter implementation with proper typing for Zustand persist middleware
export const d1Storage = {
  getItem: async <T>(key: string): Promise<StorageValue<T> | null> => {
    return handleD1Request<StorageValue<T>>('get', 'GET', key)
  },
  setItem: async <T>(key: string, value: StorageValue<T>): Promise<void> => {
    await handleD1Request('set', 'POST', key, value)
  },
  removeItem: async (key: string): Promise<void> => {
    await handleD1Request('remove', 'DELETE', key)
  },
}
