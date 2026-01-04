/**
 * Live Data Source
 *
 * Connects to the real backend API for production data.
 * Currently a placeholder - will be implemented when API token migration is complete.
 *
 * TODO: Implement actual API calls when token system is ready
 */

import type { DataSource, ApiResult } from './types'
import type { UserProfile } from '@/types/UserProfile'
import type { MoneyTransaction } from '@/types/MoneyTransaction'
import type { NumberInfo } from '@/types/NumberInfo'
import type { MyNumberInfo } from '@/types/MyNumberInfo'
import type { MyWaitingNumberInfo } from '@/types/MyWaitingNumberInfo'
import type { CartItem } from '@/types/CartItem'
import type { PaymentRegion } from '@/types/PaymentTypes'
import type { CallStatistics, SmsStatistics } from '@/types/Statistics'
import type { UploadInfo } from '@/types/UploadInfo'
import type { Ivr, IvrMusic, IvrEffect, IvrOrder, OrderIvrParams, OrderIvrResponse } from '@/types/IvrTypes'
import type { CountryInfo } from '@/types/CountryInfo'
import type { AreaInfo } from '@/types/AreaInfo'
import type { DiscountInfo } from './types'

// API base URL from environment
const API_BASE_URL = process.env.BACKEND_API_URL || 'https://api.example.com'

// Placeholder for API token (will come from BetterAuth session in the future)
async function getApiToken(): Promise<string | null> {
    // TODO: Implement token retrieval from BetterAuth session
    // This will require:
    // 1. Server-side session access
    // 2. Token exchange mechanism with backend API
    console.warn('Live API token retrieval not yet implemented')
    return null
}

// Generic API call helper
async function apiCall<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T | null> {
    const token = await getApiToken()
    if (!token) {
        console.warn(`Live API call to ${endpoint} skipped - no token available`)
        return null
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...options.headers,
            },
        })

        if (!response.ok) {
            console.error(`API call to ${endpoint} failed:`, response.status, response.statusText)
            return null
        }

        return await response.json()
    } catch (error) {
        console.error(`API call to ${endpoint} error:`, error)
        return null
    }
}

// Live Data Source implementation
// All methods return null until API token system is implemented
export const liveDataSource: DataSource = {
    // Profile
    async getProfile(): Promise<UserProfile | null> {
        return apiCall<UserProfile>('/profile')
    },

    async updateProfile(fields: Partial<UserProfile>): Promise<UserProfile | null> {
        return apiCall<UserProfile>('/profile', {
            method: 'PUT',
            body: JSON.stringify(fields),
        })
    },

    // Transactions
    async getTransactions(): Promise<MoneyTransaction[] | null> {
        return apiCall<MoneyTransaction[]>('/transactions')
    },

    // DIDs
    async getMyDids(): Promise<NumberInfo[] | null> {
        return apiCall<NumberInfo[]>('/dids')
    },

    async getDidSettings(number: string): Promise<MyNumberInfo | null> {
        return apiCall<MyNumberInfo>(`/dids/${encodeURIComponent(number)}`)
    },

    async updateDidSettings(number: string, data: Partial<MyNumberInfo>): Promise<MyNumberInfo | null> {
        return apiCall<MyNumberInfo>(`/dids/${encodeURIComponent(number)}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    },

    async deleteDid(number: string): Promise<NumberInfo[] | null> {
        return apiCall<NumberInfo[]>(`/dids/${encodeURIComponent(number)}`, {
            method: 'DELETE',
        })
    },

    // Waiting DIDs
    async getWaitingDids(): Promise<MyWaitingNumberInfo[] | null> {
        return apiCall<MyWaitingNumberInfo[]>('/waiting-dids')
    },

    async confirmWaitingDid(id: string): Promise<ApiResult<MyWaitingNumberInfo>> {
        const data = await apiCall<MyWaitingNumberInfo>(`/waiting-dids/${id}/confirm`, {
            method: 'POST',
        })
        return { data }
    },

    async deleteWaitingDid(id: string): Promise<ApiResult<MyWaitingNumberInfo[]>> {
        const data = await apiCall<MyWaitingNumberInfo[]>(`/waiting-dids/${id}`, {
            method: 'DELETE',
        })
        return { data }
    },

    // Cart
    async getCart(uid: string): Promise<CartItem[] | null> {
        return apiCall<CartItem[]>(`/cart?uid=${encodeURIComponent(uid)}`)
    },

    async addToCart(params): Promise<ApiResult<CartItem[]>> {
        const data = await apiCall<CartItem[]>('/cart', {
            method: 'POST',
            body: JSON.stringify(params),
        })
        return { data }
    },

    async removeFromCart(uid: string, ids: number[]): Promise<CartItem[] | null> {
        return apiCall<CartItem[]>('/cart', {
            method: 'DELETE',
            body: JSON.stringify({ uid, ids }),
        })
    },

    // Buy
    async buyNumbers(params): Promise<ApiResult<MyNumberInfo | MyWaitingNumberInfo>> {
        const data = await apiCall<MyNumberInfo | MyWaitingNumberInfo>('/buy', {
            method: 'POST',
            body: JSON.stringify(params),
        })
        return { data }
    },

    // Payments
    async getPaymentMethods(sum?: number): Promise<PaymentRegion[] | null> {
        const query = sum ? `?sum=${sum}` : ''
        return apiCall<PaymentRegion[]>(`/payments/methods${query}`)
    },

    async makePayment(amount: number, paymentMethod: string): Promise<Record<string, unknown> | null> {
        return apiCall<Record<string, unknown>>('/payments', {
            method: 'POST',
            body: JSON.stringify({ amount, method: paymentMethod }),
        })
    },

    // Statistics
    async getCallStatistics(params): Promise<CallStatistics[] | null> {
        const query = new URLSearchParams({
            startDate: params.startDate,
            endDate: params.endDate,
            ...(params.did && { did: params.did }),
        })
        return apiCall<CallStatistics[]>(`/statistics/calls?${query}`)
    },

    async getSmsStatistics(params): Promise<SmsStatistics[] | null> {
        const query = new URLSearchParams({
            startDate: params.startDate,
            endDate: params.endDate,
            ...(params.did && { did: params.did }),
        })
        return apiCall<SmsStatistics[]>(`/statistics/sms?${query}`)
    },

    // Uploads
    async getUploads(): Promise<UploadInfo[] | null> {
        return apiCall<UploadInfo[]>('/uploads')
    },

    async uploadFile(file: File, type: string): Promise<ApiResult<UploadInfo>> {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', type)

        const token = await getApiToken()
        if (!token) {
            return { data: null, error: { status: 401, message: 'not_authenticated' } }
        }

        try {
            const response = await fetch(`${API_BASE_URL}/uploads`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            })

            if (!response.ok) {
                return { data: null, error: { status: response.status, message: response.statusText } }
            }

            const data = await response.json()
            return { data }
        } catch (error) {
            console.error('Upload error:', error)
            return { data: null, error: { status: 500, message: 'upload_failed' } }
        }
    },

    async deleteUpload(filename: string): Promise<ApiResult<UploadInfo[]>> {
        const data = await apiCall<UploadInfo[]>(`/uploads/${encodeURIComponent(filename)}`, {
            method: 'DELETE',
        })
        return { data }
    },

    // IVR
    async getIvrOptions(): Promise<{ ivr: Ivr[]; ivrmusic: IvrMusic[]; ivreffects: IvrEffect[] } | null> {
        return apiCall('/ivr/options')
    },

    async getIvrOrders(): Promise<IvrOrder[] | null> {
        return apiCall<IvrOrder[]>('/ivr/orders')
    },

    async orderIvr(params: OrderIvrParams): Promise<OrderIvrResponse | null> {
        return apiCall<OrderIvrResponse>('/ivr/orders', {
            method: 'POST',
            body: JSON.stringify(params),
        })
    },

    // Offers (public data - no auth required)
    async getCountries(type: string): Promise<CountryInfo[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/offers/countries?type=${encodeURIComponent(type)}`, {
                headers: { 'Accept': 'application/json' },
            })
            if (!response.ok) return []
            const data = await response.json()
            return data.data || []
        } catch (error) {
            console.error('Error fetching countries:', error)
            return []
        }
    },

    async getAreas(type: string, countryId: number): Promise<AreaInfo[]> {
        try {
            const params = new URLSearchParams({
                type,
                country_id: countryId.toString(),
            })
            const response = await fetch(`${API_BASE_URL}/offers/areas?${params}`, {
                headers: { 'Accept': 'application/json' },
            })
            if (!response.ok) return []
            const data = await response.json()
            return data.data || []
        } catch (error) {
            console.error('Error fetching areas:', error)
            return []
        }
    },

    async getAvailableNumbers(type: string, countryId: number, areaPrefix: number): Promise<NumberInfo[]> {
        try {
            const params = new URLSearchParams({
                type,
                country_id: countryId.toString(),
                area_prefix: areaPrefix.toString(),
            })
            const response = await fetch(`${API_BASE_URL}/offers/numbers?${params}`, {
                headers: { 'Accept': 'application/json' },
            })
            if (!response.ok) return []
            const data = await response.json()

            // Transform the response to match NumberInfo type
            return (data.data || []).map((n: Record<string, unknown>, i: number) => ({
                id: (n.id as string) || `num-${i}`,
                did: n.did as string,
                name: n.did as string,
                where_did: n.where_did as string,
                setup_rate: Number(n.setup_rate),
                fix_rate: Number(n.fix_rate),
                voice: (n.voice as boolean) ?? false,
                sms: (n.sms as boolean) ?? false,
                toll_free: (n.toll_free as boolean) ?? false,
                incoming_per_minute: n.incoming_per_minute ? Number(n.incoming_per_minute) : undefined,
                toll_free_rate_in_min: n.toll_free_rate_in_min ? Number(n.toll_free_rate_in_min) : undefined,
                incoming_rate_sms: n.incoming_rate_sms ? Number(n.incoming_rate_sms) : undefined,
                docs_personal: (n.docs_personal as string[]) || [],
                docs_business: (n.docs_business as string[]) || [],
                autorenew: (n.autorenew as boolean) ?? false,
                country_id: n.country_id ? Number(n.country_id) : undefined,
            }))
        } catch (error) {
            console.error('Error fetching numbers:', error)
            return []
        }
    },

    async getDiscounts(): Promise<DiscountInfo[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/offers/discounts`, {
                headers: { 'Accept': 'application/json' },
            })
            if (!response.ok) return []
            const data = await response.json()

            // Transform months/percent to id/name format
            return (data.data || []).map((d: { months: number; percent: number }) => ({
                id: d.percent.toString(),
                name: d.months.toString(),
            }))
        } catch (error) {
            console.error('Error fetching discounts:', error)
            return []
        }
    },
}
