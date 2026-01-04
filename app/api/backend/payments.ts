'use server'
import { getAuthenticatedSession } from '@/lib/auth-server'
import { PaymentRegion } from '@/types/PaymentTypes'
import { dataSource } from '@/lib/data-source'

export async function redGetPaymentsMethods(sum?: number): Promise<PaymentRegion[] | null> {
    const session = await getAuthenticatedSession()
    if (!session) return null

    return dataSource.getPaymentMethods(sum)
}

export async function redMakePayment(amount: number, paymentMethod: string): Promise<Record<string, unknown> | null> {
    const session = await getAuthenticatedSession()
    if (!session) return null

    return dataSource.makePayment(amount, paymentMethod)
}
