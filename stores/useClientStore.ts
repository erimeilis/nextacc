import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { idbStorage } from '@/stores/idbStorage'

/**
 * Minimal client store for UI state only.
 * All data fetching and mutations are now handled by TanStack Query.
 *
 * This store only manages:
 * - Demo session state (isDemoSession)
 * - Reset functionality for logout
 */

interface ClientStore {
    // Demo session state
    isDemoSession: boolean
    setDemoSession: (isDemo: boolean) => void

    // Reset function for logout
    reset: () => void

    // Legacy compatibility - check if user is in demo mode
    isDemoMode: () => boolean
}

// Define the persisted state type (only the data that gets stored)
type PersistedClientState = {
    isDemoSession: boolean
}

// Type guard to check if the persisted state has the expected shape
function isValidPersistedState(state: unknown): state is Partial<PersistedClientState> {
    return state !== null && typeof state === 'object'
}

export const useClientStore = create<ClientStore>()(
    persist(
        (set, get) => ({
            // Demo session state
            isDemoSession: false,

            setDemoSession: (isDemo: boolean) => {
                console.log('Setting demo session:', isDemo)
                set({ isDemoSession: isDemo })
            },

            reset: () => {
                console.log('Resetting client store')
                set({
                    isDemoSession: false,
                })
            },

            isDemoMode: () => {
                return get().isDemoSession
            },
        }),
        {
            name: 'client-store',
            storage: idbStorage,
            partialize: (state): PersistedClientState => ({
                isDemoSession: state.isDemoSession,
            }),
            merge: (persistedState, currentState) => {
                if (!isValidPersistedState(persistedState)) {
                    return currentState
                }
                return {
                    ...currentState,
                    isDemoSession: persistedState.isDemoSession ?? currentState.isDemoSession,
                }
            },
        }
    )
)
