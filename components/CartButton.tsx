'use client'
import React, {useEffect, useState} from 'react'
import {Button} from '@/components/ui/button'
import {ShoppingBag} from '@phosphor-icons/react'
import {Drawer, DrawerTrigger} from '@/components/ui/drawer'
import MiniCart from '@/components/MiniCart'
import {useCartStore} from '@/stores/useCartStore'
import {CartItem} from '@/types/CartItem'
import {useRouter, useSearchParams} from 'next/navigation'

export default function CartButton() {
    const [cartState, setCartState] = useState<CartItem[]>([])
    const [totalItemsState, setTotalItemsState] = useState(0)
    const [totalPriceState, setTotalPriceState] = useState(0)
    const {cart, totalItems, totalPrice, selectedItems, fetchData, selectItem} = useCartStore()
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        fetchData().then()
    }, [fetchData])

    useEffect(() => {
        setCartState(cart)
        setTotalItemsState(totalItems)
        setTotalPriceState(totalPrice)
    }, [cart, totalItems, totalPrice])

    // State for controlling the sidebar
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Check for cart parameter in URL and open the sidebar if present
    useEffect(() => {
        if (searchParams) {
            const cartParam = searchParams.get('cart')
            if (cartParam === 'open') {
                setSidebarOpen(true)
            }
        }
    }, [searchParams])

    // Custom function to handle sidebar open/close and update URL
    const handleSidebarChange = (openState: boolean | ((prevState: boolean) => boolean)) => {
        // Determine the new open state
        const open = typeof openState === 'function'
            ? (openState as ((prevState: boolean) => boolean))(sidebarOpen)
            : openState

        setSidebarOpen(open)

        // Update URL based on sidebar state
        if (open) {
            // Add cart=open parameter to URL
            const url = new URL(window.location.href)
            url.searchParams.set('cart', 'open')
            router.push(url.pathname + url.search)
        } else {
            // Remove cart parameter from URL
            const url = new URL(window.location.href)
            url.searchParams.delete('cart')
            router.push(url.pathname + url.search)
        }
    }

    if (totalItems === 0) {
        return null
    }

    return (
        <Drawer open={sidebarOpen} onOpenChange={handleSidebarChange} direction="right" snapPoints={[1]}>
            <DrawerTrigger asChild>
                {<Button
                    variant="navIcon"
                    className="relative p-2"
                >
                    <span className="text-opacity-80 text-xs mr-1">${totalPriceState}</span>
                    <ShoppingBag size={24}/>
                    <span
                        className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        {totalItemsState}
                    </span>
                </Button>}
            </DrawerTrigger>
            <MiniCart
                cartItems={cartState}
                selectedItems={selectedItems}
                setSelectedItemsAction={selectItem}
                setSidebarOpenAction={handleSidebarChange}
            />
        </Drawer>
    )
}