'use client'
import React, {useEffect, useState} from 'react'
import {Button} from '@/components/ui/button'
import {ShoppingBag} from '@phosphor-icons/react'
import {getCart} from '@/app/api/redreport/cart'
import {getPersistState} from '@/usePersistState'
import {Drawer, DrawerTrigger} from '@/components/ui/drawer'
import {useTranslations} from 'next-intl'
import {CartItem} from '@/types/CartItem'
import MiniCart from '@/components/MiniCart'

export default function CartButton() {
    const t = useTranslations('cart')
    const [cartItems, setCartItems] = useState<CartItem[]>([])
    const persistentId = getPersistState<string>('persistentId', 'no-id')

    // State for controlling the sidebar
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // State for tracking selected numbers (all selected by default)
    const [selectedItems, setSelectedItems] = useState<{ [key: string]: boolean }>({})

    // Track if this is the first load
    const [isInitialLoad, setIsInitialLoad] = useState(true)

    // Effect 1: Only fetch cart data and update cartItems
    useEffect(() => {
        const fetchCartData = async () => {
            try {
                if (persistentId !== 'no-id') {
                    const items = await getCart({uid: persistentId})
                    // Process items to ensure they have dates or add default dates
                    const processedItems = (items || []).map((item: Partial<CartItem>) => ({
                        ...item,
                        date: item.date || new Date().toISOString()
                    }))

                    // Sort items by date in descending order
                    const sortedItems = processedItems.sort((a: CartItem, b: CartItem) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )

                    setCartItems(sortedItems)
                }
            } catch (error) {
                console.error('Failed to fetch cart data: ', error)
            }
        }

        fetchCartData().then()
    }, [persistentId]) // Only depends on persistentId

    // Effect 2: Update selectedItems when cartItems changes or on initial load
    useEffect(() => {
        if (isInitialLoad && cartItems.length > 0) {
            // Initialize all items as selected by default
            const initialSelectedState: { [key: string]: boolean } = {}
            cartItems.forEach((item: CartItem) => {
                initialSelectedState[item.id] = true
            })
            setSelectedItems(initialSelectedState)
            setIsInitialLoad(false)
        } else if (!isInitialLoad && cartItems.length > 0) {
            // Only add new items as selected by default
            setSelectedItems(prevSelectedItems => {
                const updatedSelectedState = {...prevSelectedItems}
                // Only add new items as selected by default
                cartItems.forEach((item: CartItem) => {
                    if (updatedSelectedState[item.id] === undefined) {
                        updatedSelectedState[item.id] = true
                    }
                })
                return updatedSelectedState
            })
        }
    }, [cartItems, isInitialLoad]) // Remove selectedItems from dependencies

    if (cartItems.length === 0) {
        return null
    }

    return (
        <Drawer open={sidebarOpen} onOpenChange={setSidebarOpen} direction="right" snapPoints={[1]}>
            <DrawerTrigger asChild>
                <Button
                    variant="ghost"
                    className="relative p-2 text-white hover:bg-transparent"
                >
                    <ShoppingBag size={24} className="text-white"/>
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        {cartItems.length}
                    </span>
                </Button>
            </DrawerTrigger>
            <MiniCart
                cartItems={cartItems}
                selectedItems={selectedItems}
                setSelectedItemsAction={setSelectedItems}
                setSidebarOpenAction={setSidebarOpen}
            />
        </Drawer>
    )
}