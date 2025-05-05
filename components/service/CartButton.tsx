'use client'
import React, {useEffect, useState} from 'react'
import {Button} from '@/components/ui/button'
import {ShoppingBag} from '@phosphor-icons/react'
import {getCart} from '@/app/api/redreport/buy'
import {getPersistState} from '@/usePersistState'
import {Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger} from '@/components/ui/drawer'
import {useRouter, useSearchParams} from 'next/navigation'


export default function CartButton() {
    const [cartItems, setCartItems] = useState<Array<{ did: string, where_did: string, count_month: number, sum: number }>>([])
    const persistentId = getPersistState<string>('persistentId', 'no-id')
    const router = useRouter()
    const searchParams = useSearchParams()
    const search = searchParams && searchParams.size > 0 ? `?${searchParams.toString()}` : ''

    // State for controlling the sidebar
    const [sidebarOpen, setSidebarOpen] = useState(false)

    useEffect(() => {
        const fetchCartData = async () => {
            console.log('CartButton - persistentId:', persistentId)
            if (persistentId !== 'no-id') {
                const items = await getCart({uid: persistentId})
                console.log('CartButton - cart items:', items)
                setCartItems(items || [])
            }
        }

        fetchCartData()

        // Refresh cart data every 30 seconds
        const intervalId = setInterval(fetchCartData, 30000)

        return () => clearInterval(intervalId)
    }, [persistentId])

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
            <DrawerContent className="max-w-md rounded-l-lg border-l fixed right-0 left-auto h-full inset-y-0 bottom-auto mt-0 top-0">
                {/* Hide the default drawer handle for right-side drawer */}
                <style jsx global>{`
                    .max-w-md > div:first-child {
                        display: none;
                    }
                `}</style>
                <div className="flex flex-col h-full w-full">
                    <DrawerHeader className="flex flex-row items-center justify-between">
                        <DrawerTitle>Your Cart</DrawerTitle>
                        <DrawerClose onClick={() => setSidebarOpen(false)}/>
                    </DrawerHeader>

                    <div 
                        className="flex-1 overflow-y-auto px-4 pt-6"
                        style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'hsl(var(--primary)) hsl(var(--muted))',
                            maxHeight: 'calc(100vh - 120px)',
                            overflowY: 'auto'
                        }}
                    >
                        {cartItems.length > 0 ? (
                            <ul className="space-y-1">
                                {cartItems.map((item, index) => (
                                    <li key={index} className="border-b border-border pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0">
                                        <div className="bg-muted rounded-md p-2">
                                            <div className="grid grid-cols-4 gap-1 text-sm">
                                                <div className="col-span-4 flex justify-between items-center">
                                                    <div>
                                                        <span className="text-xs uppercase text-muted-foreground mr-1">ID:</span>
                                                        <span className="font-medium">{item.did}</span>
                                                    </div>
                                                    <div className="font-medium text-primary">${item.sum}</div>
                                                </div>

                                                <div className="col-span-4 flex justify-between items-center">
                                                    <div>
                                                        <span className="text-xs uppercase text-muted-foreground mr-1">Source:</span>
                                                        <span className="font-medium">{item.where_did}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs uppercase text-muted-foreground mr-1">Monthly:</span>
                                                        <span className="font-medium">{item.count_month}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Your cart is empty</p>
                        )}
                    </div>

                    <DrawerFooter>
                        <Button
                            className="w-full font-medium shadow-sm transition-all hover:shadow-md"
                            onClick={() => {
                                setSidebarOpen(false)
                                router.push('/cart' + search)
                            }}
                        >
                            View Cart
                        </Button>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
