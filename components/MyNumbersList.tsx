'use client'
import React, {useState} from 'react'
import Show from '@/components/service/Show'
import {NumberInfo} from '@/types/NumberInfo'
import Loader from '@/components/service/Loader'
import {Checkbox} from '@/components/ui/checkbox'
import {Button} from '@/components/ui/button'
import {ChartPieSlice, ChatCircleText, Headset, Info, MagnifyingGlass, Pencil, Phone, X} from '@phosphor-icons/react'
import {useTranslations} from 'next-intl'
import {Table, TableBody, TableCell, TableRow} from '@/components/ui/table'
import {FormattedDate} from '@/components/ui/formatted-date'
import {cn} from '@/lib/utils'
import {Input} from '@/components/ui/input'

export default function MyNumbersList({
                                          options,
                                      }: {
    options: NumberInfo[] | null
}) {
    const t = useTranslations('dashboard')
    const [selectedNumbers, setSelectedNumbers] = useState<string[]>([])
    const [expandedNumbers, setExpandedNumbers] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState<string>('')

    // Filter numbers based on search query
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
        // This would open a dialog with number settings
        console.log('Open settings for', number.did)
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

    // Handle delete selected button click
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
                            <MagnifyingGlass className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
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
                {
                    filteredOptions?.map((option, i) => (
                        <div key={option.did.toString()} className="mb-1">
                            <div className={cn('flex flex-row items-center w-full text-xs sm:text-sm py-0.5 px-2 gap-2', i % 2 != 0 ? 'bg-secondary/50 dark:bg-secondary/40' : '')}>
                                {/* Checkbox */}
                                <div className="flex items-center w-8">
                                    <Checkbox
                                        id={`checkbox-${option.did}`}
                                        checked={selectedNumbers.includes(option.did)}
                                        onCheckedChange={(checked) => handleSelectNumber(option.did, checked === true)}
                                    />
                                </div>

                                {/* Number and name */}
                                <div className="flex flex-col flex-1">
                                    <div>{option.did.toString()}</div>
                                    <div className="text-xs text-muted-foreground">{option.name}</div>
                                </div>

                                {/* Feature icons */}
                                <div className="flex items-center justify-center space-x-2 w-20">
                                    {option.voice && <Phone weight="fill" className="text-primary" size={14}/>}
                                    {option.sms && <ChatCircleText weight="fill" className="text-primary" size={14}/>}
                                    {option.toll_free && <Headset weight="fill" className="text-primary" size={14}/>}
                                </div>

                                {/* Action buttons */}
                                <div className="flex items-center justify-end space-x-1 w-28">
                                    <Button variant="navIcon" size="icon" onClick={() => handleSettings(option)} title="Settings">
                                        <Pencil className="text-primary" size={14}/>
                                    </Button>
                                    <Button variant="navIcon" size="icon" onClick={() => toggleNumberInfo(option.did)} title="Info">
                                        <Info className="text-primary" size={14}/>
                                    </Button>
                                    <Button variant="navIcon" size="icon" onClick={() => handleCallStatistics(option)} title="Call Statistics">
                                        <ChartPieSlice className="text-primary" size={14}/>
                                    </Button>
                                    <Button variant="navIcon" size="icon" onClick={() => handleDelete(option)} title="Delete">
                                        <X className="text-primary" size={14}/>
                                    </Button>
                                </div>
                            </div>

                            {/* Expanded info section */}
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedNumbers.includes(option.did) ? 'max-h-96' : 'max-h-0'}`}>
                                <div className="pl-10 pr-2 py-1 text-xs sm:text-sm bg-muted/20 border-l-2 border-muted/25 ml-2">
                                    <Table className="w-full [&_td]:py-0.5 [&_td]:px-2 [&_td]:text-xs [&_td]:sm:text-sm">
                                        <TableBody>
                                            <TableRow>
                                                <TableCell className="font-normal min-w-24 w-24 sm:min-w-32 sm:w-32">DID</TableCell>
                                                <TableCell className="text-right sm:text-left">{option.did}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-normal min-w-24 w-24 sm:min-w-32 sm:w-32">Name</TableCell>
                                                <TableCell className="text-right sm:text-left">{option.name}</TableCell>
                                            </TableRow>
                                            <Show when={!!option.where_did}>
                                                <TableRow>
                                                    <TableCell className="font-normal min-w-24 w-24 sm:min-w-32 sm:w-32">Location</TableCell>
                                                    <TableCell className="text-right sm:text-left">{option.where_did}</TableCell>
                                                </TableRow>
                                            </Show>
                                            <TableRow>
                                                <TableCell className="font-normal min-w-24 w-24 sm:min-w-32 sm:w-32">Setup Fee</TableCell>
                                                <TableCell className="text-right sm:text-left">${option.setup_rate?.toFixed(2) || '0.00'}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-normal min-w-24 w-24 sm:min-w-32 sm:w-32">Monthly Fee</TableCell>
                                                <TableCell className="text-right sm:text-left">${option.fix_rate?.toFixed(2) || '0.00'}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-normal min-w-24 w-24 sm:min-w-32 sm:w-32">Features</TableCell>
                                                <TableCell className="text-right sm:text-left flex justify-end sm:justify-start space-x-2">
                                                    {option.voice && <Phone weight="fill" className="text-primary" size={14}/>}
                                                    {option.sms && <ChatCircleText weight="fill" className="text-primary" size={14}/>}
                                                    {option.toll_free && <Headset weight="fill" className="text-primary" size={14}/>}
                                                </TableCell>
                                            </TableRow>
                                            <Show when={!!option.incoming_per_minute}>
                                                <TableRow>
                                                    <TableCell className="font-normal min-w-24 w-24 sm:min-w-32 sm:w-32">Incoming Rate</TableCell>
                                                    <TableCell className="text-right sm:text-left">${option.incoming_per_minute?.toFixed(2)}/min</TableCell>
                                                </TableRow>
                                            </Show>
                                            <Show when={!!option.toll_free_rate_in_min}>
                                                <TableRow>
                                                    <TableCell className="font-normal min-w-24 w-24 sm:min-w-32 sm:w-32">Toll Free Rate</TableCell>
                                                    <TableCell className="text-right sm:text-left">${option.toll_free_rate_in_min?.toFixed(2)}/min</TableCell>
                                                </TableRow>
                                            </Show>
                                            <Show when={!!option.incoming_rate_sms}>
                                                <TableRow>
                                                    <TableCell className="font-normal min-w-24 w-24 sm:min-w-32 sm:w-32">SMS Rate</TableCell>
                                                    <TableCell className="text-right sm:text-left">${option.incoming_rate_sms?.toFixed(2)}/msg</TableCell>
                                                </TableRow>
                                            </Show>
                                            <Show when={!!option.creation_date}>
                                                <TableRow>
                                                    <TableCell className="font-normal min-w-24 w-24 sm:min-w-32 sm:w-32">Creation Date</TableCell>
                                                    <TableCell className="text-right sm:text-left">
                                                        <FormattedDate date={option.creation_date} />
                                                    </TableCell>
                                                </TableRow>
                                            </Show>
                                            <Show when={!!option.paid_till}>
                                                <TableRow>
                                                    <TableCell className="font-normal min-w-24 w-24 sm:min-w-32 sm:w-32">Paid Until</TableCell>
                                                    <TableCell className="text-right sm:text-left">
                                                        <FormattedDate date={option.paid_till} />
                                                    </TableCell>
                                                </TableRow>
                                            </Show>
                                            <Show when={!!option.months_paid}>
                                                <TableRow>
                                                    <TableCell className="font-normal min-w-24 w-24 sm:min-w-32 sm:w-32">Months Paid</TableCell>
                                                    <TableCell className="text-right sm:text-left">{option.months_paid}</TableCell>
                                                </TableRow>
                                            </Show>
                                            <Show when={!!option.voiceDest}>
                                                <TableRow>
                                                    <TableCell className="font-normal min-w-24 w-24 sm:min-w-32 sm:w-32">Voice Destination</TableCell>
                                                    <TableCell className="text-right sm:text-left">{option.voiceDest}</TableCell>
                                                </TableRow>
                                            </Show>
                                            <Show when={!!option.voiceExt && Object.keys(option.voiceExt).length > 0}>
                                                <TableRow>
                                                    <TableCell className="font-normal min-w-24 w-24 sm:min-w-32 sm:w-32">Voice Extensions</TableCell>
                                                    <TableCell className="text-right sm:text-left">{JSON.stringify(option.voiceExt)}</TableCell>
                                                </TableRow>
                                            </Show>
                                            <Show when={!!option.smsDest && Object.keys(option.smsDest).length > 0}>
                                                <TableRow>
                                                    <TableCell className="font-normal min-w-24 w-24 sm:min-w-32 sm:w-32">SMS Destination</TableCell>
                                                    <TableCell className="text-right sm:text-left">{JSON.stringify(option.smsDest)}</TableCell>
                                                </TableRow>
                                            </Show>
                                            <Show when={!!option.docs}>
                                                <TableRow>
                                                    <TableCell className="font-normal min-w-24 w-24 sm:min-w-32 sm:w-32">Documentation</TableCell>
                                                    <TableCell className="text-right sm:text-left">{option.docs}</TableCell>
                                                </TableRow>
                                            </Show>
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    ))
                }

                {/* Footer with select all and delete selected */}
                <div className="flex flex-col sm:flex-row items-center justify-between p-2 border-t border-border mt-2 gap-2">
                    <div className="flex items-center">
                        <Checkbox
                            id="select-all"
                            checked={selectedNumbers.length === (filteredOptions?.length || 0) && (filteredOptions?.length || 0) > 0}
                            onCheckedChange={(checked) => handleSelectAll(checked)}
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
