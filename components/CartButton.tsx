'use client'
import React, {useEffect, useState} from 'react'
import {Button} from '@/components/ui/button'
import {ShoppingBag} from '@phosphor-icons/react'
import {Drawer, DrawerTrigger} from '@/components/ui/drawer'
import MiniCart from '@/components/MiniCart'
import {useCartStore} from '@/stores/useCartStore'
import Loader from '@/components/service/Loader'
import {CartItem} from '@/types/CartItem'

export default function CartButton() {
    const [cartState, setCartState] = useState<CartItem[]>([])
    const [totalItemsState, setTotalItemsState] = useState(0)
    const [totalPriceState, setTotalPriceState] = useState(0)
    const {cart, totalItems, totalPrice, selectedItems, isLoading, fetchData, selectItem} = useCartStore()
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

    if (totalItems === 0) {
        return null
    }

    return (
        <Drawer open={sidebarOpen} onOpenChange={setSidebarOpen} direction="right" snapPoints={[1]}>
            <DrawerTrigger asChild>
                {isLoading
                    ? <div className="flex items-center justify-center w-full px-10">
                        <Loader height={20}/>
                    </div>
                    : <Button
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
                setSidebarOpenAction={setSidebarOpen}
            />
        </Drawer>
    )
}
