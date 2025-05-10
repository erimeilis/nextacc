'use client'
import React from 'react'
import {Button} from '@/components/ui/button'
import {CartItem} from '@/types/CartItem'
import {DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle} from '@/components/ui/drawer'
import {useTranslations} from 'next-intl'
import {Checkbox} from '@/components/ui/checkbox'

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

    return (
        <DrawerContent className="min-w-[20vw] w-fit max-w-[80vw] rounded-l-lg border-l fixed right-0 left-auto h-full inset-y-0 bottom-auto mt-0 top-0">
            {/* Hide the default drawer handle for the right-side drawer */}
            <style jsx global>{`
                .max-w-md > div:first-child {
                    display: none;
                }
            `}</style>
            <div className="flex flex-col h-full w-full">
                <DrawerHeader className="flex flex-row items-center justify-between">
                    <DrawerTitle> </DrawerTitle>
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
                                <li key={item.id} className="border-b border-border pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0">
                                    <div className="bg-muted rounded-md p-2">
                                        <div className="grid grid-cols-4 gap-1 text-sm">
                                            <div className="col-span-4 flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`checkbox-${item.id}`}
                                                        checked={selectedItems.includes(item.id)}
                                                        onCheckedChange={(checked) => {
                                                            setSelectedItemsAction(item.id, checked)
                                                        }}
                                                    />
                                                    <div>
                                                        <span className="text-xs text-muted-foreground mr-1">{t('number')}</span>
                                                        <span className="font-medium">{item.did}</span>
                                                    </div>
                                                </div>
                                                <div className="font-medium text-primary">${item.sum}</div>
                                            </div>

                                            <div className="col-span-4 flex justify-between items-center">
                                                <div>
                                                    <span className="text-xs text-muted-foreground mr-1">{t('where')}</span>
                                                    <span className="font-medium">{item.where_did}</span>
                                                </div>
                                                <div>
                                                    <span
                                                        className="text-xs text-muted-foreground mr-1">{t('month', {count: item.count_month !== undefined ? item.count_month : 1})}</span>
                                                    <span className="font-medium">{item.count_month}</span>
                                                </div>
                                            </div>

                                            {/* Display voice destination if available */}
                                            {item.voice && (
                                                <div className="col-span-4 text-xs mt-1">
                                                    <span className="text-muted-foreground mr-1">{t('voice')}:</span>
                                                    <span className="font-medium">{item.voice.destination}</span>
                                                </div>
                                            )}

                                            {/* Display SMS destination if available */}
                                            {item.sms && (
                                                <div className="col-span-4 text-xs mt-1">
                                                    <span className="text-muted-foreground mr-1">{t('sms')}:</span>
                                                    <span className="font-medium">{item.sms.destination}</span>
                                                </div>
                                            )}

                                            {/* Display date - optional */}
                                            <div className="col-span-4 text-xs text-muted-foreground mt-1">
                                                {item.date.split('T')[0]}
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

                <DrawerFooter>
                    <Button
                        className="w-full font-medium shadow-sm transition-all hover:shadow-md"
                        onClick={() => {
                            // Get selected numbers
                            const selectedNumbers = cartItems
                                .filter((item) => selectedItems[item.id])
                                .map(item => item.did)

                            // Show alert with selected numbers
                            if (selectedNumbers.length > 0) {
                                alert(`Selected numbers:\n${selectedNumbers.join('\n')}`)
                            } else {
                                alert('No numbers selected')
                            }
                        }}
                    >
                        {t('buy_now')}
                    </Button>
                </DrawerFooter>
            </div>
        </DrawerContent>
    )
}