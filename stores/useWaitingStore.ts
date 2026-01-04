import {create} from 'zustand'

import {MyWaitingNumberInfo} from '@/types/MyWaitingNumberInfo'
import {redDeleteWaitingDid, redGetMyWaitingDids} from '@/app/api/backend/waiting-dids'
import {persist} from 'zustand/middleware'
import {idbStorage} from '@/stores/idbStorage'

interface WaitingStore {
    waitingNumbers: MyWaitingNumberInfo[] | null

    fetchWaitingNumbers: () => Promise<MyWaitingNumberInfo[] | null>
    updateWaitingNumbers: (dids: MyWaitingNumberInfo[]) => Promise<MyWaitingNumberInfo[] | null>
    deleteWaitingNumber: (did: string) => Promise<MyWaitingNumberInfo[] | null>

    reset: () => void
}

// Define the persisted state type (only the data that gets stored)
type PersistedWaitingState = {
    waitingNumbers: MyWaitingNumberInfo[] | null
}

// Type guard to check if the persisted state has the expected shape
function isValidPersistedWaitingState(state: unknown): state is Partial<PersistedWaitingState> {
    return state !== null && typeof state === 'object'
}

export const useWaitingStore = create<WaitingStore>()(
    persist(
        (set) => ({
            waitingNumbers: [],

            reset: () => {
                set({
                    waitingNumbers: null,
                })
            },
            fetchWaitingNumbers: async (): Promise<MyWaitingNumberInfo[] | null> => {
                const waitingNumbers = await redGetMyWaitingDids()
                set(state => {
                    if (
                        state.waitingNumbers === undefined ||
                        state.waitingNumbers !== waitingNumbers
                    ) {
                        return {
                            waitingNumbers: waitingNumbers
                        }
                    }
                    return state
                })
                return waitingNumbers
            },
            updateWaitingNumbers: async (dids: MyWaitingNumberInfo[]): Promise<MyWaitingNumberInfo[] | null> => {
                set(state => {
                    if (
                        state.waitingNumbers === undefined ||
                        state.waitingNumbers !== dids
                    ) {
                        return {
                            waitingNumbers: dids
                        }
                    }
                    return state
                })
                return dids
            },
            deleteWaitingNumber: async (id: string): Promise<MyWaitingNumberInfo[] | null> => {
                const waitingNumbers = await redDeleteWaitingDid(id)
                set(state => {
                    if (
                        state.waitingNumbers === undefined ||
                        state.waitingNumbers !== waitingNumbers
                    ) {
                        return {
                            waitingNumbers: waitingNumbers
                        }
                    }
                    return state
                })
                return waitingNumbers
            }
        }), {
            name: 'waiting-dids-storage', // unique name
            storage: idbStorage,
            version: 3,
            migrate: (persistedState: unknown, version: number): PersistedWaitingState => {
                // Handle migration from version 2 to version 3
                if ((version === 2 || version === 1) && isValidPersistedWaitingState(persistedState)) {
                    return {
                        waitingNumbers: persistedState.waitingNumbers ?? null,
                    }
                }

                // For any other version mismatches or invalid state, return a clean state
                return {
                    waitingNumbers: null,
                }
            },
            partialize: (state: WaitingStore): PersistedWaitingState => ({
                waitingNumbers: state.waitingNumbers,
            }),
        }
    )
)
