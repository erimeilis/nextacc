import {create} from 'zustand'

import {CartItem} from '@/types/CartItem'
import {getPersistState} from '@/utils/usePersistState'
import {redGetCart} from '@/app/api/redreport/cart'
import {persist} from 'zustand/middleware'
import {idbStorage} from '@/stores/idbStorage'

// todo maybe better use Signals, think of it later

const persistentId = getPersistState<string>('persistentId', 'no-id')

interface CartStore {
    cart: CartItem[]
    totalItems: number
    totalPrice: number
    selectedItems: number[]

    fetchData: () => Promise<void>
    updateData: (items: CartItem[]) => void
    selectItem: (id: number, select?: boolean) => void
    reset: () => void
}

// Define the persisted state type (only the data that gets stored)
type PersistedCartState = {
    cart: CartItem[]
    totalItems: number
    totalPrice: number
    selectedItems: number[]
}

// Type guard to check if the persisted state has the expected shape
function isValidPersistedCartState(state: unknown): state is Partial<PersistedCartState> {
    return state !== null && typeof state === 'object'
}

export const useCartStore = create<CartStore>()(
    persist(
        (set) => ({
            cart: [],
            totalItems: 0,
            totalPrice: 0,
            selectedItems: [],

            reset: () => {
                set({
                    cart: [],
                    totalItems: 0,
                    totalPrice: 0,
                    selectedItems: [],
                })
            },

            fetchData: async () => {
                try {
                    if (persistentId !== 'no-id') {
                        const items: CartItem[] | null = await redGetCart({uid: persistentId})
                        if (!items || items.length == 0) {
                            set({
                                cart: [],
                                totalItems: 0,
                                totalPrice: 0,
                                selectedItems: [],
                            })
                            return
                        }

                        // Sort items by date in descending order
                        const sortedItems: CartItem[] = items.sort((a: CartItem, b: CartItem) =>
                            new Date(b.date).getTime() - new Date(a.date).getTime()
                        )

                        set({
                            cart: sortedItems,
                            totalItems: sortedItems.length,
                            totalPrice: sortedItems.reduce((sum, item) => sum + item.sum, 0),
                            selectedItems: sortedItems.map(item => item.id),
                        })
                    }
                } catch (error) {
                    console.error('Failed to fetch cart data: ', error)
                }
            },
            updateData: (items: CartItem[]) => {
                set(state => {
                    // Get IDs of all current cart items
                    const currentItemIds = state.cart.map(item => item.id)
                    // Get IDs of all new cart items
                    const newItemIds = items.map(item => item.id)
                    // Find items that are new (not in the current cart)
                    const newItems = newItemIds.filter(id => !currentItemIds.includes(id))
                    // Filter existing selectedItems to only include those present in the cart
                    // and add new items
                    const updatedSelectedItems = [
                        ...state.selectedItems.filter(id => newItemIds.includes(id)),
                        ...newItems
                    ]

                    return {
                        cart: items,
                        totalItems: items.length,
                        totalPrice: items.reduce((sum, item) => sum + item.sum, 0),
                        selectedItems: updatedSelectedItems
                    }
                })
            },
            selectItem: (id: number, select: boolean = true) => {
                set(state => {
                    // Check if an item with the given id exists in the cart
                    const itemExists = state.cart.some(item => item.id === id)

                    if (!itemExists) {
                        return state // Return the unchanged state if the item doesn't exist
                    }

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
            name: 'cart-storage', // unique name
            storage: idbStorage,
            version: 2,
            migrate: (persistedState: unknown, version: number): PersistedCartState => {
                // Handle migration from version 1 to version 2
                if (version === 1 && isValidPersistedCartState(persistedState)) {
                    return {
                        cart: persistedState.cart ?? [],
                        totalItems: persistedState.totalItems ?? 0,
                        totalPrice: persistedState.totalPrice ?? 0,
                        selectedItems: persistedState.selectedItems ?? [],
                    }
                }

                // For any other version mismatches or invalid state, return a clean state
                return {
                    cart: [],
                    totalItems: 0,
                    totalPrice: 0,
                    selectedItems: [],
                }
            },
            partialize: (state: CartStore): PersistedCartState => ({
                cart: state.cart,
                selectedItems: state.selectedItems,
                totalItems: state.totalItems,
                totalPrice: state.totalPrice,
            }),
        }
    )
)
