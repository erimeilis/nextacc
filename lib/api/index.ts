'use server'

import { dataSource } from '@/lib/data-source'
import { getAuthenticatedSession } from '@/lib/auth-server'
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
import type { DiscountInfo } from '@/lib/data-source/types'

/**
 * API Result Types
 */
export type ApiSuccess<T> = { success: true; data: T }
export type ApiError = { success: false; error: string; code: 'UNAUTHORIZED' | 'NOT_FOUND' | 'SERVER_ERROR' }
export type ApiResult<T> = ApiSuccess<T> | ApiError

/**
 * Authenticated wrapper for API calls
 */
async function withAuth<T>(fn: () => Promise<T | null>): Promise<ApiResult<T>> {
    const session = await getAuthenticatedSession()
    if (!session) {
        return { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' }
    }
    try {
        const data = await fn()
        if (data === null) {
            return { success: false, error: 'Not found', code: 'NOT_FOUND' }
        }
        return { success: true, data }
    } catch (e) {
        console.error('[API Error]:', e)
        return { success: false, error: e instanceof Error ? e.message : String(e), code: 'SERVER_ERROR' }
    }
}

// =============================================================================
// Profile API
// =============================================================================

export async function getProfile(): Promise<ApiResult<UserProfile>> {
    return withAuth(() => dataSource.getProfile())
}

export async function updateProfile(fields: Partial<UserProfile>): Promise<ApiResult<UserProfile>> {
    return withAuth(() => dataSource.updateProfile(fields))
}

// =============================================================================
// Transactions API
// =============================================================================

export async function getTransactions(): Promise<ApiResult<MoneyTransaction[]>> {
    return withAuth(() => dataSource.getTransactions())
}

// =============================================================================
// DIDs (Phone Numbers) API
// =============================================================================

export async function getDids(): Promise<ApiResult<NumberInfo[]>> {
    return withAuth(() => dataSource.getMyDids())
}

export async function getDidSettings(number: string): Promise<ApiResult<MyNumberInfo>> {
    return withAuth(() => dataSource.getDidSettings(number))
}

export async function updateDidSettings(number: string, data: Partial<MyNumberInfo>): Promise<ApiResult<MyNumberInfo>> {
    return withAuth(() => dataSource.updateDidSettings(number, data))
}

export async function deleteDid(number: string): Promise<ApiResult<NumberInfo[]>> {
    return withAuth(() => dataSource.deleteDid(number))
}

// =============================================================================
// Waiting DIDs API
// =============================================================================

export async function getWaitingDids(): Promise<ApiResult<MyWaitingNumberInfo[]>> {
    return withAuth(() => dataSource.getWaitingDids())
}

export async function confirmWaitingDid(id: string): Promise<ApiResult<MyWaitingNumberInfo>> {
    const session = await getAuthenticatedSession()
    if (!session) {
        return { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' }
    }
    try {
        const result = await dataSource.confirmWaitingDid(id)
        if (result.error) {
            return { success: false, error: result.error.message, code: 'SERVER_ERROR' }
        }
        if (result.data === null) {
            return { success: false, error: 'Not found', code: 'NOT_FOUND' }
        }
        return { success: true, data: result.data }
    } catch (e) {
        console.error('[API Error]:', e)
        return { success: false, error: e instanceof Error ? e.message : String(e), code: 'SERVER_ERROR' }
    }
}

export async function deleteWaitingDid(id: string): Promise<ApiResult<MyWaitingNumberInfo[]>> {
    const session = await getAuthenticatedSession()
    if (!session) {
        return { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' }
    }
    try {
        const result = await dataSource.deleteWaitingDid(id)
        if (result.error) {
            return { success: false, error: result.error.message, code: 'SERVER_ERROR' }
        }
        if (result.data === null) {
            return { success: false, error: 'Not found', code: 'NOT_FOUND' }
        }
        return { success: true, data: result.data }
    } catch (e) {
        console.error('[API Error]:', e)
        return { success: false, error: e instanceof Error ? e.message : String(e), code: 'SERVER_ERROR' }
    }
}

export async function getWaitingDidSettings(id: string): Promise<ApiResult<MyWaitingNumberInfo>> {
    const session = await getAuthenticatedSession()
    if (!session) {
        return { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' }
    }
    try {
        const waitingDids = await dataSource.getWaitingDids()
        const found = waitingDids?.find(d => d.id === id)
        if (!found) {
            return { success: false, error: 'Not found', code: 'NOT_FOUND' }
        }
        return { success: true, data: found }
    } catch (e) {
        console.error('[API Error]:', e)
        return { success: false, error: e instanceof Error ? e.message : String(e), code: 'SERVER_ERROR' }
    }
}

export async function updateWaitingDidSettings(id: string, data: Partial<MyWaitingNumberInfo>): Promise<ApiResult<MyWaitingNumberInfo>> {
    const session = await getAuthenticatedSession()
    if (!session) {
        return { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' }
    }
    try {
        // TODO: Implement update in dataSource when available
        // For now, simulate update by merging with existing data
        const waitingDids = await dataSource.getWaitingDids()
        const existing = waitingDids?.find(d => d.id === id)
        if (!existing) {
            return { success: false, error: 'Not found', code: 'NOT_FOUND' }
        }
        const updated = { ...existing, ...data }
        return { success: true, data: updated }
    } catch (e) {
        console.error('[API Error]:', e)
        return { success: false, error: e instanceof Error ? e.message : String(e), code: 'SERVER_ERROR' }
    }
}

// =============================================================================
// Cart API
// =============================================================================

export async function getCart(uid: string): Promise<ApiResult<CartItem[]>> {
    return withAuth(() => dataSource.getCart(uid))
}

export async function addToCart(params: {
    clientInfo: ClientInfo | null
    uid: string
    number: NumberInfo | null
    countryId: number | null
    areaCode: number | null
    qty: number
    voice?: NumberDestination
    sms?: NumberDestination
    docs?: { [doc_slug: string]: string } | Array<{ type: string; file: string }>
}): Promise<ApiResult<CartItem[]>> {
    const session = await getAuthenticatedSession()
    if (!session) {
        return { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' }
    }
    try {
        const result = await dataSource.addToCart(params)
        if (result.error) {
            return { success: false, error: result.error.message, code: 'SERVER_ERROR' }
        }
        if (result.data === null) {
            return { success: false, error: 'Failed to add to cart', code: 'SERVER_ERROR' }
        }
        return { success: true, data: result.data }
    } catch (e) {
        console.error('[API Error]:', e)
        return { success: false, error: e instanceof Error ? e.message : String(e), code: 'SERVER_ERROR' }
    }
}

export async function removeFromCart(uid: string, ids: number[]): Promise<ApiResult<CartItem[]>> {
    return withAuth(() => dataSource.removeFromCart(uid, ids))
}

// =============================================================================
// Buy (Checkout) API
// =============================================================================

export async function buyNumbers(params: {
    clientInfo: ClientInfo | null
    uid: string
    numbers: NumberInfo[]
    countryId: number | null
    areaCode: number | null
    qty: number
    voice?: NumberDestination
    sms?: NumberDestination
    docs?: { [doc_slug: string]: string } | Array<{ type: string; file: string }>
}): Promise<ApiResult<MyNumberInfo | MyWaitingNumberInfo>> {
    const session = await getAuthenticatedSession()
    if (!session) {
        return { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' }
    }
    try {
        const result = await dataSource.buyNumbers(params)
        if (result.error) {
            return { success: false, error: result.error.message, code: 'SERVER_ERROR' }
        }
        if (result.data === null) {
            return { success: false, error: 'Purchase failed', code: 'SERVER_ERROR' }
        }
        return { success: true, data: result.data }
    } catch (e) {
        console.error('[API Error]:', e)
        return { success: false, error: e instanceof Error ? e.message : String(e), code: 'SERVER_ERROR' }
    }
}

// =============================================================================
// Payments API
// =============================================================================

export async function getPaymentMethods(sum?: number): Promise<ApiResult<PaymentRegion[]>> {
    return withAuth(() => dataSource.getPaymentMethods(sum))
}

export async function makePayment(amount: number, paymentMethod: string): Promise<ApiResult<Record<string, unknown>>> {
    return withAuth(() => dataSource.makePayment(amount, paymentMethod))
}

// =============================================================================
// Statistics API
// =============================================================================

export async function getCallStatistics(params: {
    startDate: string
    endDate: string
    did?: string
}): Promise<ApiResult<CallStatistics[]>> {
    return withAuth(() => dataSource.getCallStatistics(params))
}

export async function getSmsStatistics(params: {
    startDate: string
    endDate: string
    did?: string
}): Promise<ApiResult<SmsStatistics[]>> {
    return withAuth(() => dataSource.getSmsStatistics(params))
}

export async function sendCallStatistics(params: {
    startDate: string
    endDate: string
    did?: string
}): Promise<ApiResult<boolean>> {
    // TODO: Implement email sending when available in dataSource
    console.log('[API] sendCallStatistics: Email sending not yet implemented', params)
    return { success: true, data: true } // Simulate success in demo mode
}

export async function sendSmsStatistics(params: {
    startDate: string
    endDate: string
    did?: string
}): Promise<ApiResult<boolean>> {
    // TODO: Implement email sending when available in dataSource
    console.log('[API] sendSmsStatistics: Email sending not yet implemented', params)
    return { success: true, data: true } // Simulate success in demo mode
}

// =============================================================================
// Uploads API
// =============================================================================

export async function getUploads(): Promise<ApiResult<UploadInfo[]>> {
    return withAuth(() => dataSource.getUploads())
}

export async function uploadFile(file: File, type: string): Promise<ApiResult<UploadInfo>> {
    const session = await getAuthenticatedSession()
    if (!session) {
        return { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' }
    }
    try {
        const result = await dataSource.uploadFile(file, type)
        if (result.error) {
            return { success: false, error: result.error.message, code: 'SERVER_ERROR' }
        }
        if (result.data === null) {
            return { success: false, error: 'Upload failed', code: 'SERVER_ERROR' }
        }
        return { success: true, data: result.data }
    } catch (e) {
        console.error('[API Error]:', e)
        return { success: false, error: e instanceof Error ? e.message : String(e), code: 'SERVER_ERROR' }
    }
}

export async function deleteUpload(filename: string): Promise<ApiResult<UploadInfo[]>> {
    const session = await getAuthenticatedSession()
    if (!session) {
        return { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' }
    }
    try {
        const result = await dataSource.deleteUpload(filename)
        if (result.error) {
            return { success: false, error: result.error.message, code: 'SERVER_ERROR' }
        }
        if (result.data === null) {
            return { success: false, error: 'Delete failed', code: 'SERVER_ERROR' }
        }
        return { success: true, data: result.data }
    } catch (e) {
        console.error('[API Error]:', e)
        return { success: false, error: e instanceof Error ? e.message : String(e), code: 'SERVER_ERROR' }
    }
}

export async function renameFile(filename: string, newName: string): Promise<ApiResult<UploadInfo[]>> {
    const session = await getAuthenticatedSession()
    if (!session) {
        return { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' }
    }
    try {
        // TODO: Implement rename in dataSource when available
        console.log('[API] renameFile: Rename not yet implemented', { filename, newName })
        // For now, just return the current uploads list
        const uploads = await dataSource.getUploads()
        if (uploads === null) {
            return { success: false, error: 'Failed to fetch uploads', code: 'SERVER_ERROR' }
        }
        return { success: true, data: uploads }
    } catch (e) {
        console.error('[API Error]:', e)
        return { success: false, error: e instanceof Error ? e.message : String(e), code: 'SERVER_ERROR' }
    }
}

// =============================================================================
// IVR API
// =============================================================================

export async function getIvrOptions(): Promise<ApiResult<{
    ivr: Ivr[]
    ivrmusic: IvrMusic[]
    ivreffects: IvrEffect[]
}>> {
    return withAuth(() => dataSource.getIvrOptions())
}

export async function getIvrOrders(): Promise<ApiResult<IvrOrder[]>> {
    return withAuth(() => dataSource.getIvrOrders())
}

export async function orderIvr(params: OrderIvrParams): Promise<ApiResult<OrderIvrResponse>> {
    return withAuth(() => dataSource.orderIvr(params))
}

// =============================================================================
// Public API (no authentication required)
// =============================================================================

export async function getCountries(type: string): Promise<CountryInfo[]> {
    return dataSource.getCountries(type)
}

export async function getAreas(type: string, countryId: number): Promise<AreaInfo[]> {
    return dataSource.getAreas(type, countryId)
}

export async function getAvailableNumbers(type: string, countryId: number, areaPrefix: number): Promise<NumberInfo[]> {
    return dataSource.getAvailableNumbers(type, countryId, areaPrefix)
}

export async function getDiscounts(): Promise<DiscountInfo[]> {
    return dataSource.getDiscounts()
}
