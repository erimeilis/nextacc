'use server'
import { MoneyTransaction } from '@/types/MoneyTransaction'
import { getAuthenticatedSession } from '@/lib/auth-server'
import { dataSource } from '@/lib/data-source'

export async function redGetMoneyTransactionReport(): Promise<MoneyTransaction[] | null> {
    const session = await getAuthenticatedSession()
    if (!session) return null

    return dataSource.getTransactions()
}
