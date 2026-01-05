import {create} from 'zustand'
import {persist} from 'zustand/middleware'
import {idbStorage} from '@/stores/idbStorage'

/**
 * Cart Store - UI State Only
 *
 * This store only manages UI state for cart item selection.
 * Cart data fetching is handled by TanStack Query hooks:
 * - useCart() - fetch cart items
 * - useAddToCart() - add item to cart
 * - useRemoveFromCart() - remove items from cart
 * - useBuyNumbers() - checkout
 */

interface CartStore {
    selectedItems: number[]
    selectItem: (id: number, select?: boolean) => void
    selectAll: (ids: number[]) => void
    clearSelection: () => void
    reset: () => void
}

// Define the persisted state type (only the data that gets stored)
type PersistedCartState = {
    selectedItems: number[]
}

// Type guard to check if the persisted state has the expected shape
function isValidPersistedCartState(state: unknown): state is Partial<PersistedCartState> {
    return state !== null && typeof state === 'object'
}

export const useCartStore = create<CartStore>()(
    persist(
        (set) => ({
            selectedItems: [],

            reset: () => {
                set({
                    selectedItems: [],
                })
            },

            clearSelection: () => {
                set({selectedItems: []})
            },

            selectAll: (ids: number[]) => {
                set({selectedItems: ids})
            },

            selectItem: (id: number, select: boolean = true) => {
                set(state => {
                    // Check if id is already in selectedItems
                    const isItemSelected = state.selectedItems.includes(id)

                    if (select && !isItemSelected) {
                        // Add item to selectedItems if select is true and not already selected
                        return {...state, selectedItems: [...state.selectedItems, id]}
                    } else if (!select && isItemSelected) {
                        // Remove item from selectedItems if select is false and it's selected
                        return {
                            ...state,
                            selectedItems: state.selectedItems.filter(itemId => itemId !== id)
                        }
                    }

                    // Return unchanged state if no changes needed
                    return state
                })
            }
        }), {
            name: 'cart-ui-storage',
            storage: idbStorage,
            version: 3,
            migrate: (persistedState: unknown, version: number): PersistedCartState => {
                // Handle migration from older versions
                if ((version === 1 || version === 2) && isValidPersistedCartState(persistedState)) {
                    return {
                        selectedItems: persistedState.selectedItems ?? [],
                    }
                }

                // For any other version mismatches or invalid state, return a clean state
                return {
                    selectedItems: [],
                }
            },
            partialize: (state: CartStore): PersistedCartState => ({
                selectedItems: state.selectedItems,
            }),
        }
    )
)
