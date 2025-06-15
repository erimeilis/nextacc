'use client'
import React from 'react'
import ActionButton from '@/components/shared/ActionButton'
import {DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle} from '@/components/ui/drawer'
import {useTranslations} from 'next-intl'
import {useCartStore} from '@/stores/useCartStore'
import {useClientStore} from '@/stores/useClientStore'
import {WalletIcon} from '@phosphor-icons/react'

interface PaymentProps {
    setSidebarOpenAction: React.Dispatch<React.SetStateAction<boolean>>
}

export default function Payment({setSidebarOpenAction}: PaymentProps) {
    const t = useTranslations('cart')
    const p = useTranslations('profile')
    const {getBalance} = useClientStore()
    const {cart} = useCartStore()
    const balance = getBalance() || 0

    // Calculate total sum in cart
    const calculateCartTotal = () => {
        return cart.reduce((total, item) => total + (item.sum || 0), 0)
    }

    const cartTotal = calculateCartTotal()

    // Calculate recommended topup amount
    const recommendedTopup = Math.max(0, cartTotal - balance + 100)

    return (
        <DrawerContent
            className="w-full h-[80vh] sm:min-w-[20vw] sm:w-fit sm:max-w-[80vw] sm:rounded-r-lg sm:border-r sm:border-border/50 sm:fixed sm:left-0 sm:right-auto sm:h-full sm:inset-y-0 sm:bottom-auto sm:mt-0 sm:top-0">
            {/* Hide the default drawer handle for the left-side drawer on desktop */}
            <style jsx global>{`
                .max-w-md > div:first-child {
                    display: none;
                }
            `}</style>
            <div className="flex flex-col h-full w-full pb-9 sm:pb-2">
                <DrawerHeader className="flex flex-row items-center justify-between">
                    <DrawerTitle className="hidden"></DrawerTitle>
                    <DrawerClose onClick={() => setSidebarOpenAction(false)}/>
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
                    <div className="space-y-6">
                        <div className="bg-muted rounded-md p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">{p('balance')}:</span>
                                <span className="text-lg font-bold text-primary">${balance.toFixed(2)}</span>
                            </div>

                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">{t('cart_total')}:</span>
                                <span className="text-lg font-bold text-primary">${cartTotal.toFixed(2)}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{p('recommended_topup')}:</span>
                                <span className="text-lg font-bold text-primary">${recommendedTopup.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="bg-muted rounded-md p-4">
                            <p className="text-sm text-center mb-4">{p('topup_description')}</p>
                            <div className="flex justify-center">
                                <WalletIcon size={64} className="text-primary"/>
                            </div>
                        </div>
                    </div>
                </div>

                <DrawerFooter className="flex-column flex-wrap justify-between items-end px-4 py-8">
                    <div className="flex justify-start w-full">
                        <ActionButton
                            type="button"
                            style="pillow"
                            className="font-medium text-lg shadow-sm transition-all hover:shadow-md"
                            id="topup-balance"
                            onClick={() => {
                                alert(`Top up amount: $${recommendedTopup.toFixed(2)}`)
                            }}
                        >
                            {p('topup_now')}
                        </ActionButton>
                    </div>
                </DrawerFooter>
            </div>
        </DrawerContent>
    )
}
