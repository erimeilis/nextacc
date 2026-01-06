'use client'
import React, {useEffect, useState} from 'react'
import {Button} from '@/components/ui/primitives/Button'
import {ShoppingBagIcon} from '@phosphor-icons/react'
import {Drawer} from '@/components/ui/primitives/Drawer'
import MiniCart from '@/components/drawers/MiniCart'
import {useRouter, useSearchParams} from 'next/navigation'
import {useCart} from '@/hooks/queries/use-cart'
import {getPersistState} from '@/utils/usePersistState'

export default function CartButton() {
    const persistentId = getPersistState<string>('persistentId', 'no-id')
    const {data: cartItems = []} = useCart(persistentId)
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

    // Derive sidebar open state directly from URL (React 19 pattern - no useEffect sync)
    const sidebarOpen = searchParams?.get('cart') === 'open'

    // Custom function to handle sidebar open/close and update URL
    const handleSidebarChange = (openState: boolean | ((prevState: boolean) => boolean)) => {
        // Determine the new open state
        const open = typeof openState === 'function'
            ? (openState as ((prevState: boolean) => boolean))(sidebarOpen)
            : openState

        // Update URL based on sidebar state (state is derived from URL, no setState needed)
        const url = new URL(window.location.href)
        if (open) {
            url.searchParams.set('cart', 'open')
        } else {
            url.searchParams.delete('cart')
        }
        router.push(url.pathname + url.search)
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
            >
                <MiniCart
                    setSidebarOpenAction={handleSidebarChange}
                />
            </Drawer>
        </>
    )
}
