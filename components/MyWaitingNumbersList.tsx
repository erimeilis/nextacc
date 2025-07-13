'use client'
import React, {useState} from 'react'
import {useRouter, useSearchParams} from 'next/navigation'
import Show from '@/components/service/Show'
import {MyWaitingNumberInfo} from '@/types/MyWaitingNumberInfo'
import {Checkbox} from '@/components/ui/Checkbox'
import {Button} from '@/components/ui/Button'
import {ChatCircleTextIcon, CircleNotchIcon, FilePlusIcon, HeadsetIcon, InfoIcon, MagnifyingGlassIcon, PenNibIcon, PhoneIcon, XIcon} from '@phosphor-icons/react'
import {useTranslations} from 'next-intl'
import {Table, TableBody, TableCell, TableRow} from '@/components/ui/Table'
import {Input} from '@/components/ui/Input'
import {useOffersStore} from '@/stores/useOffersStore'
import {useWaitingStore} from '@/stores/useWaitingStore'

// Skeleton loader for a waiting numbers list
function WaitingNumbersSkeleton() {
    return (
        <div className="flex flex-col w-full animate-pulse">
            {/* Total section */}
            <div className="flex flex-col sm:flex-row justify-between py-2 px-3 bg-muted/30 border-b border-border mb-2">
                <div className="h-4 bg-muted rounded w-32"></div>
                <div className="h-4 bg-muted rounded w-40"></div>
            </div>

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
                                {/* Checkbox */}
                                <div className="w-8">
                                    <div className="h-4 bg-muted rounded w-4"></div>
                                </div>

                                {/* Number and name */}
                                <div className="flex-1">
                                    <div className="flex flex-col">
                                        <div className="h-4 bg-muted rounded w-32 mb-1"></div>
                                    </div>
                                </div>

                                {/* Feature icons */}
                                <div className="w-20">
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="h-4 bg-muted rounded w-4"></div>
                                        <div className="h-4 bg-muted rounded w-4"></div>
                                        <div className="h-4 bg-muted rounded w-4"></div>
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="w-28">
                                    <div className="flex items-center justify-end space-x-1">
                                        {[...Array(3)].map((_, j) => (
                                            <div key={j} className="h-7 bg-muted rounded w-7"></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default function MyWaitingNumbersList({
                                                 options,
                                             }: {
    options: MyWaitingNumberInfo[] | null
}) {
    // Get waiting numbers directly from the store to ensure we always have the latest data
    const {waitingNumbers} = useWaitingStore()

    // Always use store waiting numbers if they exist, otherwise use options prop
    // This ensures we always have the latest data from the store
    const displayOptions = waitingNumbers || options
    const t = useTranslations('dashboard')
    const errorsT = useTranslations('errors')
    const router = useRouter()
    const searchParams = useSearchParams()
    const [selectedNumbers, setSelectedNumbers] = useState<string[]>([])
    const [expandedNumbers, setExpandedNumbers] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [loadingEdit, setLoadingEdit] = useState<string | null>(null)
    const [loadingDelete, setLoadingDelete] = useState<string | null>(null)
    const {countriesMap} = useOffersStore()
    const {deleteWaitingNumber} = useWaitingStore()

    // Get all countries from all types
    const allCountries = Object.values(countriesMap).flat()

    // Function to get country by ID
    const getCountryByID = (countryId?: number) => {
        if (!countryId) return null
        return allCountries.find(country => country.id === countryId)
    }

    // Filter numbers based on a search query and exclude all-numeric DIDs
    const filteredOptions = displayOptions && Array.isArray(displayOptions) ?
        displayOptions.filter(option => {
            // Filter based on a search query and exclude all-numeric DIDs
            return (searchQuery === '' || option.did.toString().includes(searchQuery))
        }) :
        null

    // Calculate totals
    const totalNumbers = displayOptions && Array.isArray(displayOptions) ?
        displayOptions.length :
        0
    const totalCost = displayOptions && Array.isArray(displayOptions) ?
        displayOptions?.reduce((sum, option) => sum + option.pay_sum, 0) :
        0

    // Handle checkbox selection
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedNumbers(filteredOptions && Array.isArray(filteredOptions) ?
                filteredOptions.map(option => option.id) :
                [])
        } else {
            setSelectedNumbers([])
        }
    }

    const handleSelectNumber = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedNumbers(prev => [...prev, id])
        } else {
            setSelectedNumbers(prev => prev.filter(numberId => numberId !== id))
        }
    }

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    // Toggle number info expansion - only one can be open at a time
    const toggleNumberInfo = (id: string) => {
        if (expandedNumbers.includes(id)) {
            setExpandedNumbers([])
        } else {
            setExpandedNumbers([id])
        }
    }

    // Handle settings button click
    const handleSettings = (number: MyWaitingNumberInfo) => {
        // Set the loading state for this number
        setLoadingEdit(number.id)

        // Navigate to number edit page with current search params
        const currentParams = new URLSearchParams(searchParams?.toString())
        const editUrl = `/waiting-numbers/${number.id}/?${currentParams.toString()}`
        router.push(editUrl)
    }

    // Handle delete button click
    const handleDelete = async (number: MyWaitingNumberInfo) => {
        // Set the loading state for this number
        setLoadingDelete(number.id)

        try {
            // Call the API to delete the number
            // The deleteWaitingNumber function already updates the store with the new list
            const res = await deleteWaitingNumber(number.id)
            if (res) options = res
        } catch (error) {
            console.error(errorsT('error_deleting_waiting_number'), error)
        } finally {
            // Clear loading state
            setLoadingDelete(null)
        }
    }

    // Handle deletes the selected button click
    const handleDeleteSelected = async () => {
        if (selectedNumbers.length === 0) return

        // Delete each selected number one by one
        for (const id of selectedNumbers) {
            setLoadingDelete(id)
            try {
                // The deleteWaitingNumber function already updates the store with the new list
                const res = await deleteWaitingNumber(id)
                if (res) options = res
            } catch (error) {
                console.error(errorsT('error_deleting_waiting_number_id', {id}), error)
            }
        }

        // Clear selected numbers and loading state
        setSelectedNumbers([])
        setLoadingDelete(null)
    }

    return (
        <Show when={displayOptions !== null && displayOptions.length > 0}
              fallback={displayOptions === null ?
                  <WaitingNumbersSkeleton/> :
                  <div className="text-sm text-center">{t('no_waiting_numbers')}</div>}>
            <div className="flex flex-col w-full">
                {/* Total section */}
                <div className="flex flex-col sm:flex-row justify-between py-2 px-3 bg-muted/30 border-b border-border mb-2">
                    <div className="text-xs">{t('total_numbers')}: {totalNumbers}</div>
                    <div className="text-xs">{t('total_cost')}: ${totalCost?.toFixed(2) || '0.00'}</div>
                </div>

                {/* Header with search */}
                <div className="flex flex-col sm:flex-row items-center p-2 border-b border-border mb-1 gap-2">
                    <div className="flex items-center flex-1">
                        <div className="relative w-full sm:max-w-xs">
                            <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16}/>
                            <Input
                                placeholder={t('search_numbers')}
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="pl-8 h-8 text-xs"
                            />
                        </div>
                    </div>
                </div>

                {/* Number list */}
                <div className="overflow-x-auto">
                    <Table striped className="[&_td]:py-0.5 [&_td]:px-2 [&_td]:text-xs [&_td]:sm:text-sm">
                        <TableBody>
                            {filteredOptions?.map((option) => (
                                <React.Fragment key={option.id.toString()}>
                                    <TableRow>
                                        {/* Checkbox */}
                                        <TableCell className="w-8">
                                            <Checkbox
                                                id={`checkbox-${option.id}`}
                                                checked={selectedNumbers.includes(option.id)}
                                                onCheckedChange={(checked) => handleSelectNumber(option.id, checked)}
                                                variant="sm"
                                            />
                                        </TableCell>

                                        {/* Number with a country flag */}
                                        <TableCell className="flex-1">
                                            <div className="flex flex-col">
                                                <div className="flex items-center">
                                                    {option.country_id && getCountryByID(option.country_id)?.geo && (
                                                        <img
                                                            src={`https://flagcdn.com/w20/${getCountryByID(option.country_id)?.geo.toLowerCase()}.png`}
                                                            alt={`${getCountryByID(option.country_id)?.countryname || ''} flag`}
                                                            className="mr-2 h-3 w-5 inline-block"
                                                        />
                                                    )}
                                                    {option.did.toString()}
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Docs */}
                                        <TableCell>
                                            <div className="flex items-center justify-end space-x-2">
                                                {option.docs && option.docs.length > 0 &&
                                                    <FilePlusIcon weight="light" className="text-muted-foreground mr-4" size={16}/>}
                                            </div>
                                        </TableCell>

                                        {/* Feature icons */}
                                        <TableCell className="w-8">
                                            <div className="flex items-center justify-center space-x-2">
                                                {option.voice && <PhoneIcon weight="fill" className="text-primary" size={16}/>}
                                                {option.sms && <ChatCircleTextIcon weight="fill" className="text-primary" size={16}/>}
                                                {option.toll_free && <HeadsetIcon weight="fill" className="text-primary" size={16}/>}
                                            </div>
                                        </TableCell>

                                        {/* Action buttons */}
                                        <TableCell className="w-28">
                                            <div className="flex items-center justify-end space-x-1">
                                                <Button variant="ghost" size="icon" onClick={() => handleSettings(option)} title={t('settings')} className="h-7 w-7"
                                                        disabled={loadingEdit === option.id}>
                                                    {loadingEdit === option.id ? (
                                                        <CircleNotchIcon size={16} className="animate-spin"/>
                                                    ) : (
                                                        <PenNibIcon size={16}/>
                                                    )}
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => toggleNumberInfo(option.id)} title={t('info')} className="h-7 w-7">
                                                    <InfoIcon size={16}/>
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(option)} title={t('delete')} className="h-7 w-7 text-destructive"
                                                        disabled={loadingDelete === option.id}>
                                                    {loadingDelete === option.id ? (
                                                        <CircleNotchIcon size={16} className="animate-spin"/>
                                                    ) : (
                                                        <XIcon size={16}/>
                                                    )}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>

                                    {/* Expanded info section */}
                                    {expandedNumbers.includes(option.id) && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="p-0">
                                                <div className="pl-10 pr-2 py-1 text-xs sm:text-sm bg-muted/20 border-l-2 border-muted/25 ml-2">
                                                    <Table className="w-full [&_td]:py-0.5 [&_td]:px-2 [&_td]:text-xs [&_td]:sm:text-sm">
                                                        <TableBody>
                                                            {[
                                                                {
                                                                    label: t('did'),
                                                                    value: option.did,
                                                                    condition: true
                                                                },
                                                                {
                                                                    label: t('setup_fee'),
                                                                    value: `$${option.setup_rate?.toFixed(2) || '0.00'}`,
                                                                    condition: true
                                                                },
                                                                {
                                                                    label: t('monthly_fee'),
                                                                    value: `$${option.fix_rate?.toFixed(2) || '0.00'}`,
                                                                    condition: true
                                                                },
                                                                {
                                                                    label: t('pay_sum'),
                                                                    value: `$${option.pay_sum?.toFixed(2) || '0.00'}`,
                                                                    condition: true
                                                                },
                                                                {
                                                                    label: t('count_month'),
                                                                    value: option.count_month,
                                                                    condition: true
                                                                },
                                                                {
                                                                    label: t('docs'),
                                                                    value: (
                                                                        <div>
                                                                            {option.docs && option.docs.length > 0 &&
                                                                                <FilePlusIcon weight="light" className="text-secondary mr-4" size={16}/>}
                                                                        </div>
                                                                    ),
                                                                    condition: true
                                                                },
                                                                {
                                                                    label: t('features'),
                                                                    value: (
                                                                        <div className="flex justify-end sm:justify-start space-x-2">
                                                                            {option.voice && <PhoneIcon weight="fill" className="text-primary" size={16}/>}
                                                                            {option.sms && <ChatCircleTextIcon weight="fill" className="text-primary" size={16}/>}
                                                                            {option.toll_free && <HeadsetIcon weight="fill" className="text-primary" size={16}/>}
                                                                        </div>
                                                                    ),
                                                                    condition: true
                                                                },
                                                                {
                                                                    label: t('voice_destination'),
                                                                    value: option.voiceDestType && option.voiceDestType !== 'none' ? option.voiceDest : t('not_available'),
                                                                    condition: option.voice || option.toll_free
                                                                },
                                                                {
                                                                    label: t('sms_destination'),
                                                                    value: (option.smsDestType && option.smsDestType !== 'none') || (option.smsDestType && option.smsDestType !== 'none') ? option.smsDest : t('not_available'),
                                                                    condition: option.sms
                                                                },
                                                            ].map((item, index) => (
                                                                item.condition && (
                                                                    <TableRow key={index}>
                                                                        <TableCell
                                                                            className="min-w-24 w-24 sm:min-w-32 sm:w-32 text-muted-foreground font-light">{item.label}</TableCell>
                                                                        <TableCell className="text-right sm:text-left">{item.value}</TableCell>
                                                                    </TableRow>
                                                                )
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Footer with select all and delete selected */}
                <div className="flex flex-col sm:flex-row items-center justify-between p-2 border-t border-border mt-2 gap-2">
                    <div className="flex items-center">
                        <Checkbox
                            id="select-all"
                            checked={selectedNumbers.length === (filteredOptions?.length || 0) && (filteredOptions?.length || 0) > 0}
                            onCheckedChange={(checked) => handleSelectAll(checked)}
                            variant="sm"
                        />
                        <label htmlFor="select-all" className="ml-2 text-xs text-muted-foreground">
                            {t('select_all')}
                        </label>
                    </div>

                    {selectedNumbers.length > 0 && (
                        <Button
                            variant="link"
                            size="sm"
                            onClick={handleDeleteSelected}
                            className="text-xs text-muted-foreground p-0 h-auto"
                        >
                            {t('delete_selected')}
                        </Button>
                    )}
                </div>
            </div>
        </Show>
    )
}
