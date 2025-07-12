// D1 Storage adapter for Zustand persist middleware
// This adapter provides the same interface as idbStorage.ts but uses Cloudflare D1 instead of IndexedDB
// with fallback to IndexedDB when D1 is unavailable

import {idbStorage} from '@/stores/idbStorage'

// Define the base URL for the Cloudflare Worker
const D1_WORKER_URL = process.env.NEXT_PUBLIC_D1_WORKER_URL || 'https://your-worker-url.workers.dev'

// Circuit breaker implementation to avoid repeated calls to failing D1 service
class CircuitBreaker {
    private failures: number = 0;
    private lastFailureTime: number = 0;
    private readonly maxFailures: number = 3;
    private readonly resetTimeoutMs: number = 60000; // 1 minute
    private isClosed: boolean = true;

    constructor() {
        // Check if we have a stored state in localStorage
        if (typeof window !== 'undefined') {
            const storedState = localStorage.getItem('d1CircuitBreakerState');
            if (storedState) {
                const state = JSON.parse(storedState);
                this.failures = state.failures;
                this.lastFailureTime = state.lastFailureTime;
                this.isClosed = state.isClosed;
            }
        }
    }

    private saveState() {
        if (typeof window !== 'undefined') {
            localStorage.setItem('d1CircuitBreakerState', JSON.stringify({
                failures: this.failures,
                lastFailureTime: this.lastFailureTime,
                isClosed: this.isClosed
            }));
        }
    }

    public recordSuccess() {
        if (!this.isClosed) {
            // If circuit was open but we got a success, close it
            this.isClosed = true;
            this.failures = 0;
            this.saveState();
            console.log('D1 circuit breaker closed - service is working again');
        }
    }

    public recordFailure() {
        this.failures++;
        this.lastFailureTime = Date.now();

        if (this.failures >= this.maxFailures) {
            this.isClosed = false;
            console.log(`D1 circuit breaker opened after ${this.failures} failures - temporarily disabling D1 storage`);
        }

        this.saveState();
    }

    public canTryD1(): boolean {
        // If circuit is closed, we can try D1
        if (this.isClosed) {
            return true;
        }

        // If circuit is open but enough time has passed, allow a test request
        const timeElapsed = Date.now() - this.lastFailureTime;
        if (timeElapsed > this.resetTimeoutMs) {
            console.log('D1 circuit breaker allowing test request after timeout');
            return true;
        }

        return false;
    }
}

// Create a singleton instance of the circuit breaker
const circuitBreaker = new CircuitBreaker();

// Helper function to make requests to the Cloudflare Worker
async function fetchFromWorker(method: string, key?: string, value?: unknown) {
    // Check if we should even try to use D1
    if (!circuitBreaker.canTryD1()) {
        console.log('D1 circuit breaker is open, skipping D1 request');
        throw new Error('D1 service temporarily disabled due to repeated failures');
    }

    try {
        const url = new URL(D1_WORKER_URL)
        url.searchParams.append('method', method)
        if (key) {
            url.searchParams.append('key', key)
        }

        const options: RequestInit = {
            method: method === 'getItem' ? 'GET' : 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        }

        // For setItem, include the value in the request body
        if (method === 'setItem' && value !== undefined) {
            options.body = JSON.stringify({value})
        }

        const response = await fetch(url.toString(), options)

        if (!response.ok) {
            circuitBreaker.recordFailure();
            throw new Error(`D1 storage operation failed: ${response.statusText}`)
        }

        // Record success to potentially close the circuit breaker
        circuitBreaker.recordSuccess();

        // For getItem, return the value from the response
        if (method === 'getItem') {
            const data = await response.json()
            return data.value
        }

        return null
    } catch (error) {
        console.error('D1 storage error:', error)
        // Record failure for the circuit breaker
        circuitBreaker.recordFailure();
        throw error // Re-throw the error to be caught by the fallback mechanism
    }
}

// D1 storage adapter implementation with IndexedDB fallback
export const d1Storage = {
    getItem: async (key: string) => {
        try {
            // Try to get from D1
            const result = await fetchFromWorker('getItem', key)
            // If result is null or undefined, fall back to IndexedDB
            if (result === null || result === undefined) {
                console.log('D1 storage returned null/undefined, falling back to IndexedDB')
                return idbStorage.getItem(key)
            }
            return result
        } catch (error) {
            console.error('D1 storage error, falling back to IndexedDB:', error)
            // Fall back to IndexedDB
            return idbStorage.getItem(key)
        }
    },

    setItem: async (key: string, value: unknown) => {
        try {
            // Try to set in D1
            const result = await fetchFromWorker('setItem', key, value)
            // If there's any issue with the D1 operation, fall back to IndexedDB
            if (result === null) {
                console.log('D1 storage setItem operation may have failed, falling back to IndexedDB')
                await idbStorage.setItem(key, value)
            }
        } catch (error) {
            console.error('D1 storage error, falling back to IndexedDB:', error)
            // Fall back to IndexedDB
            await idbStorage.setItem(key, value)
        }
    },

    removeItem: async (key: string) => {
        try {
            // Try to remove from D1
            const result = await fetchFromWorker('removeItem', key)
            // If there's any issue with the D1 operation, fall back to IndexedDB
            if (result === null) {
                console.log('D1 storage removeItem operation may have failed, falling back to IndexedDB')
                await idbStorage.removeItem(key)
            }
        } catch (error) {
            console.error('D1 storage error, falling back to IndexedDB:', error)
            // Fall back to IndexedDB
            await idbStorage.removeItem(key)
        }
    },
}
