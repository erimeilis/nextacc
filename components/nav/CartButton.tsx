'use client'
import React, {useEffect, useState} from 'react'
import {Button} from '@/components/ui/Button'
import {ShoppingBagIcon} from '@phosphor-icons/react'
import {Drawer} from '@/components/ui/Drawer'
import MiniCart from '@/components/drawers/MiniCart'
import {useCartStore} from '@/stores/useCartStore'
import {useRouter, useSearchParams} from 'next/navigation'
import {useCart} from '@/hooks/queries/use-cart'
import {getPersistState} from '@/utils/usePersistState'

export default function CartButton() {
    const persistentId = getPersistState<string>('persistentId', 'no-id')
    const {data: cartItems = []} = useCart(persistentId)
    const {selectedItems, selectItem} = useCartStore()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [drawerDirection, setDrawerDirection] = useState<'bottom' | 'right'>('right')

    // Calculate totals from cart data
    const totalItems = cartItems.length
    const totalPrice = cartItems.reduce((sum, item) => sum + (item.sum || 0), 0)

    // Effect to handle a responsive direction
    useEffect(() => {
        const handleResize = () => {
            setDrawerDirection(window.innerWidth < 640 ? 'bottom' : 'right')
        }

        // Set the initial direction
        handleResize()

        // Add event listener for window resize
        window.addEventListener('resize', handleResize)

        // Cleanup
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // State for controlling the sidebar
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Check for cart parameter in URL and open/close the sidebar accordingly
    useEffect(() => {
        if (searchParams) {
            const cartParam = searchParams.get('cart')
            if (cartParam === 'open') {
                setSidebarOpen(true)
            } else {
                setSidebarOpen(false)
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
        <>
            <Button
                variant="navIcon"
                className="relative p-2"
                data-drawer-trigger="cart"
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleSidebarChange(!sidebarOpen)
                }}
            >
                <span className="text-opacity-80 text-xs mr-1">${totalPrice.toFixed(2)}</span>
                <ShoppingBagIcon size={24}/>
                <span
                    className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {totalItems}
                </span>
            </Button>

            <Drawer
                open={sidebarOpen}
                onOpenChange={handleSidebarChange}
                direction={drawerDirection}
                snapPoints={[1]}
            >
                <MiniCart
                    cartItems={cartItems}
                    selectedItems={selectedItems}
                    setSelectedItemsAction={selectItem}
                    setSidebarOpenAction={handleSidebarChange}
                />
            </Drawer>
        </>
    )
}
