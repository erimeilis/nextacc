'use client'
import React, {useEffect, useRef, useState} from 'react'
import ActionButton from '@/components/shared/ActionButton'
import {DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle} from '@/components/ui/Drawer'
import {useTranslations} from 'next-intl'
import {useCartStore} from '@/stores/useCartStore'
import {useClientStore} from '@/stores/useClientStore'
import {PaymentMethod, PaymentRegion} from '@/types/PaymentTypes'
import {CaretDownIcon, CaretRightIcon, WalletIcon} from '@phosphor-icons/react'
import Image from 'next/image'
import {redMakePayment} from '@/app/api/redreport/payments'

interface PaymentProps {
    setSidebarOpenAction: React.Dispatch<React.SetStateAction<boolean>>
}

// Component to display a payment method image with error handling
const PaymentMethodImage = ({methodCode}: { methodCode: string }) => {
    const [imageError, setImageError] = useState(false)
    const imageUrl = `https://red.telecomax.net/payment-methods/${methodCode}.png`

    if (imageError) {
        return null // Don't render anything if the image fails to load
    }

    return (
        <div className="mr-2 flex-shrink-0">
            <Image
                src={imageUrl}
                alt=""
                width={20}
                height={20}
                className="rounded"
                onError={() => setImageError(true)}
            />
        </div>
    )
}

export default function Payment({setSidebarOpenAction}: PaymentProps) {
    const t = useTranslations('cart')
    const p = useTranslations('profile')
    const d = useTranslations('dashboard')
    const {getBalance, getPaymentMethods, fetchPaymentMethods} = useClientStore()
    const {cart} = useCartStore()
    const balance = getBalance() || 0

    // Payment amount state
    const [paymentAmount, setPaymentAmount] = useState<number>(20) // Initial value is $20 (minimum)
    const [amountError, setAmountError] = useState<string>('')

    // Handle payment amount change
    const handlePaymentAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Prevent event propagation to keep drawer open
        e.stopPropagation()

        const value = parseFloat(e.target.value)
        setPaymentAmount(value)

        // Validate minimum amount
        if (value < 20) {
            setAmountError(p('min_topup_amount'))
        } else {
            setAmountError('')
        }
    }

    // Payment methods state
    const [localPaymentMethods, setLocalPaymentMethods] = useState<PaymentRegion[]>([])
    const [expandedRegions, setExpandedRegions] = useState<string[]>([])
    const [expandedSubregions, setExpandedSubregions] = useState<string[]>([])
    const paymentMethods = getPaymentMethods()
    const paymentMethodsBackgroundFetchDone = useRef(false)

    // Set data from the store immediately if available and fetch in the background if needed
    useEffect(() => {
        console.log('Payment drawer: paymentMethods from store:', paymentMethods)
        if (paymentMethods && paymentMethods.length > 0) {
            console.log('Payment drawer: setting localPaymentMethods from store')
            setLocalPaymentMethods(paymentMethods)
        }

        if (!paymentMethods || !paymentMethodsBackgroundFetchDone.current) {
            paymentMethodsBackgroundFetchDone.current = true
            console.log('Fetching payment methods data in background')
            fetchPaymentMethods(paymentAmount)
                .then((result) => {
                    console.log('Payment drawer: fetchPaymentMethods result:', result)
                    if (result && result.length > 0) {
                        console.log('Payment drawer: setting localPaymentMethods from fetch result')
                        setLocalPaymentMethods(result)
                    } else {
                        console.log('Payment drawer: fetch result is null, undefined, or empty array')
                        // Ensure localPaymentMethods is an empty array if the result is null, undefined, or empty
                        setLocalPaymentMethods([])
                    }
                })
                .catch(error => {
                    console.error('Payment drawer: error fetching payment methods:', error)
                    // Ensure localPaymentMethods is an empty array if there's an error
                    setLocalPaymentMethods([])
                })
        }
    }, [paymentMethods, fetchPaymentMethods, paymentAmount])

    // Reload payment methods when the payment amount changes
    useEffect(() => {
        // Skip the initial render
        if (paymentMethodsBackgroundFetchDone.current) {
            console.log('Reloading payment methods with new amount:', paymentAmount)
            fetchPaymentMethods(paymentAmount)
                .then((result) => {
                    console.log('Payment drawer (reload): fetchPaymentMethods result:', result)
                    if (result && result.length > 0) {
                        console.log('Payment drawer (reload): setting localPaymentMethods from fetch result')
                        setLocalPaymentMethods(result)
                    } else {
                        console.log('Payment drawer (reload): fetch result is null, undefined, or empty array')
                        // Ensure localPaymentMethods is an empty array if the result is null, undefined, or empty
                        setLocalPaymentMethods([])
                    }
                })
                .catch(error => {
                    console.error('Payment drawer (reload): error fetching payment methods:', error)
                    // Ensure localPaymentMethods is an empty array if there's an error
                    setLocalPaymentMethods([])
                })
        }
    }, [paymentAmount, fetchPaymentMethods])

    // Toggle region expansion
    const toggleRegion = (e: React.MouseEvent, region: string) => {
        // Prevent event propagation to keep drawer open
        e.stopPropagation()

        // Allow only one region to be expanded at a time
        setExpandedRegions(prev =>
            prev.includes(region)
                ? [] // Close if already open
                : [region] // Open only this region
        )
    }

    // Toggle subregion expansion
    const toggleSubregion = (e: React.MouseEvent, subregion: string) => {
        // Prevent event propagation to keep drawer open
        e.stopPropagation()

        // Allow only one subregion to be expanded at a time
        setExpandedSubregions(prev =>
            prev.includes(subregion)
                ? [] // Close if already open
                : [subregion] // Open only this subregion
        )
    }

    // Check if a region is expanded
    const isRegionExpanded = (region: string) => expandedRegions.includes(region)

    // Check if a subregion is expanded
    const isSubregionExpanded = (subregion: string) => expandedSubregions.includes(subregion)

    // Handle payment method selection
    const handlePaymentMethodClick = async (methodId: string, methodValue: string) => {
        console.log(`Selected payment method: ${methodId}, method value: ${methodValue}, amount: ${paymentAmount}`)
        try {
            const response = await redMakePayment(paymentAmount, methodValue)
            console.log('Payment response:', response)
        } catch (error) {
            console.error('Error making payment:', error)
        }
    }

    // Render payment methods for a subregion
    const renderPaymentMethods = (methods: Record<string, PaymentMethod>) => {
        return Object.entries(methods)
            .map(([id, method]) => (
                <div
                    key={id}
                    className="pl-8 py-2 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={(e) => {
                        e.stopPropagation()
                        handlePaymentMethodClick(id, method.method).then()
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center">
                                <PaymentMethodImage methodCode={method.method}/>
                                <span className="text-sm font-light">{method.name || method.description}</span>
                            </div>
                        </div>
                        <div className="text-sm">
                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                {method.valute} {method.full_summ}
                            </span>
                        </div>
                    </div>
                </div>
            ))
    }

    // Calculate total sum in cart
    const calculateCartTotal = () => {
        return cart.reduce((total, item) => total + (item.sum || 0), 0)
    }

    const cartTotal = calculateCartTotal()

    // Calculate recommended topup amount
    const recommendedTopup = Math.max(0, cartTotal - balance + 100)

    // Group payment methods by region and subregion
    const groupPaymentMethodsByRegion = (methods: PaymentRegion[]) => {
        // First, group methods by region
        const groupedByRegion: Record<string, PaymentRegion[]> = {}

        methods.forEach(method => {
            // Check if the method has any payment methods
            const hasPaymentMethods = method.methods && Object.keys(method.methods).length > 0

            if (hasPaymentMethods) {
                if (!groupedByRegion[method.region]) {
                    groupedByRegion[method.region] = []
                }
                groupedByRegion[method.region].push(method)
            }
        })

        // Process each region to merge region and subregion if there's only one subregion
        const finalGroupedMethods: Record<string, PaymentRegion[]> = {}

        Object.entries(groupedByRegion).forEach(([regionName, regionMethods]) => {
            // Skip empty regions
            if (regionMethods.length === 0) {
                return
            }

            // Group methods by subregion within this region
            const subregions = new Set(regionMethods.map(method => method.subregion))

            // If there's only one subregion, merge region and subregion names
            if (subregions.size === 1) {
                const subregionName = regionMethods[0].subregion
                // If region and subregion are the same, just use one name
                // Otherwise, merge them (e.g., "Latin America - Brazil")
                const mergedName = regionName === subregionName ? regionName : `${regionName} - ${subregionName}`

                finalGroupedMethods[mergedName] = regionMethods
            } else {
                // If there are multiple subregions, keep the original region name
                finalGroupedMethods[regionName] = regionMethods
            }
        })

        return finalGroupedMethods
    }

    // Render payment methods list
    const renderPaymentMethodsList = () => {
        console.log('renderPaymentMethodsList: localPaymentMethods:', localPaymentMethods)

        // Empty state
        if (!localPaymentMethods || localPaymentMethods.length === 0) {
            console.log('renderPaymentMethodsList: localPaymentMethods is empty or null')
            return (
                <div className="flex justify-center items-center h-32">
                    <p className="text-gray-500 dark:text-gray-400">{d('no_payment_methods')}</p>
                </div>
            )
        }

        // Group payment methods by region and handle subregion merging
        const groupedMethods = groupPaymentMethodsByRegion(localPaymentMethods)

        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg">
                {Object.entries(groupedMethods).map(([regionName, regionMethods], regionIndex) => {
                    // Check if this region has multiple subregions
                    const subregions = new Set(regionMethods.map(method => method.subregion))
                    const hasMultipleSubregions = subregions.size > 1

                    // Group methods by subregion for this region
                    const subregionGroups: Record<string, PaymentRegion[]> = {}
                    regionMethods.forEach(method => {
                        if (!subregionGroups[method.subregion]) {
                            subregionGroups[method.subregion] = []
                        }
                        subregionGroups[method.subregion].push(method)
                    })

                    return (
                        <div key={regionIndex} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                            {/* Region header */}
                            <div
                                className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                                onClick={(e) => toggleRegion(e, regionName)}
                            >
                                <div className="flex items-center">
                                    {isRegionExpanded(regionName) ? (
                                        <CaretDownIcon className="h-4 w-4 mr-2 text-gray-500"/>
                                    ) : (
                                        <CaretRightIcon className="h-4 w-4 mr-2 text-gray-500"/>
                                    )}
                                    <span className="text-sm font-medium">{regionName}</span>
                                </div>
                            </div>

                            {/* Region content */}
                            {isRegionExpanded(regionName) && (
                                <div className="pl-3">
                                    {hasMultipleSubregions ? (
                                        // If there are multiple subregions, display them as separate sections
                                        Object.entries(subregionGroups).map(([subregionName, subregionMethods], subregionIndex) => (
                                            <div key={subregionIndex}>
                                                {/* Subregion header */}
                                                <div
                                                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                                                    onClick={(e) => toggleSubregion(e, subregionName)}
                                                >
                                                    <div className="flex items-center">
                                                        {isSubregionExpanded(subregionName) ? (
                                                            <CaretDownIcon className="h-4 w-4 mr-2 text-gray-500"/>
                                                        ) : (
                                                            <CaretRightIcon className="h-4 w-4 mr-2 text-gray-500"/>
                                                        )}
                                                        <span className="text-sm font-medium">{subregionName}</span>
                                                    </div>
                                                </div>

                                                {/* Payment methods content */}
                                                {isSubregionExpanded(subregionName) && (
                                                    <div className="pl-3">
                                                        {renderPaymentMethods(subregionMethods[0].methods)}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        // If there's only one subregion (already merged with region name), display methods directly
                                        <div className="pl-3">
                                            {renderPaymentMethods(regionMethods[0].methods)}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <DrawerContent
            className="w-full h-[80vh]
            sm:min-w-[40vw] md:min-w-[20vw]
            md:w-fit sm:max-w-[80vw]
            sm:rounded-r-lg sm:border-r sm:border-border/50 sm:fixed sm:left-0 sm:right-auto sm:h-full sm:inset-y-0 sm:bottom-auto sm:mt-0 sm:top-0">
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

                            <div className="mb-4" onClick={(e) => e.stopPropagation()}>
                                <label htmlFor="payment-amount" className="block text-sm font-medium mb-1" onClick={(e) => e.stopPropagation()}>
                                    {p('topup_amount')}:
                                </label>
                                <div className="relative" onClick={(e) => e.stopPropagation()}>
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500" onClick={(e) => e.stopPropagation()}>$</span>
                                    <input
                                        id="payment-amount"
                                        type="number"
                                        min="20"
                                        step="1"
                                        value={paymentAmount}
                                        onChange={handlePaymentAmountChange}
                                        onClick={(e) => e.stopPropagation()}
                                        onFocus={(e) => e.stopPropagation()}
                                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                {amountError && (
                                    <p className="text-red-500 text-xs mt-1" onClick={(e) => e.stopPropagation()}>{amountError}</p>
                                )}
                            </div>

                            <div className="flex justify-center">
                                <WalletIcon size={64} className="text-primary"/>
                            </div>
                        </div>
                        {renderPaymentMethodsList()}
                    </div>
                </div>

                <DrawerFooter className="flex-column flex-wrap justify-between items-end px-4 py-8">
                    <div className="flex justify-start w-full">
                        <ActionButton
                            type="button"
                            style="pillow"
                            className="font-medium text-lg shadow-sm transition-all hover:shadow-md"
                            id="topup-balance"
                            disabled={paymentAmount < 20}
                            onClick={() => {
                                alert(`Top up amount: $${paymentAmount.toFixed(2)}`)
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
