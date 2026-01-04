/**
 * Data Source Abstraction Layer
 *
 * This module defines the interface for data access, supporting both:
 * - Demo mode: Uses @faker-js/faker for realistic mock data
 * - Live mode: Connects to the real backend API
 *
 * Switch modes via NEXT_PUBLIC_DATA_MODE=demo|live
 */

import type { UserProfile } from '@/types/UserProfile'
import type { MoneyTransaction } from '@/types/MoneyTransaction'
import type { NumberInfo } from '@/types/NumberInfo'
import type { MyNumberInfo } from '@/types/MyNumberInfo'
import type { MyWaitingNumberInfo } from '@/types/MyWaitingNumberInfo'
import type { CartItem } from '@/types/CartItem'
import type { NumberDestination } from '@/types/NumberDestination'
import type { ClientInfo } from '@/types/ClientInfo'
import type { PaymentRegion } from '@/types/PaymentTypes'
import type { CallStatistics, SmsStatistics } from '@/types/Statistics'
import type { UploadInfo } from '@/types/UploadInfo'
import type { Ivr, IvrMusic, IvrEffect, IvrOrder, OrderIvrParams, OrderIvrResponse } from '@/types/IvrTypes'
import type { CountryInfo } from '@/types/CountryInfo'
import type { AreaInfo } from '@/types/AreaInfo'

// Discount info type
export type DiscountInfo = {
    id: string
    name: string
}

// Result types for operations
export type ApiResult<T> = {
    data: T | null
    error?: { status: number; message: string }
}

// Data source interface - all methods for data access
export interface DataSource {
    // Profile
    getProfile(): Promise<UserProfile | null>
    updateProfile(fields: Partial<UserProfile>): Promise<UserProfile | null>

    // Transactions
    getTransactions(): Promise<MoneyTransaction[] | null>

    // DIDs (Phone Numbers)
    getMyDids(): Promise<NumberInfo[] | null>
    getDidSettings(number: string): Promise<MyNumberInfo | null>
    updateDidSettings(number: string, data: Partial<MyNumberInfo>): Promise<MyNumberInfo | null>
    deleteDid(number: string): Promise<NumberInfo[] | null>

    // Waiting DIDs
    getWaitingDids(): Promise<MyWaitingNumberInfo[] | null>
    confirmWaitingDid(id: string): Promise<ApiResult<MyWaitingNumberInfo>>
    deleteWaitingDid(id: string): Promise<ApiResult<MyWaitingNumberInfo[]>>

    // Cart
    getCart(uid: string): Promise<CartItem[] | null>
    addToCart(params: {
        clientInfo: ClientInfo | null
        uid: string
        number: NumberInfo | null
        countryId: number | null
        areaCode: number | null
        qty: number
        voice?: NumberDestination
        sms?: NumberDestination
        docs?: { [doc_slug: string]: string } | Array<{ type: string; file: string }>
    }): Promise<ApiResult<CartItem[]>>
    removeFromCart(uid: string, ids: number[]): Promise<CartItem[] | null>

    // Buy (checkout)
    buyNumbers(params: {
        clientInfo: ClientInfo | null
        uid: string
        numbers: NumberInfo[]
        countryId: number | null
        areaCode: number | null
        qty: number
        voice?: NumberDestination
        sms?: NumberDestination
        docs?: { [doc_slug: string]: string } | Array<{ type: string; file: string }>
    }): Promise<ApiResult<MyNumberInfo | MyWaitingNumberInfo>>

    // Payments
    getPaymentMethods(sum?: number): Promise<PaymentRegion[] | null>
    makePayment(amount: number, paymentMethod: string): Promise<Record<string, unknown> | null>

    // Statistics
    getCallStatistics(params: {
        startDate: string
        endDate: string
        did?: string
    }): Promise<CallStatistics[] | null>
    getSmsStatistics(params: {
        startDate: string
        endDate: string
        did?: string
    }): Promise<SmsStatistics[] | null>

    // Uploads
    getUploads(): Promise<UploadInfo[] | null>
    uploadFile(file: File, type: string): Promise<ApiResult<UploadInfo>>
    deleteUpload(filename: string): Promise<ApiResult<UploadInfo[]>>

    // IVR
    getIvrOptions(): Promise<{ ivr: Ivr[]; ivrmusic: IvrMusic[]; ivreffects: IvrEffect[] } | null>
    getIvrOrders(): Promise<IvrOrder[] | null>
    orderIvr(params: OrderIvrParams): Promise<OrderIvrResponse | null>

    // Offers (public data - countries, areas, numbers, discounts)
    getCountries(type: string): Promise<CountryInfo[]>
    getAreas(type: string, countryId: number): Promise<AreaInfo[]>
    getAvailableNumbers(type: string, countryId: number, areaPrefix: number): Promise<NumberInfo[]>
    getDiscounts(): Promise<DiscountInfo[]>
}

// Data mode type
export type DataMode = 'demo' | 'live'

// Get current data mode from environment
export function getDataMode(): DataMode {
    const mode = process.env.NEXT_PUBLIC_DATA_MODE
    if (mode === 'live') return 'live'
    return 'demo' // Default to demo mode
}
