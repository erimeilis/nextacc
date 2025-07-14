'use client'
import React, {useEffect, useState} from 'react'
import {useTranslations} from 'next-intl'
import {Button} from '@/components/ui/Button'
import {Ivr, IvrEffect, IvrMusic, IvrOrder} from '@/types/IvrTypes'
import {useClientStore} from '@/stores/useClientStore'
import {useIvrStore} from '@/stores/useIvrStore'
import {Table, TableBody, TableCell, TableRow} from '@/components/ui/Table'
import {InfoIcon} from '@phosphor-icons/react'
import {Boolean} from '@/components/ui/Boolean'
import {FormattedDate} from '@/components/ui/FormattedDate'

interface MyIvrListProps {
    localIvr: Ivr[] | null
    localIvrMusic: IvrMusic[] | null
    localIvrEffects: IvrEffect[] | null
}

export default function MyIvrList({localIvr, localIvrMusic, localIvrEffects}: MyIvrListProps) {
    const t = useTranslations('dashboard')
    const [ivrOrders, setIvrOrders] = useState<IvrOrder[]>([])
    const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(true)
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
    const {myIvr, fetchMyIvr} = useClientStore()
    const {ivr: storeIvr} = useIvrStore()

    useEffect(() => {
        const loadOrders = async () => {
            setIsLoadingOrders(true)
            try {
                await fetchMyIvr()
            } catch (error) {
                console.error('Error fetching IVR orders:', error)
            } finally {
                setIsLoadingOrders(false)
            }
        }

        loadOrders()
    }, [fetchMyIvr])

    useEffect(() => {
        if (myIvr) {
            setIvrOrders(myIvr)
        }
    }, [myIvr])

    // Debug logging for IVR data
    useEffect(() => {
        console.log('storeIvr:', storeIvr)
        console.log('localIvr:', localIvr)
        if (ivrOrders.length > 0) {
            const firstOrderId = ivrOrders[0].ivr_id
            console.log('First order ivr_id:', firstOrderId, 'Type:', typeof firstOrderId)

            // Log all IVR IDs from store and local for comparison
            console.log('Store IVR IDs:', storeIvr?.map(ivr => ({id: ivr.id, idType: typeof ivr.id, name: ivr.name})))
            console.log('Local IVR IDs:', localIvr?.map(ivr => ({id: ivr.id, idType: typeof ivr.id, name: ivr.name})))

            // Try different comparison methods
            if (storeIvr) {
                const exactMatch = storeIvr.find(ivr => ivr.id.toString() === firstOrderId)
                const numberMatch = storeIvr.find(ivr => ivr.id === parseInt(firstOrderId))
                console.log('Store exact string match:', exactMatch)
                console.log('Store number match:', numberMatch)
            }
        }
    }, [storeIvr, localIvr, ivrOrders])

    return (
        <div className="flex flex-col w-full">
            {/* Total section */}
            <div className="flex flex-col sm:flex-row justify-between py-2 px-3 bg-muted/30 border-b border-border mb-2">
                <div className="text-xs">{t('my_ivr_orders')}</div>
            </div>

            {isLoadingOrders ? (
                <div className="flex flex-col w-full animate-pulse">
                    {/* Header with search */}
                    <div className="flex flex-col sm:flex-row items-center p-2 border-b border-border mb-1 gap-2">
                        <div className="flex items-center flex-1">
                            <div className="relative w-full sm:max-w-xs">
                                <div className="h-8 bg-muted rounded w-full"></div>
                            </div>
                        </div>
                    </div>

                    {/* Number list table */}
                    <div className="overflow-x-auto">
                        <div className="space-y-1">
                            {[...Array(5)].map((_, i) => (
                                <div key={i}>
                                    {/* Main row */}
                                    <div className={`flex flex-row items-center w-full py-1 px-2 ${i % 2 !== 0 ? 'bg-secondary/50 dark:bg-secondary/40' : ''}`}>
                                        {/* Number and name */}
                                        <div className="flex-1">
                                            <div className="flex flex-col">
                                                <div className="h-4 bg-muted rounded w-32 mb-1"></div>
                                                <div className="h-3 bg-muted rounded w-24"></div>
                                            </div>
                                        </div>

                                        {/* Amount */}
                                        <div className="w-20">
                                            <div className="h-4 bg-muted rounded w-12"></div>
                                        </div>

                                        {/* Status */}
                                        <div className="w-24 text-center">
                                            <div className="h-4 bg-muted rounded w-16 mx-auto"></div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="w-28">
                                            <div className="flex items-center justify-end space-x-1">
                                                <div className="h-7 bg-muted rounded w-7"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : ivrOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    {t('no_ivr_orders')}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <Table striped className="[&_td]:py-0.5 [&_td]:px-2 [&_td]:text-xs [&_td]:sm:text-sm">
                        <TableBody>
                            {ivrOrders.map((order) => {
                                // Find the IVR name from the store first, then fall back to local IVR data, then to ID
                                // Try both string comparison and number comparison
                                const orderId = order.ivr_id.toString()
                                const orderIdNum = parseInt(orderId)

                                // Try to find a match using both string and number comparison
                                const storeMatch = storeIvr?.find(ivr =>
                                    ivr.id.toString() === orderId || ivr.id === orderIdNum
                                )

                                const localMatch = localIvr?.find(ivr =>
                                    ivr.id.toString() === orderId || ivr.id === orderIdNum
                                )

                                // Log the matching process for debugging
                                console.log(`Order ${orderId} - Store match:`, storeMatch, 'Local match:', localMatch)

                                const ivrName = storeMatch?.name || localMatch?.name || orderId
                                // Get a preview of the text (first 30 characters)
                                const textPreview = order.text.length > 30 ? `${order.text.substring(0, 30)}...` : order.text
                                const orderKey = `${order.client_id}-${order.ivr_id}${order.created_at ? `-${order.created_at}` : ''}`
                                const isExpanded = expandedOrderId === orderKey

                                return (
                                    <React.Fragment key={orderKey}>
                                        <TableRow>
                                            {/* IVR name and text preview */}
                                            <TableCell className="flex-1">
                                                <div className="flex flex-col">
                                                    <div className="text-xs">{ivrName}</div>
                                                    <div className="text-xs text-muted-foreground">{textPreview}</div>
                                                </div>
                                            </TableCell>

                                            {/* Amount */}
                                            <TableCell className="w-20 text-xs">
                                                ${order.amount}
                                            </TableCell>

                                            {/* Created At */}
                                            <TableCell className="w-24 text-xs text-center">
                                                {order.created_at ? <FormattedDate date={order.created_at} /> : ''}
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell className="w-24 text-center">
                                                <Boolean
                                                    value={order.paid}
                                                    label={order.paid ? t('paid') : t('pending')}
                                                    labelClassName="text-muted-foreground"
                                                />
                                            </TableCell>

                                            {/* Action button */}
                                            <TableCell className="w-28">
                                                <div className="flex items-center justify-end space-x-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setExpandedOrderId(isExpanded ? null : orderKey)}
                                                        title={t('info')}
                                                        className="h-7 w-7"
                                                    >
                                                        <InfoIcon size={16}/>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>

                                        {/* Expanded details */}
                                        {isExpanded && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="p-0">
                                                    <div className="pl-10 pr-2 py-1 text-xs sm:text-sm bg-muted/20 border-l-2 border-muted/25 ml-2">
                                                        <Table className="w-full [&_td]:py-0.5 [&_td]:px-2 [&_td]:text-xs [&_td]:sm:text-sm">
                                                            <TableBody>
                                                                <TableRow>
                                                                    <TableCell
                                                                        className="min-w-24 w-24 sm:min-w-32 sm:w-32 text-muted-foreground font-light">{t('full_text')}</TableCell>
                                                                    <TableCell className="text-right sm:text-left whitespace-pre-wrap">{order.text}</TableCell>
                                                                </TableRow>
                                                                <TableRow>
                                                                    <TableCell
                                                                        className="min-w-24 w-24 sm:min-w-32 sm:w-32 text-muted-foreground font-light">{t('duration')}</TableCell>
                                                                    <TableCell className="text-right sm:text-left">{order.duration} {t('seconds')}</TableCell>
                                                                </TableRow>
                                                                {order.created_at && (
                                                                    <TableRow>
                                                                        <TableCell
                                                                            className="min-w-24 w-24 sm:min-w-32 sm:w-32 text-muted-foreground font-light">{t('created_at')}</TableCell>
                                                                        <TableCell className="text-right sm:text-left">
                                                                            {order.created_at ? <FormattedDate date={order.created_at} /> : ''}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                )}
                                                                {order.ivr_music_id && (
                                                                    <TableRow>
                                                                        <TableCell
                                                                            className="min-w-24 w-24 sm:min-w-32 sm:w-32 text-muted-foreground font-light">{t('music')}</TableCell>
                                                                        <TableCell
                                                                            className="text-right sm:text-left">{localIvrMusic?.find(music => music.id.toString() === order.ivr_music_id)?.name || order.ivr_music_id}</TableCell>
                                                                    </TableRow>
                                                                )}
                                                                {order.ivr_effect_id && (
                                                                    <TableRow>
                                                                        <TableCell
                                                                            className="min-w-24 w-24 sm:min-w-32 sm:w-32 text-muted-foreground font-light">{t('effect')}</TableCell>
                                                                        <TableCell
                                                                            className="text-right sm:text-left">{localIvrEffects?.find(effect => effect.id.toString() === order.ivr_effect_id)?.name || order.ivr_effect_id}</TableCell>
                                                                    </TableRow>
                                                                )}
                                                                {order.comment && (
                                                                    <TableRow>
                                                                        <TableCell
                                                                            className="min-w-24 w-24 sm:min-w-32 sm:w-32 text-muted-foreground font-light">{t('comment')}</TableCell>
                                                                        <TableCell className="text-right sm:text-left">{order.comment}</TableCell>
                                                                    </TableRow>
                                                                )}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}
