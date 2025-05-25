'use client'
import React, {useEffect, useState} from 'react'
import {Button} from '@/components/ui/button'
import {PlusCircle} from '@phosphor-icons/react'
import {Drawer, DrawerTrigger} from '@/components/ui/drawer'
import Payment from '@/components/Payment'
import {useRouter, useSearchParams} from 'next/navigation'

export default function PaymentButton() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // State for controlling the sidebar
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Check for payment parameter in URL and open the sidebar if present
    useEffect(() => {
        if (searchParams) {
            const paymentParam = searchParams.get('payment')
            if (paymentParam === 'open') {
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
        <Drawer open={sidebarOpen} onOpenChange={handleSidebarChange} direction="left" snapPoints={[1]}>
            <DrawerTrigger asChild>
                <Button
                    variant="navIcon"
                    size="icon"
                    className="h-6 w-6 sm:h-8 sm:w-8"
                >
                    <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5"/>
                </Button>
            </DrawerTrigger>
            <Payment
                setSidebarOpenAction={handleSidebarChange}
            />
        </Drawer>
    )
}
