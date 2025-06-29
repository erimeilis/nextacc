import {create} from 'zustand'
import {UserProfile} from '@/types/UserProfile'
import {ClientInfo} from '@/types/ClientInfo'
import {MoneyTransaction} from '@/types/MoneyTransaction'
import {NumberInfo} from '@/types/NumberInfo'
import {UploadInfo} from '@/types/UploadInfo'
import {redGetUserProfile} from '@/app/api/redreport/profile'
import {getClientInfo} from '@/app/api/other/ipinfo'
import {redGetMoneyTransactionReport} from '@/app/api/redreport/transactions'
import {redGetMyDids} from '@/app/api/redreport/dids'
import {redDeleteUpload, redGetMyUploads, redRenameFile, redUploadFile} from '@/app/api/redreport/uploads'
import {persist} from 'zustand/middleware'
import {idbStorage} from '@/stores/idbStorage'

interface ClientStore {
    balance: number | null
    profile: UserProfile | null
    info: ClientInfo | null
    transactions: MoneyTransaction[] | null
    numbers: NumberInfo[] | null
    uploads: UploadInfo[] | null
    fetchData: () => Promise<void>
    updateProfile: () => Promise<UserProfile | null>
    updateInfo: (info: ClientInfo) => ClientInfo | null
    updateTransactions: () => Promise<MoneyTransaction[] | null>
    updateNumbers: () => Promise<NumberInfo[] | null>
    updateUploads: () => Promise<UploadInfo[] | null>
    uploadFile: (file: File) => Promise<boolean>
    deleteUpload: (fileId: string) => Promise<boolean>
    renameFile: (filename: string, name: string) => Promise<boolean>
    reset: () => void
    isUserLoggedIn: () => boolean // Add this new method
    ensureUserLoggedIn: () => boolean
    getBalance: () => number | null
    getProfile: () => UserProfile | null
    getInfo: () => ClientInfo | null
    getTransactions: () => MoneyTransaction[] | null
    getNumbers: () => NumberInfo[] | null
    getUploads: () => UploadInfo[] | null
}

export const useClientStore = create<ClientStore>()(
    persist(
        (set, get) => ({
            balance: null,
            profile: null,
            info: null,
            transactions: null,
            numbers: null,
            uploads: null,

            reset: () => {
                set({
                    balance: null,
                    profile: null,
                    info: null,
                    transactions: null,
                    numbers: null,
                    uploads: null,
                })
            },

            // Add a new method for checking login status without side effects
            isUserLoggedIn: () => {
                const profile = get().profile
                return !!(profile && profile.id !== undefined && profile.id !== null)
            },

            ensureUserLoggedIn: () => {
                const isLoggedIn = get().isUserLoggedIn()
                if (!isLoggedIn) {
                    get().reset()
                }
                return isLoggedIn
            },

            // Update all getters to use isUserLoggedIn instead of ensureUserLoggedIn
            getBalance: () => {
                return get().isUserLoggedIn() ? get().balance : null
            },

            getProfile: () => {
                return get().isUserLoggedIn() ? get().profile : null
            },

            getInfo: () => {
                return get().isUserLoggedIn() ? get().info : null
            },

            getTransactions: () => {
                return get().isUserLoggedIn() ? get().transactions : null
            },

            getNumbers: () => {
                return get().isUserLoggedIn() ? get().numbers : null
            },

            getUploads: () => {
                return get().isUserLoggedIn() ? get().uploads : null
            },

            fetchData: async () => {
                const profilePromise = redGetUserProfile()
                const infoPromise = getClientInfo()
                const transactionsPromise = redGetMoneyTransactionReport()
                const numbersPromise = redGetMyDids()
                const uploadsPromise = redGetMyUploads()

                const [
                    profile, info, transactions, numbers, uploads
                ] = await Promise.all([
                    profilePromise, infoPromise, transactionsPromise, numbersPromise, uploadsPromise
                ])
                set({
                    balance: profile?.balance ?? 0,
                    profile: profile,
                    info: info,
                    transactions: transactions,
                    numbers: numbers,
                    uploads: uploads,
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
                const numbers = await redGetMyDids()
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

            updateUploads: async (): Promise<UploadInfo[] | null> => {
                const uploads = await redGetMyUploads()
                set(state => {
                    if (
                        state.uploads === undefined ||
                        state.uploads !== uploads
                    ) {
                        return {
                            uploads: uploads
                        }
                    }
                    return state
                })
                return uploads
            },

            uploadFile: async (file: File): Promise<boolean> => {
                const success = await redUploadFile(file)

                if (success) {
                    // Refresh the upload list
                    await get().updateUploads()
                }

                return success
            },

            deleteUpload: async (fileId: string): Promise<boolean> => {
                const success = await redDeleteUpload(fileId)

                if (success) {
                    // Update the local state by removing the deleted file
                    set((state) => ({
                        ...state,
                        uploads: state.uploads?.filter(upload => upload.filename !== fileId) || null,
                    }))
                }

                return success
            },

            renameFile: async (filename: string, name: string): Promise<boolean> => {
                const success = await redRenameFile(filename, name)

                if (success) {
                    // Refresh the upload list to get updated data
                    await get().updateUploads()
                }

                return success
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
                uploads: state.uploads,
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
                    uploads:
                        persisted.uploads && Object.keys(persisted.uploads).length > 0
                            ? persisted.uploads
                            : currentState.uploads,
                    balance:
                        persisted.balance ? persisted.balance : currentState.balance,
                    info:
                        persisted.info ? persisted.info : currentState.info,
                }
            },
        }
    )
)
