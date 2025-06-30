import {create} from 'zustand'

import {MyWaitingNumberInfo} from '@/types/MyWaitingNumberInfo'
import {getPersistState} from '@/utils/usePersistState'
import {redGetMyWaitingDids} from '@/app/api/redreport/waiting-dids'
import {persist} from 'zustand/middleware'
import {idbStorage} from '@/stores/idbStorage'

const persistentId = getPersistState<string>('persistentId', 'no-id')

interface WaitingDidsStore {
    waitingDids: MyWaitingNumberInfo[]
    totalItems: number
    totalMonthlyCost: number
    selectedDids: string[]
    isLoading: boolean

    fetchData: () => Promise<void>
    updateData: (items: MyWaitingNumberInfo[]) => void
    selectDid: (did: string, select?: boolean) => void
    reset: () => void
}

export const useWaitingDidsStore = create<WaitingDidsStore>()(
    persist(
        (set) => ({
            waitingDids: [],
            totalItems: 0,
            totalMonthlyCost: 0,
            selectedDids: [],
            isLoading: false,

            reset: () => {
                set({
                    waitingDids: [],
                    totalItems: 0,
                    totalMonthlyCost: 0,
                    selectedDids: [],
                    isLoading: false,
                })
            },

            fetchData: async () => {
                try {
                    set({ isLoading: true })
                    if (persistentId !== 'no-id') {
                        const items: MyWaitingNumberInfo[] | null = await redGetMyWaitingDids()
                        if (!items || items.length == 0) {
                            set({
                                waitingDids: [],
                                totalItems: 0,
                                totalMonthlyCost: 0,
                                selectedDids: [],
                                isLoading: false,
                            })
                            return
                        }

                        // Sort items by DID
                        const sortedItems: MyWaitingNumberInfo[] = items.sort((a: MyWaitingNumberInfo, b: MyWaitingNumberInfo) =>
                            a.did.localeCompare(b.did)
                        )

                        set({
                            waitingDids: sortedItems,
                            totalItems: sortedItems.length,
                            totalMonthlyCost: sortedItems.reduce((sum, item) => sum + item.fix_rate, 0),
                            selectedDids: [],
                            isLoading: false,
                        })
                    }
                } catch (error) {
                    console.error('Failed to fetch waiting DIDs data: ', error)
                    set({ isLoading: false })
                }
            },
            updateData: (items: MyWaitingNumberInfo[]) => {
                set(state => {
                    // Get DIDs of all current waiting DIDs
                    const currentDids = state.waitingDids.map(item => item.did)
                    // Get DIDs of all new waiting DIDs
                    const newDids = items.map(item => item.did)
                    // Find DIDs that are new (not in the current list)
                    const newItems = newDids.filter(did => !currentDids.includes(did))
                    // Filter existing selectedDids to only include those present in the list
                    // and add new items
                    const updatedSelectedDids = [
                        ...state.selectedDids.filter(did => newDids.includes(did)),
                        ...newItems
                    ]

                    return {
                        waitingDids: items,
                        totalItems: items.length,
                        totalMonthlyCost: items.reduce((sum, item) => sum + item.fix_rate, 0),
                        selectedDids: updatedSelectedDids
                    }
                })
            },
            selectDid: (did: string, select: boolean = true) => {
                set(state => {
                    // Check if a DID with the given id exists in the waitingDids
                    const didExists = state.waitingDids.some(item => item.did === did)

                    if (!didExists) {
                        return state // Return the unchanged state if the DID doesn't exist
                    }

                    // Check if DID is already in selectedDids
                    const isDidSelected = state.selectedDids.includes(did)

                    if (select && !isDidSelected) {
                        // Add DID to selectedDids if select is true and not already selected
                        return {...state, selectedDids: [...state.selectedDids, did]}
                    } else if (!select && isDidSelected) {
                        // Remove DID from selectedDids if select is false and it's selected
                        return {
                            ...state,
                            selectedDids: state.selectedDids.filter(itemDid => itemDid !== did)
                        }
                    }

                    // Return unchanged state if no changes needed
                    return state
                })
            }
        }), {
            name: 'waiting-dids-storage', // unique name
            storage: idbStorage,
            version: 1,
            partialize: (state: WaitingDidsStore) => ({
                waitingDids: state.waitingDids,
                selectedDids: state.selectedDids,
                totalItems: state.totalItems,
                totalMonthlyCost: state.totalMonthlyCost,
            }),
            merge: (persistedState, currentState) => {
                const persisted = persistedState as Partial<WaitingDidsStore> || {}
                return {
                    ...currentState,
                    waitingDids:
                        persisted.waitingDids && Object.keys(persisted.waitingDids).length > 0
                            ? persisted.waitingDids
                            : currentState.waitingDids,
                    selectedDids:
                        persisted.selectedDids && Object.keys(persisted.selectedDids).length > 0
                            ? persisted.selectedDids
                            : currentState.selectedDids,
                    totalItems:
                        persisted.totalItems ? persisted.totalItems : currentState.totalItems,
                    totalMonthlyCost:
                        persisted.totalMonthlyCost ? persisted.totalMonthlyCost : currentState.totalMonthlyCost,
                }
            },
        }
    )
)
