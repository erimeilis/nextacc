'use client'
import React, {useEffect, useState} from 'react'
import {Button} from '@/components/ui/primitives/Button'
import {PlusCircleIcon} from '@phosphor-icons/react'
import {Drawer} from '@/components/ui/primitives/Drawer'
import Payment from '@/components/drawers/Payment'
import {useRouter, useSearchParams} from 'next/navigation'

export default function PaymentButton() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [drawerDirection, setDrawerDirection] = useState<'bottom' | 'left'>('left')

    // Effect to handle a responsive direction
    useEffect(() => {
        const handleResize = () => {
            setDrawerDirection(window.innerWidth < 640 ? 'bottom' : 'left')
        }

        // Set the initial direction
        handleResize()

        // Add event listener for window resize
        window.addEventListener('resize', handleResize)

        // Cleanup
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Derive sidebar open state directly from URL (React 19 pattern - no useEffect sync)
    const sidebarOpen = searchParams?.get('payment') === 'open'

    // Custom function to handle sidebar open/close and update URL
    const handleSidebarChange = (openState: boolean | ((prevState: boolean) => boolean)) => {
        // Determine the new open state
        const open = typeof openState === 'function'
            ? (openState as ((prevState: boolean) => boolean))(sidebarOpen)
            : openState

        // Update URL based on sidebar state (state is derived from URL, no setState needed)
        const url = new URL(window.location.href)
        if (open) {
            url.searchParams.set('payment', 'open')
        } else {
            url.searchParams.delete('payment')
        }
        router.push(url.pathname + url.search)
    }

    return (
        <>
            <Button
                variant="navIcon"
                size="icon"
                className="h-8 w-8"
                data-drawer-trigger="payment"
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleSidebarChange(!sidebarOpen)
                }}
            >
                <PlusCircleIcon className="h-6 w-6"/>
            </Button>

            <Drawer open={sidebarOpen} onOpenChange={handleSidebarChange} direction={drawerDirection} snapPoints={[1]}>
                <Payment
                    setSidebarOpenAction={handleSidebarChange}
                />
            </Drawer>
        </>
    )
}
