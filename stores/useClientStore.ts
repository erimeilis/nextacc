import {create} from 'zustand'
import {UserProfile} from '@/types/UserProfile'
import {ClientInfo} from '@/types/ClientInfo'
import {MoneyTransaction} from '@/types/MoneyTransaction'
import {NumberInfo} from '@/types/NumberInfo'
import {redGetUserProfile} from '@/app/api/redreport/profile'
import {getClientInfo} from '@/app/api/other/ipinfo'
import {redGetMoneyTransactionReport} from '@/app/api/redreport/transactions'
import {redGetMyNumbers} from '@/app/api/redreport/numbers'

interface State {
    balance: number | null
    profile: UserProfile | null
    info: ClientInfo | null
    transactions: MoneyTransaction[] | null
    numbers: NumberInfo[] | null
    isLoading: boolean
    error: unknown
}

interface Actions {
    fetchData: () => Promise<void>
    updateProfile: () => void
    updateInfo: (info: ClientInfo) => void
    updateTransactions: () => void
    updateNumbers: () => void
}

const INITIAL_STATE: State = {
    balance: null,
    profile: null,
    info: null,
    transactions: null,
    numbers: null,
    isLoading: false,
    error: null
}

export const useClientStore = create<State & Actions>(
    set => ({
        balance: INITIAL_STATE.balance,
        profile: INITIAL_STATE.profile,
        info: INITIAL_STATE.info,
        transactions: INITIAL_STATE.transactions,
        numbers: INITIAL_STATE.numbers,
        isLoading: INITIAL_STATE.isLoading,
        error: INITIAL_STATE.error,
        fetchData: async () => {
            set({isLoading: true})

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
                isLoading: false,
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
    })
)