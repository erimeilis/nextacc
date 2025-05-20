'use server'

// A simple in-memory cache implementation
const cache = new Map<string, { data: unknown; timestamp: number }>()

interface FetchCacheOptions {
    ttl?: number; // Time to live in milliseconds
    method?: string;
    headers?: HeadersInit;
    body?: string | URLSearchParams;
}

/**
 * Fetch with caching capability
 * @param url The URL to fetch
 * @param options Options including cache TTL and fetch options
 * @returns The response data
 */
export async function fetchWithCache<T = unknown>(url: string, options: FetchCacheOptions = {}): Promise<T> {
    const {ttl, ...fetchOptions} = options
    const method = fetchOptions.method || 'GET'

    // Create a cache key based on the URL and request body
    const cacheKey = `${method}:${url}:${fetchOptions.body || ''}`

    // Check if we have a valid cached response
    const cachedResponse = cache.get(cacheKey)
    if (cachedResponse && ttl) {
        const now = Date.now()
        if (now - cachedResponse.timestamp < ttl) {
            return cachedResponse.data as T
        }
        // Cache expired, remove it
        cache.delete(cacheKey)
    }

    // Make the actual fetch request
    const response = await fetch(url, {
        method,
        ...fetchOptions,
    })

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
    }

    // Parse the response
    const data = await response.json()

    // Cache the response if TTL is provided
    if (ttl) {
        cache.set(cacheKey, {
            data,
            timestamp: Date.now(),
        })
    }

    return data as T
}