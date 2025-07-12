'use client'
import React, {SyntheticEvent, useState} from 'react'
import ActionButton from '@/components/shared/ActionButton'
import {CartItem} from '@/types/CartItem'
import {DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle} from '@/components/ui/Drawer'
import {useTranslations} from 'next-intl'
import {Checkbox} from '@/components/ui/Checkbox'
import Show from '@/components/service/Show'
import {useCartStore} from '@/stores/useCartStore'
import {useClientStore} from '@/stores/useClientStore'
import {getPersistState} from '@/utils/usePersistState'
import {redRemoveFromCart} from '@/app/api/redreport/cart'
import {ChatCircleTextIcon, HeadsetIcon, PhoneIcon, XIcon} from '@phosphor-icons/react'

interface MiniCartProps {
    cartItems: CartItem[]
    selectedItems: number[]
    setSelectedItemsAction: (id: number, select?: boolean) => void
    setSidebarOpenAction: React.Dispatch<React.SetStateAction<boolean>>
}

export default function MiniCart({
                                     cartItems,
                                     selectedItems,
                                     setSelectedItemsAction,
                                     setSidebarOpenAction
                                 }: MiniCartProps) {
    const t = useTranslations('cart')
    const [loadingButton, setLoadingButton] = useState<string | null>(null)
    const persistentId = getPersistState<string>('persistentId', 'no-id')
    const {updateData} = useCartStore()
    const {getBalance} = useClientStore()
    const balance = getBalance()

    // Calculate total sum of selected items
    const calculateTotal = () => {
        return selectedItems.reduce((total, itemId) => {
            const item = cartItems.find(item => item.id === itemId)
            return total + (item?.sum || 0)
        }, 0)
    }

    const cartTotal = calculateTotal()
    const isBalanceInsufficient = balance !== null && cartTotal > balance

    const handleRemoveFromCart = async (e?: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        if (e) e.preventDefault()
        // Set the button ID for loading state
        setLoadingButton('remove')
        try {
            if (selectedItems && selectedItems.length > 0) {
                const data = await redRemoveFromCart({
                    uid: persistentId,
                    id: selectedItems
                })
                if (data) updateData(data)
            }
        } catch (error) {
            console.error('Error removing from cart:', error)
        } finally {
            setLoadingButton(null)
        }
    }

    const handleRemoveSingleItem = async (itemId: number) => {
        try {
            const data = await redRemoveFromCart({
                uid: persistentId,
                id: [itemId]
            })
            if (data) updateData(data)
        } catch (error) {
            console.error('Error removing item from cart:', error)
        }
    }

    return (
        <DrawerContent
            className="w-full h-[80vh]
            sm:min-w-[40vw] md:min-w-[20vw]
            md:w-fit sm:max-w-[80vw]
            sm:rounded-l-lg sm:border-l sm:border-border/50 sm:fixed sm:right-0 sm:left-auto sm:h-full sm:inset-y-0 sm:bottom-auto sm:mt-0 sm:top-0">
            {/* Hide the default drawer handle for the right-side drawer on desktop */}
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
                    {cartItems.length > 0 ? (
                        <ul className="space-y-1">
                            {cartItems.map((item) => (
                                <li key={item.id}
                                    className={`pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0 ${!selectedItems.includes(item.id) ? 'opacity-70' : ''}`}>
                                    <div className="bg-muted rounded-md p-2">
                                        <div className="grid grid-cols-[auto_1fr_auto] gap-3 text-sm">
                                            {/* Checkbox in its own column, vertically centered */}
                                            <div className="flex items-center justify-center p-2" onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    id={`checkbox-${item.id}`}
                                                    checked={selectedItems.includes(item.id)}
                                                    onCheckedChange={(checked) => {
                                                        setSelectedItemsAction(item.id, checked)
                                                    }}
                                                    className="mt-1"
                                                />
                                            </div>

                                            <div className="flex flex-col pb-2">
                                                {/* Number and price as dominant information */}
                                                <div className="flex justify-between items-center mb-1">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-md font-bold">{item.did}</span>
                                                        {item.did_info?.voice && <PhoneIcon weight="fill" className="text-muted-foreground" size={16}/>}
                                                        {item.did_info?.sms && <ChatCircleTextIcon weight="fill" className="text-muted-foreground" size={16}/>}
                                                        {item.did_info?.toll_free && <HeadsetIcon weight="fill" className="text-muted-foreground" size={16}/>}
                                                    </div>
                                                    <span className="text-md font-bold text-primary">${item.sum}</span>
                                                </div>

                                                {/* Secondary information with smaller text */}
                                                <div className="flex justify-between items-center text-xs">
                                                    <div>
                                                        <span className="text-muted-foreground mr-1">{t('where')}</span>
                                                        <span className="font-medium">{item.where_did}</span>
                                                    </div>
                                                    <div>
                                                        <span
                                                            className="text-muted-foreground mr-1">{t('month', {count: item.count_month !== undefined ? item.count_month : 1})}</span>
                                                        <span className="font-medium">{item.count_month}</span>
                                                    </div>
                                                </div>

                                                {/* Display voice destination if available */}
                                                {item.voice && (
                                                    <div className="text-xs mt-1">
                                                        <span className="text-muted-foreground mr-1">{t('voice')}:</span>
                                                        <span className="font-medium">{item.voice.destination}</span>
                                                    </div>
                                                )}

                                                {/* Display SMS destination if available */}
                                                {item.sms && (
                                                    <div className="text-xs mt-1">
                                                        <span className="text-muted-foreground mr-1">{t('sms')}:</span>
                                                        <span className="font-medium">{item.sms.destination}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Delete button */}
                                            <div className="flex items-center justify-center p-1" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleRemoveSingleItem(item.id).then()
                                                    }}
                                                    className="flex items-center justify-center w-4 h-4 rounded-full bg-transparent text-red-700 hover:text-red-600 transition-all duration-300"
                                                    aria-label="Remove item"
                                                >
                                                    <XIcon size={16} weight="bold"/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>{t('empty')}</p>
                    )}
                </div>

                <DrawerFooter className="flex-column flex-wrap justify-between items-end px-4 py-8">
                    <Show when={(selectedItems.length > 0)}
                          fallback={<div className="w-full text-center">{t('select_to_proceed')}</div>}>
                        <div className="w-full mb-4">
                            <div className="flex justify-end items-center">
                                <span className="text-sm font-medium mr-2">{t('cart_total')}:</span>
                                <span className={`text-lg font-bold ${isBalanceInsufficient ? 'text-red-500' : 'text-primary'}`}>
                                    ${cartTotal.toFixed(2)}
                                </span>
                            </div>
                            {isBalanceInsufficient && (
                                <p className="text-xs text-red-500 mt-1 text-right">
                                    {t('insufficient_balance')}
                                </p>
                            )}
                        </div>
                        <ActionButton
                            type="button"
                            style="pillow"
                            className="font-medium text-lg shadow-sm transition-all hover:shadow-md"
                            id="buy-from-cart"
                            onClick={(e) => {
                                e.stopPropagation()
                                // Show alert with selected numbers
                                if (selectedItems.length > 0) {
                                    alert(`Selected numbers:\n${selectedItems.join('\n')}`)
                                } else {
                                    alert('No numbers selected')
                                }
                            }}
                        >
                            {t('buy_now')}
                        </ActionButton>
                        <ActionButton
                            type="button"
                            style="line"
                            className="text-xs transition-all"
                            id="remove"
                            loading={loadingButton === 'remove'}
                            onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveFromCart().then()
                            }}
                        >
                            {t('remove_selected')}
                        </ActionButton>
                    </Show>
                </DrawerFooter>
            </div>
        </DrawerContent>
    )
}
