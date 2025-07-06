import {create} from 'zustand'

import {persist} from 'zustand/middleware'
import {idbStorage} from '@/stores/idbStorage'
import {Ivr, IvrEffect, IvrMusic} from '@/types/IvrTypes'
import {redGetIvr} from '@/app/api/redreport/ivr'

interface IvrStore {
    ivr: Ivr[] | null
    ivrMusic: IvrMusic[] | null
    ivrEffects: IvrEffect[] | null

    fetchIvr: () => Promise<{
        ivr: Ivr[] | null,
        ivrMusic: IvrMusic[] | null,
        ivrEffects: IvrEffect[] | null
    } | null>

    reset: () => void
}

// Define the persisted state type (only the data that gets stored)
type PersistedIvrState = {
    ivr: Ivr[] | null
    ivrMusic: IvrMusic[] | null
    ivrEffects: IvrEffect[] | null
}

// Type guard to check if the persisted state has the expected shape
function isValidPersistedIvrState(state: unknown): state is Partial<PersistedIvrState> {
    return state !== null && typeof state === 'object'
}

export const useIvrStore = create<IvrStore>()(
    persist(
        (set) => ({
            ivr: null,
            ivrMusic: null,
            ivrEffects: null,

            reset: () => {
                set({
                    ivr: null,
                    ivrMusic: null,
                    ivrEffects: null,
                })
            },
            fetchIvr: async (): Promise<{
                ivr: Ivr[] | null,
                ivrMusic: IvrMusic[] | null,
                ivrEffects: IvrEffect[] | null
            } | null> => {
                const response = await redGetIvr()
                if (!response) {
                    return null
                }
                
                const { ivr, ivrmusic, ivreffects } = response.data
                
                set(state => {
                    if (
                        state.ivr !== ivr ||
                        state.ivrMusic !== ivrmusic ||
                        state.ivrEffects !== ivreffects
                    ) {
                        return {
                            ivr,
                            ivrMusic: ivrmusic,
                            ivrEffects: ivreffects
                        }
                    }
                    return state
                })
                
                return {
                    ivr,
                    ivrMusic: ivrmusic,
                    ivrEffects: ivreffects
                }
            }
        }), {
            name: 'ivr-storage', // unique name
            storage: idbStorage,
            version: 1,
            migrate: (persistedState: unknown, version: number): PersistedIvrState => {
                // For any version mismatches or invalid state, return a clean state
                if (version === 0 && isValidPersistedIvrState(persistedState)) {
                    return {
                        ivr: persistedState.ivr ?? null,
                        ivrMusic: persistedState.ivrMusic ?? null,
                        ivrEffects: persistedState.ivrEffects ?? null,
                    }
                }

                return {
                    ivr: null,
                    ivrMusic: null,
                    ivrEffects: null,
                }
            },
            partialize: (state: IvrStore): PersistedIvrState => ({
                ivr: state.ivr,
                ivrMusic: state.ivrMusic,
                ivrEffects: state.ivrEffects,
            }),
        }
    )
)
