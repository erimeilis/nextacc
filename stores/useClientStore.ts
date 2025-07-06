import {create} from 'zustand'
import {UserProfile} from '@/types/UserProfile'
import {ClientInfo} from '@/types/ClientInfo'
import {MoneyTransaction} from '@/types/MoneyTransaction'
import {NumberInfo} from '@/types/NumberInfo'
import {UploadInfo} from '@/types/UploadInfo'
import {redGetUserProfile} from '@/app/api/redreport/profile'
import {getClientInfo} from '@/app/api/other/ipinfo'
import {redGetMoneyTransactionReport} from '@/app/api/redreport/transactions'
import {redDeleteDid, redGetMyDids} from '@/app/api/redreport/dids'
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
    fetchProfile: () => Promise<UserProfile | null>
    updateInfo: (info: ClientInfo) => ClientInfo | null
    fetchTransactions: () => Promise<MoneyTransaction[] | null>
    //numbers
    fetchNumbers: () => Promise<NumberInfo[] | null>
    deleteNumber: (id: string) => Promise<NumberInfo[] | null>
    //uploads
    fetchUploads: () => Promise<UploadInfo[] | null>
    uploadFile: (file: File) => Promise<UploadInfo[] | null>
    renameFile: (filename: string, name: string) => Promise<UploadInfo[] | null>
    deleteUpload: (fileId: string) => Promise<UploadInfo[] | null>

    reset: () => void
    isUserLoggedIn: () => boolean
    ensureUserLoggedIn: () => boolean
    getBalance: () => number | null
    getProfile: () => UserProfile | null
    getInfo: () => ClientInfo | null
    getTransactions: () => MoneyTransaction[] | null
    getNumbers: () => NumberInfo[] | null
    getUploads: () => UploadInfo[] | null
}

// Define the persisted state type (only the data that gets stored)
type PersistedClientState = {
    balance: number | null
    profile: UserProfile | null
    transactions: MoneyTransaction[] | null
    numbers: NumberInfo[] | null
    uploads: UploadInfo[] | null
}

// Type guard to check if the persisted state has the expected shape
function isValidPersistedState(state: unknown): state is Partial<PersistedClientState> {
    return state !== null && typeof state === 'object'
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
            fetchProfile: async (): Promise<UserProfile | null> => {
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
            fetchTransactions: async (): Promise<MoneyTransaction[] | null> => {
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
            fetchNumbers: async (): Promise<NumberInfo[] | null> => {
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

            deleteNumber: async (id: string): Promise<NumberInfo[] | null> => {
                // Find the number with the given id to get its did
                const number = get().numbers?.find(n => n.id === id);
                if (!number) {
                    console.error(`Number with id ${id} not found`);
                    return get().numbers;
                }

                // Use the did to delete the number
                const numbers = await redDeleteDid(number.did)
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

            fetchUploads: async (): Promise<UploadInfo[] | null> => {
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

            uploadFile: async (file: File): Promise<UploadInfo[] | null> => {
                const uploads = await redUploadFile(file)
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

            deleteUpload: async (fileId: string): Promise<UploadInfo[] | null> => {
                const uploads = await redDeleteUpload(fileId)
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

            renameFile: async (filename: string, name: string): Promise<UploadInfo[] | null> => {
                const uploads = await redRenameFile(filename, name)
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
            }

        }),
        {
            name: 'client-storage',
            storage: idbStorage,
            version: 2,
            migrate: (persistedState: unknown, version: number): PersistedClientState => {
                // Handle migration from version 1 to version 2
                if (version === 1 && isValidPersistedState(persistedState)) {
                    // If migrating from version 1, ensure all required fields exist
                    return {
                        balance: persistedState.balance ?? null,
                        profile: persistedState.profile ?? null,
                        transactions: persistedState.transactions ?? null,
                        numbers: persistedState.numbers ?? null,
                        uploads: persistedState.uploads ?? null,
                    }
                }

                // For any other version mismatches or invalid state, return a clean state
                return {
                    balance: null,
                    profile: null,
                    transactions: null,
                    numbers: null,
                    uploads: null,
                }
            },
            partialize: (state: ClientStore): PersistedClientState => ({
                profile: state.profile,
                transactions: state.transactions,
                numbers: state.numbers,
                uploads: state.uploads,
                balance: state.balance,
            }),
        }
    )
)
