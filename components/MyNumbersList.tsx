'use client'
import React, {useState} from 'react'
import {useRouter, useSearchParams} from 'next/navigation'
import Show from '@/components/service/Show'
import {NumberInfo} from '@/types/NumberInfo'
import Loader from '@/components/service/Loader'
import {Checkbox} from '@/components/ui/Checkbox'
import {Button} from '@/components/ui/Button'
import {ChartPieSliceIcon, ChatCircleTextIcon, HeadsetIcon, InfoIcon, MagnifyingGlassIcon, PenNibIcon, PhoneIcon, XIcon} from '@phosphor-icons/react'
import {useTranslations} from 'next-intl'
import {Table, TableBody, TableCell, TableRow} from '@/components/ui/Table'
import {FormattedDate} from '@/components/ui/FormattedDate'
import {Input} from '@/components/ui/Input'

export default function MyNumbersList({
                                          options,
                                      }: {
    options: NumberInfo[] | null
}) {
    const t = useTranslations('dashboard')
    const router = useRouter()
    const searchParams = useSearchParams()
    const [selectedNumbers, setSelectedNumbers] = useState<string[]>([])
    const [expandedNumbers, setExpandedNumbers] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState<string>('')

    // Filter numbers based on a search query
    const filteredOptions = options?.filter(option =>
        searchQuery === '' ||
        option.did.toString().includes(searchQuery) ||
        (option.name && option.name.toLowerCase().includes(searchQuery.toLowerCase()))
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
    const handleSettings = (number: NumberInfo) => {
        // Navigate to number edit page with current search params
        const currentParams = new URLSearchParams(searchParams?.toString())
        const editUrl = `/numbers/${number.did}/?${currentParams.toString()}`
        router.push(editUrl)
    }

    // Handle call statistics button click
    const handleCallStatistics = (number: NumberInfo) => {
        // This would navigate to the statistics page with a number filter
        console.log('View call statistics for', number.did)
    }

    // Handle delete button click
    const handleDelete = (number: NumberInfo) => {
        // This would delete the number
        console.log('Delete number', number.did)
    }

    // Handle deletes the selected button click
    const handleDeleteSelected = () => {
        // This would delete all selected numbers
        console.log('Delete selected numbers', selectedNumbers)
    }

    return (
        <Show when={options !== null}
              fallback={options?.length == 0 ?
                  <div>You have no numbers yet</div> :
                  <Loader height={32}/>}>
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

                                        {/* Number and name */}
                                        <TableCell className="flex-1">
                                            <div className="flex flex-col">
                                                <div>{option.did.toString()}</div>
                                                <div className="text-xs text-muted-foreground">{option.name}</div>
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
                                                <Button variant="ghost" size="icon" onClick={() => handleSettings(option)} title="Settings" className="h-7 w-7">
                                                    <PenNibIcon size={16}/>
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => toggleNumberInfo(option.did)} title="Info" className="h-7 w-7">
                                                    <InfoIcon size={16}/>
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleCallStatistics(option)} title="Call Statistics" className="h-7 w-7">
                                                    <ChartPieSliceIcon size={16}/>
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(option)} title="Delete" className="h-7 w-7 text-destructive">
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
                                                                    label: t('name'),
                                                                    value: option.name,
                                                                    condition: true
                                                                },
                                                                {
                                                                    label: t('location'),
                                                                    value: option.where_did,
                                                                    condition: !!option.where_did
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
                                                                    label: t('incoming_rate'),
                                                                    value: `$${option.incoming_per_minute?.toFixed(2)}/min`,
                                                                    condition: !!option.incoming_per_minute
                                                                },
                                                                {
                                                                    label: t('toll_free_rate'),
                                                                    value: `$${option.toll_free_rate_in_min?.toFixed(2)}/min`,
                                                                    condition: !!option.toll_free_rate_in_min
                                                                },
                                                                {
                                                                    label: t('sms_rate'),
                                                                    value: `$${option.incoming_rate_sms?.toFixed(2)}/msg`,
                                                                    condition: !!option.incoming_rate_sms
                                                                },
                                                                {
                                                                    label: t('creation_date'),
                                                                    value: <FormattedDate date={option.creation_date}/>,
                                                                    condition: !!option.creation_date
                                                                },
                                                                {
                                                                    label: t('paid_until'),
                                                                    value: <FormattedDate date={option.paid_till}/>,
                                                                    condition: !!option.paid_till
                                                                },
                                                                {
                                                                    label: t('months_paid'),
                                                                    value: option.months_paid,
                                                                    condition: !!option.months_paid
                                                                },
                                                                {
                                                                    label: t('voice_destination'),
                                                                    value: option.voiceDest,
                                                                    condition: !!option.voiceDest
                                                                },
                                                                {
                                                                    label: t('sms_destination'),
                                                                    value: option.smsDest && typeof option.smsDest === 'object' ?
                                                                        ['forward_email', 'forward_http', 'forward_telegram', 'forward_slack', 'forward_sms']
                                                                            .map(key => {
                                                                                const smsDest = option.smsDest as Record<string, unknown>
                                                                                const value = smsDest?.[key]
                                                                                return value || null
                                                                            })
                                                                            .filter(Boolean)
                                                                            .join(', ')
                                                                        : '',
                                                                    condition: !!option.smsDest && typeof option.smsDest === 'object'
                                                                }
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
};
