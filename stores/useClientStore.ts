import {create} from 'zustand'
import {UserProfile} from '@/types/UserProfile'
import {ClientInfo} from '@/types/ClientInfo'
import {MoneyTransaction} from '@/types/MoneyTransaction'
import {NumberInfo} from '@/types/NumberInfo'
import {redGetUserProfile} from '@/app/api/redreport/profile'
import {getClientInfo} from '@/app/api/other/ipinfo'
import {redGetMoneyTransactionReport} from '@/app/api/redreport/transactions'
import {redGetMyNumbers} from '@/app/api/redreport/numbers'
import {persist} from 'zustand/middleware'
import {idbStorage} from '@/stores/idbStorage'

interface ClientStore {
    balance: number | null
    profile: UserProfile | null
    info: ClientInfo | null
    transactions: MoneyTransaction[] | null
    numbers: NumberInfo[] | null
    fetchData: () => Promise<void>
    updateProfile: () => Promise<void>
    updateInfo: (info: ClientInfo) => void
    updateTransactions: () => Promise<void>
    updateNumbers: () => Promise<void>
}

export const useClientStore = create<ClientStore>()(
    persist(
        (set) => ({
            balance: null,
            profile: null,
            info: null,
            transactions: null,
            numbers: null,

            fetchData: async () => {
                const profilePromise = redGetUserProfile()
                const infoPromise = getClientInfo()
                const transactionsPromise = redGetMoneyTransactionReport()
                const numbersPromise = redGetMyNumbers()

                const [
                    profile, info, transactions, numbers
                ] = await Promise.all([
                    profilePromise, infoPromise, transactionsPromise, numbersPromise
                ])
                set({
                    balance: profile?.balance ?? 0,
                    profile: profile,
                    info: info,
                    transactions: transactions,
                    numbers: numbers,
                })
            },
            updateProfile: async () => {
                const profile = await redGetUserProfile()
                set({
                    balance: profile?.balance ?? 0,
                    profile: profile
                })
            },
            updateInfo: (info: ClientInfo) => {
                set({
                    info: info
                })
            },
            updateTransactions: async () => {
                const transactions = await redGetMoneyTransactionReport()
                set({
                    transactions: transactions
                })
            },
            updateNumbers: async () => {
                const numbers = await redGetMyNumbers()
                set({
                    numbers: numbers
                })
            },
        }),
        {
            name: 'client-storage',
            storage: idbStorage,
            version: 1,
            partialize: (state: ClientStore) => ({
                profile: state.profile,
                transactions: state.transactions,
                numbers: state.numbers,
                balance: state.balance,
                info: state.info,
            }),
            merge: (persistedState, currentState) => {
                const persisted = persistedState as Partial<ClientStore> || {}
                return {
                    ...currentState,
                    profile:
                        persisted.profile && Object.keys(persisted.profile).length > 0
                            ? persisted.profile
                            : currentState.profile,
                    transactions:
                        persisted.transactions && Object.keys(persisted.transactions).length > 0
                            ? persisted.transactions
                            : currentState.transactions,
                    numbers:
                        persisted.numbers && Object.keys(persisted.numbers).length > 0
                            ? persisted.numbers
                            : currentState.numbers,
                    balance:
                        persisted.balance ? persisted.balance : currentState.balance,
                    info:
                        persisted.info ? persisted.info : currentState.info,
                }
            },
        }
    )
)