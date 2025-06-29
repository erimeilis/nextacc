'use client'
import React, {useState} from 'react'
import {useRouter, useSearchParams} from 'next/navigation'
import Show from '@/components/service/Show'
import {MyWaitingNumberInfo} from '@/types/MyWaitingNumberInfo'
import {Checkbox} from '@/components/ui/Checkbox'
import {Button} from '@/components/ui/Button'
import {ChatCircleTextIcon, CircleNotchIcon, HeadsetIcon, InfoIcon, MagnifyingGlassIcon, PenNibIcon, PhoneIcon, XIcon} from '@phosphor-icons/react'
import {useTranslations} from 'next-intl'
import {Table, TableBody, TableCell, TableRow} from '@/components/ui/Table'
import {Input} from '@/components/ui/Input'
import {useOffersStore} from '@/stores/useOffersStore'

// Skeleton loader for waiting numbers list
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
    const t = useTranslations('dashboard')
    const router = useRouter()
    const searchParams = useSearchParams()
    const [selectedNumbers, setSelectedNumbers] = useState<string[]>([])
    const [expandedNumbers, setExpandedNumbers] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [loadingEdit, setLoadingEdit] = useState<string | null>(null)
    const { countriesMap } = useOffersStore()

    // Get all countries from all types
    const allCountries = Object.values(countriesMap).flat()

    // Function to get country by ID
    const getCountryByID = (countryId?: number) => {
        if (!countryId) return null
        return allCountries.find(country => country.id === countryId)
    }

    // Filter numbers based on a search query
    const filteredOptions = options?.filter(option =>
        searchQuery === '' ||
        option.did.toString().includes(searchQuery)
    ) || null

    // Calculate totals
    const totalNumbers = options?.length || 0
    const totalMonthlyCost = options?.reduce((sum, option) => sum + option.fix_rate, 0) || 0

    // Handle checkbox selection
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedNumbers(filteredOptions?.map(option => option.did) || [])
        } else {
            setSelectedNumbers([])
        }
    }

    const handleSelectNumber = (did: string, checked: boolean) => {
        if (checked) {
            setSelectedNumbers(prev => [...prev, did])
        } else {
            setSelectedNumbers(prev => prev.filter(id => id !== did))
        }
    }

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    // Toggle number info expansion - only one can be open at a time
    const toggleNumberInfo = (did: string) => {
        if (expandedNumbers.includes(did)) {
            setExpandedNumbers([])
        } else {
            setExpandedNumbers([did])
        }
    }

    // Handle settings button click
    const handleSettings = (number: MyWaitingNumberInfo) => {
        // Set loading state for this number
        setLoadingEdit(number.did)

        // Navigate to number edit page with current search params
        const currentParams = new URLSearchParams(searchParams?.toString())
        const editUrl = `/waiting-numbers/${number.did}/?${currentParams.toString()}`
        router.push(editUrl)
    }

    // Handle delete button click
    const handleDelete = (number: MyWaitingNumberInfo) => {
        // This would delete the number
        console.log('Delete waiting number', number.did)
    }

    // Handle deletes the selected button click
    const handleDeleteSelected = () => {
        // This would delete all selected numbers
        console.log('Delete selected waiting numbers', selectedNumbers)
    }

    return (
        <Show when={options !== null}
              fallback={options?.length == 0 ?
                  <div>{t('no_waiting_numbers')}</div> :
                  <WaitingNumbersSkeleton />}>
            <div className="flex flex-col w-full">
                {/* Total section */}
                <div className="flex flex-col sm:flex-row justify-between py-2 px-3 bg-muted/30 border-b border-border mb-2">
                    <div className="text-xs sm:text-sm">{t('total_numbers')}: {totalNumbers}</div>
                    <div className="text-xs sm:text-sm">{t('total_monthly_cost')}: ${totalMonthlyCost?.toFixed(2) || '0.00'}</div>
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
                                <React.Fragment key={option.did.toString()}>
                                    <TableRow>
                                        {/* Checkbox */}
                                        <TableCell className="w-8">
                                            <Checkbox
                                                id={`checkbox-${option.did}`}
                                                checked={selectedNumbers.includes(option.did)}
                                                onCheckedChange={(checked) => handleSelectNumber(option.did, checked)}
                                                variant="sm"
                                            />
                                        </TableCell>

                                        {/* Number with country flag */}
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

                                        {/* Feature icons */}
                                        <TableCell className="w-20">
                                            <div className="flex items-center justify-center space-x-2">
                                                {option.voice && <PhoneIcon weight="fill" className="text-primary" size={16}/>}
                                                {option.sms && <ChatCircleTextIcon weight="fill" className="text-primary" size={16}/>}
                                                {option.toll_free && <HeadsetIcon weight="fill" className="text-primary" size={16}/>}
                                            </div>
                                        </TableCell>

                                        {/* Action buttons */}
                                        <TableCell className="w-28">
                                            <div className="flex items-center justify-end space-x-1">
                                                <Button variant="ghost" size="icon" onClick={() => handleSettings(option)} title={t('settings')} className="h-7 w-7" disabled={loadingEdit === option.did}>
                                                    {loadingEdit === option.did ? (
                                                        <CircleNotchIcon size={16} className="animate-spin"/>
                                                    ) : (
                                                        <PenNibIcon size={16}/>
                                                    )}
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => toggleNumberInfo(option.did)} title={t('info')} className="h-7 w-7">
                                                    <InfoIcon size={16}/>
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(option)} title={t('delete')} className="h-7 w-7 text-destructive">
                                                    <XIcon size={16}/>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>

                                    {/* Expanded info section */}
                                    {expandedNumbers.includes(option.did) && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="p-0">
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
                                                            ].map((item, index) => (
                                                                item.condition && (
                                                                    <TableRow key={index}>
                                                                        <TableCell className="min-w-24 w-24 sm:min-w-32 sm:w-32 text-muted-foreground font-light">{item.label}</TableCell>
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
