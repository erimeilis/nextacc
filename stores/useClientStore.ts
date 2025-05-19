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
    updateProfile: () => Promise<UserProfile | null>
    updateInfo: (info: ClientInfo) => ClientInfo | null
    updateTransactions: () => Promise<MoneyTransaction[] | null>
    updateNumbers: () => Promise<NumberInfo[] | null>
    reset: () => void
}

export const useClientStore = create<ClientStore>()(
    persist(
        (set) => ({
            balance: null,
            profile: null,
            info: null,
            transactions: null,
            numbers: null,

            reset: () => {
                set({
                    balance: null,
                    profile: null,
                    info: null,
                    transactions: null,
                    numbers: null,
                })
            },

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
            updateProfile: async (): Promise<UserProfile | null> => {
                const profile = await redGetUserProfile()
                set(state => {
                    if (
                        state.profile === undefined ||
                        state.profile !== profile
                    ) {
                        return {
                            balance: profile?.balance ?? 0,
                            profile: profile
                        }
                    }
                    return state
                })
                return profile
            },
            updateInfo: (info: ClientInfo): ClientInfo | null => {
                set(state => {
                    if (
                        state.info === undefined ||
                        state.info !== info
                    ) {
                        return {
                            info: info
                        }
                    }
                    return state
                })
                return info
            },
            updateTransactions: async (): Promise<MoneyTransaction[] | null> => {
                const transactions = await redGetMoneyTransactionReport()
                set(state => {
                    if (
                        state.transactions === undefined ||
                        state.transactions !== transactions
                    ) {
                        return {
                            transactions: transactions
                        }
                    }
                    return state
                })
                return transactions
            },
            updateNumbers: async (): Promise<NumberInfo[] | null> => {
                const numbers = await redGetMyNumbers()
                set(state => {
                    if (
                        state.numbers === undefined ||
                        state.numbers !== numbers
                    ) {
                        return {
                            numbers: numbers
                        }
                    }
                    return state
                })
                return numbers
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
