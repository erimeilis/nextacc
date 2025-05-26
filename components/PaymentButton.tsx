'use client'
import React, {useEffect, useState} from 'react'
import {Button} from '@/components/ui/button'
import {PlusCircleIcon} from '@phosphor-icons/react'
import {Drawer} from '@/components/ui/drawer'
import Payment from '@/components/Payment'
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

    // State for controlling the sidebar
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Check for payment parameter in the URL and open/close the sidebar accordingly
    useEffect(() => {
        if (searchParams) {
            const paymentParam = searchParams.get('payment')
            if (paymentParam === 'open') {
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
            // Add payment=open parameter to URL
            const url = new URL(window.location.href)
            url.searchParams.set('payment', 'open')
            router.push(url.pathname + url.search)
        } else {
            // Remove payment parameter from URL
            const url = new URL(window.location.href)
            url.searchParams.delete('payment')
            router.push(url.pathname + url.search)
        }
    }

    return (
        <>
            <Button
                variant="navIcon"
                size="icon"
                className="h-6 w-6 sm:h-8 sm:w-8"
                data-drawer-trigger="payment"
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleSidebarChange(!sidebarOpen)
                }}
            >
                <PlusCircleIcon className="h-4 w-4 sm:h-5 sm:w-5"/>
            </Button>

            <Drawer open={sidebarOpen} onOpenChange={handleSidebarChange} direction={drawerDirection} snapPoints={[1]}>
                <Payment
                    setSidebarOpenAction={handleSidebarChange}
                />
            </Drawer>
        </>
    )
}
