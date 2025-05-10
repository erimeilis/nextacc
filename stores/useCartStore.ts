import {create} from 'zustand'

import {CartItem} from '@/types/CartItem'
import {getPersistState} from '@/utils/usePersistState'
import {getCart} from '@/app/api/redreport/cart'
import {persist} from 'zustand/middleware'

const persistentId = getPersistState<string>('persistentId', 'no-id')

// Define the interface of the Cart state
interface State {
    cart: CartItem[]
    totalItems: number
    totalPrice: number
    selectedItems: number[]
    isLoading: boolean
    error: unknown
}

// Define the interface of the actions that can be performed in the Cart
interface Actions {
    fetchData: () => Promise<void>
    updateData: (items: CartItem[]) => void
    selectItem: (id: number, select?: boolean) => void
}

// Initialize a default state
const INITIAL_STATE: State = {
    cart: [],
    totalItems: 0,
    totalPrice: 0,
    selectedItems: [],
    isLoading: false,
    error: null
}

// Create the store with Zustand, combining the status interface and actions
export const useCartStore = create(
    persist<State & Actions>(
        set => ({
            cart: INITIAL_STATE.cart,
            totalItems: INITIAL_STATE.totalItems,
            totalPrice: INITIAL_STATE.totalPrice,
            selectedItems: INITIAL_STATE.selectedItems,
            isLoading: INITIAL_STATE.isLoading,
            error: INITIAL_STATE.error,
            fetchData: async () => {
                try {
                    if (persistentId !== 'no-id') {
                        set({isLoading: true})
                        const items: CartItem[] = await getCart({uid: persistentId})
                        if (!items || items.length == 0) {
                            set({
                                cart: INITIAL_STATE.cart,
                                totalItems: INITIAL_STATE.totalItems,
                                totalPrice: INITIAL_STATE.totalPrice,
                                selectedItems: INITIAL_STATE.selectedItems,
                                isLoading: false
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
                            isLoading: false
                        })
                    }
                } catch (error) {
                    console.error('Failed to fetch cart data: ', error)
                    set({error, isLoading: false})
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
            name: 'cart-storage', // unic name
            // getStorage: () => sessionStorage, (optional) by default, the 'localStorage' is used
        }
    )
)