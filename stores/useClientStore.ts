import {create} from 'zustand'
import {UserProfile} from '@/types/UserProfile'
import {ClientInfo} from '@/types/ClientInfo'
import {MoneyTransaction} from '@/types/MoneyTransaction'
import {NumberInfo} from '@/types/NumberInfo'
import {UploadInfo} from '@/types/UploadInfo'
import {PaymentRegion} from '@/types/PaymentTypes'
import {redGetUserProfile} from '@/app/api/backend/profile'
import {getClientInfo} from '@/app/api/other/ipinfo'
import {redGetMoneyTransactionReport} from '@/app/api/backend/transactions'
import {redDeleteDid, redGetMyDids} from '@/app/api/backend/dids'
import {redDeleteUpload, redGetMyUploads, redRenameFile, redUploadFile} from '@/app/api/backend/uploads'
import {redGetPaymentsMethods} from '@/app/api/backend/payments'
import {redGetMyIvr} from '@/app/api/backend/ivr'
import {IvrOrder} from '@/types/IvrTypes'
import {persist} from 'zustand/middleware'
import {idbStorage} from '@/stores/idbStorage'

interface ClientStore {
    balance: number | null
    profile: UserProfile | null
    info: ClientInfo | null
    transactions: MoneyTransaction[] | null
    numbers: NumberInfo[] | null
    uploads: UploadInfo[] | null
    paymentMethods: PaymentRegion[] | null
    myIvr: IvrOrder[] | null
    fetchData: () => Promise<void>
    fetchProfile: () => Promise<UserProfile | null>
    updateInfo: (info: ClientInfo) => ClientInfo | null
    fetchTransactions: () => Promise<MoneyTransaction[] | null>
    //numbers
    fetchNumbers: () => Promise<NumberInfo[] | null>
    updateNumbers: (numbers: NumberInfo[]) => void
    deleteNumber: (id: string) => Promise<NumberInfo[] | null>
    //uploads
    fetchUploads: () => Promise<UploadInfo[] | null>
    uploadFile: (file: File) => Promise<UploadInfo[] | null>
    renameFile: (filename: string, name: string) => Promise<UploadInfo[] | null>
    deleteUpload: (fileId: string) => Promise<UploadInfo[] | null>
    //payments
    fetchPaymentMethods: (sum?: number) => Promise<PaymentRegion[] | null>

    reset: () => void
    isUserLoggedIn: () => boolean
    ensureUserLoggedIn: () => boolean
    getBalance: () => number | null
    getProfile: () => UserProfile | null
    getInfo: () => ClientInfo | null
    getTransactions: () => MoneyTransaction[] | null
    getNumbers: () => NumberInfo[] | null
    getUploads: () => UploadInfo[] | null
    getPaymentMethods: () => PaymentRegion[] | null
    getMyIvr: () => IvrOrder[] | null
    fetchMyIvr: () => Promise<IvrOrder[] | null>
}

// Define the persisted state type (only the data that gets stored)
type PersistedClientState = {
    balance: number | null
    profile: UserProfile | null
    transactions: MoneyTransaction[] | null
    numbers: NumberInfo[] | null
    uploads: UploadInfo[] | null
    paymentMethods: PaymentRegion[] | null
    myIvr: IvrOrder[] | null
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
            paymentMethods: null,
            myIvr: null,

            reset: () => {
                console.log('resetting client store')
                set({
                    balance: null,
                    profile: null,
                    info: null,
                    transactions: null,
                    numbers: null,
                    uploads: null,
                    paymentMethods: null,
                    myIvr: null,
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

            getPaymentMethods: () => {
                return get().isUserLoggedIn() ? get().paymentMethods : null
            },

            getMyIvr: () => {
                return get().isUserLoggedIn() ? get().myIvr : null
            },

            fetchData: async () => {
                try {
                    const profilePromise = redGetUserProfile()
                    const infoPromise = getClientInfo()
                    const transactionsPromise = redGetMoneyTransactionReport()
                    const numbersPromise = redGetMyDids()
                    const uploadsPromise = redGetMyUploads()
                    const myIvrPromise = redGetMyIvr()

                    const [
                        profile, info, transactions, numbers, uploads, myIvr
                    ] = await Promise.all([
                        profilePromise, infoPromise, transactionsPromise, numbersPromise, uploadsPromise, myIvrPromise
                    ])

                    // If profile is null, it might indicate an auth issue
                    if (!profile) {
                        console.log('Profile fetch returned null, possible auth issue')
                        get().reset()
                        return
                    }

                    set({
                        balance: profile?.balance ?? 0,
                        profile: profile,
                        info: info,
                        transactions: transactions,
                        numbers: numbers,
                        uploads: uploads,
                        myIvr: myIvr,
                    })
                } catch (error) {
                    console.error('Error fetching client data:', error)
                    // Reset store on fetch error as it might be auth-related
                    get().reset()
                }
            },
            fetchProfile: async (): Promise<UserProfile | null> => {
                try {
                    const profile = await redGetUserProfile()

                    // If profile is null, it might indicate an auth issue
                    if (!profile) {
                        console.log('Profile fetch returned null, possible auth issue')
                        get().reset()
                        return null
                    }

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
                } catch (error) {
                    console.error('Error fetching profile:', error)
                    // Reset store on fetch error as it might be auth-related
                    get().reset()
                    return null
                }
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
                try {
                    const transactions = await redGetMoneyTransactionReport()

                    // If transactions is null, it might indicate an auth issue
                    if (!transactions) {
                        console.log('Transactions fetch returned null, possible auth issue')
                        get().reset()
                        return null
                    }

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
                } catch (error) {
                    console.error('Error fetching transactions:', error)
                    // Reset store on fetch error as it might be auth-related
                    get().reset()
                    return null
                }
            },
            fetchNumbers: async (): Promise<NumberInfo[] | null> => {
                try {
                    const numbers = await redGetMyDids()

                    // If numbers is null, it might indicate an auth issue
                    if (!numbers) {
                        console.log('Numbers fetch returned null, possible auth issue')
                        get().reset()
                        return null
                    }

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
                } catch (error) {
                    console.error('Error fetching numbers:', error)
                    // Reset store on fetch error as it might be auth-related
                    get().reset()
                    return null
                }
            },

            deleteNumber: async (id: string): Promise<NumberInfo[] | null> => {
                try {
                    // Find the number with the given id to get its did
                    const number = get().numbers?.find(n => n.id === id)
                    if (!number) {
                        console.error(`Number with id ${id} not found`)
                        return get().numbers
                    }

                    // Use the did to delete the number
                    const numbers = await redDeleteDid(number.did)

                    // If numbers is null, it might indicate an auth issue
                    if (!numbers) {
                        console.log('Delete number returned null, possible auth issue')
                        get().reset()
                        return null
                    }

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
                } catch (error) {
                    console.error('Error deleting number:', error)
                    // Reset store on fetch error as it might be auth-related
                    get().reset()
                    return null
                }
            },

            fetchUploads: async (): Promise<UploadInfo[] | null> => {
                try {
                    const uploads = await redGetMyUploads()

                    // If uploads is null, it might indicate an auth issue
                    if (!uploads) {
                        console.log('Uploads fetch returned null, possible auth issue')
                        get().reset()
                        return null
                    }

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
                } catch (error) {
                    console.error('Error fetching uploads:', error)
                    // Reset store on fetch error as it might be auth-related
                    get().reset()
                    return null
                }
            },

            uploadFile: async (file: File): Promise<UploadInfo[] | null> => {
                try {
                    const uploads = await redUploadFile(file)

                    // If uploads is null, it might indicate an auth issue
                    if (!uploads) {
                        console.log('Upload file returned null, possible auth issue')
                        get().reset()
                        return null
                    }

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
                } catch (error) {
                    console.error('Error uploading file:', error)
                    // Reset store on fetch error as it might be auth-related
                    get().reset()
                    return null
                }
            },

            deleteUpload: async (fileId: string): Promise<UploadInfo[] | null> => {
                try {
                    const uploads = await redDeleteUpload(fileId)

                    // If uploads is null, it might indicate an auth issue
                    if (!uploads) {
                        console.log('Delete upload returned null, possible auth issue')
                        get().reset()
                        return null
                    }

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
                } catch (error) {
                    console.error('Error deleting upload:', error)
                    // Reset store on fetch error as it might be auth-related
                    get().reset()
                    return null
                }
            },

            renameFile: async (filename: string, name: string): Promise<UploadInfo[] | null> => {
                try {
                    const uploads = await redRenameFile(filename, name)

                    // If uploads are null, it might indicate an auth issue
                    if (!uploads) {
                        console.log('Rename file returned null, possible auth issue')
                        get().reset()
                        return null
                    }

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
                } catch (error) {
                    console.error('Error renaming file:', error)
                    // Reset store on fetch error as it might be auth-related
                    get().reset()
                    return null
                }
            },

            updateNumbers: (numbers: NumberInfo[]) => {
                set({numbers})
            },

            fetchMyIvr: async (): Promise<IvrOrder[] | null> => {
                try {
                    if (!get().ensureUserLoggedIn()) {
                        return null
                    }

                    const myIvr = await redGetMyIvr()

                    set((state) => ({
                        ...state,
                        myIvr: myIvr
                    }))

                    return myIvr
                } catch (error) {
                    console.error('Error fetching my IVR orders:', error)
                    return null
                }
            },

            fetchPaymentMethods: async (sum?: number): Promise<PaymentRegion[] | null> => {
                console.log('useClientStore: fetchPaymentMethods called with sum:', sum)
                const response = await redGetPaymentsMethods(sum)
                console.log('useClientStore: redGetPaymentsMethods response:', response)
                if (!response) {
                    console.log('useClientStore: response is null')
                    return null
                }

                // Use the response directly as it's already been processed in redGetPaymentsMethods
                const paymentMethods = response

                set(state => {
                    if (state.paymentMethods !== paymentMethods) {
                        console.log('useClientStore: updating state with paymentMethods')
                        return {
                            paymentMethods
                        }
                    }
                    console.log('useClientStore: state unchanged')
                    return state
                })

                return paymentMethods
            },

        }),
        {
            name: 'client-storage',
            storage: idbStorage,
            version: 3,
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
                        paymentMethods: null,
                        myIvr: null,
                    }
                }

                // Handle migration from version 2 to version 3
                if (version === 2 && isValidPersistedState(persistedState)) {
                    // If migrating from version 2, ensure all required fields exist
                    return {
                        balance: persistedState.balance ?? null,
                        profile: persistedState.profile ?? null,
                        transactions: persistedState.transactions ?? null,
                        numbers: persistedState.numbers ?? null,
                        uploads: persistedState.uploads ?? null,
                        paymentMethods: persistedState.paymentMethods ?? null,
                        myIvr: null,
                    }
                }

                // For any other version mismatches or invalid state, return a clean state
                return {
                    balance: null,
                    profile: null,
                    transactions: null,
                    numbers: null,
                    uploads: null,
                    paymentMethods: null,
                    myIvr: null,
                }
            },
            partialize: (state: ClientStore): PersistedClientState => ({
                profile: state.profile,
                transactions: state.transactions,
                numbers: state.numbers,
                uploads: state.uploads,
                balance: state.balance,
                paymentMethods: state.paymentMethods,
                myIvr: state.myIvr,
            }),
        }
    )
)
