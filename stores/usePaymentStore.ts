import {create} from 'zustand'
import {persist} from 'zustand/middleware'
import {idbStorage} from '@/stores/idbStorage'
import {PaymentRegion} from '@/types/PaymentTypes'
import {redGetPaymentsMethods} from '@/app/api/redreport/payments'

interface PaymentStore {
    paymentMethods: PaymentRegion[] | null

    fetchPaymentMethods: (sum?: number) => Promise<PaymentRegion[] | null>

    reset: () => void
}

// Define the persisted state type (only the data that gets stored)
type PersistedPaymentState = {
    paymentMethods: PaymentRegion[] | null
}

// Type guard to check if the persisted state has the expected shape
function isValidPersistedPaymentState(state: unknown): state is Partial<PersistedPaymentState> {
    return state !== null && typeof state === 'object'
}

export const usePaymentStore = create<PaymentStore>()(
    persist(
        (set) => ({
            paymentMethods: null,

            reset: () => {
                set({
                    paymentMethods: null,
                })
            },
            fetchPaymentMethods: async (sum?: number): Promise<PaymentRegion[] | null> => {
                console.log('usePaymentStore: fetchPaymentMethods called with sum:', sum)
                const response = await redGetPaymentsMethods(sum)
                console.log('usePaymentStore: redGetPaymentsMethods response:', response)
                if (!response) {
                    console.log('usePaymentStore: response is null')
                    return null
                }

                // Use the response directly as it's already been processed in redGetPaymentsMethods
                const paymentMethods = response

                set(state => {
                    if (state.paymentMethods !== paymentMethods) {
                        console.log('usePaymentStore: updating state with paymentMethods')
                        return {
                            paymentMethods
                        }
                    }
                    console.log('usePaymentStore: state unchanged')
                    return state
                })

                return paymentMethods
            }
        }), {
            name: 'payment-storage', // unique name
            storage: idbStorage,
            version: 2,
            migrate: (persistedState: unknown, version: number): PersistedPaymentState => {
                // Handle migration from version 0 to version 2
                if (version === 0 && isValidPersistedPaymentState(persistedState)) {
                    return {
                        paymentMethods: persistedState.paymentMethods ?? null,
                    }
                }

                // Handle migration from version 1 to version 2
                if (version === 1 && isValidPersistedPaymentState(persistedState)) {
                    return {
                        paymentMethods: persistedState.paymentMethods ?? null,
                    }
                }

                return {
                    paymentMethods: null,
                }
            },
            partialize: (state: PaymentStore): PersistedPaymentState => ({
                paymentMethods: state.paymentMethods,
            }),
        }
    )
)
