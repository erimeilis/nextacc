'use client'
import React, {useState} from 'react'
import Show from '@/components/service/Show'
import {NumberInfo} from '@/types/NumberInfo'
import Loader from '@/components/service/Loader'
import {Checkbox} from '@/components/ui/checkbox'
import {Button} from '@/components/ui/button'
import {ChartPieSlice, ChatCircleText, Headset, Info, Pencil, Phone, X} from '@phosphor-icons/react'
import {useTranslations} from 'next-intl'
import {Table, TableBody, TableCell, TableRow} from '@/components/ui/table'
import {FormattedDate} from '@/components/ui/formatted-date'
import {cn} from '@/lib/utils'

export default function MyNumbersList({
                                          options,
                                      }: {
    options: NumberInfo[] | null
}) {
    const t = useTranslations('dashboard')
    const [selectedNumbers, setSelectedNumbers] = useState<string[]>([])
    const [expandedNumbers, setExpandedNumbers] = useState<string[]>([])

    // Calculate totals
    const totalNumbers = options?.length || 0
    const totalMonthlyCost = options?.reduce((sum, option) => sum + option.fix_rate, 0) || 0

    // Handle checkbox selection
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedNumbers(options?.map(option => option.did) || [])
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

    return (
        <Show when={options !== null}
              fallback={options?.length == 0 ?
                  <div>You have no numbers yet</div> :
                  <Loader height={32}/>}>
            <div className="flex flex-col w-full">
                {/* Total section */}
                <div className="flex flex-row justify-between py-2 px-3 bg-muted/30 border-b border-border mb-2">
                    <div>{t('total_numbers')}: {totalNumbers}</div>
                    <div>{t('total_monthly_cost')}: ${totalMonthlyCost?.toFixed(2) || '0.00'}</div>
                </div>

                {/* Header with select all checkboxes */}
                <div className="flex flex-row items-center p-2 border-b border-border mb-1">
                    <div className="flex items-center w-8">
                        <Checkbox
                            id="select-all"
                            checked={selectedNumbers.length === totalNumbers && totalNumbers > 0}
                            onCheckedChange={(checked) => handleSelectAll(checked)}
                        />
                    </div>
                </div>

                {/* Number list */}
                {
                    options?.map((option, i) => (
                        <div key={option.did.toString()} className="mb-1">
                            <div className={cn('flex flex-row items-center w-full text-sm py-0.5 px-2 gap-2', i % 2 != 0 ? 'bg-muted/50 dark:bg-muted/40' : '')}>
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
                                <div className="flex items-center justify-center space-x-2 w-24">
                                    {option.voice && <Phone weight="fill" className="text-primary" size={16}/>}
                                    {option.sms && <ChatCircleText weight="fill" className="text-primary" size={16}/>}
                                    {option.toll_free && <Headset weight="fill" className="text-primary" size={16}/>}
                                </div>

                                {/* Action buttons */}
                                <div className="flex items-center justify-end space-x-1 w-32">
                                    <Button variant="navIcon" size="icon" onClick={() => handleSettings(option)} title="Settings">
                                        <Pencil className="text-primary" size={16}/>
                                    </Button>
                                    <Button variant="navIcon" size="icon" onClick={() => toggleNumberInfo(option.did)} title="Info">
                                        <Info className="text-primary" size={16}/>
                                    </Button>
                                    <Button variant="navIcon" size="icon" onClick={() => handleCallStatistics(option)} title="Call Statistics">
                                        <ChartPieSlice className="text-primary" size={16}/>
                                    </Button>
                                    <Button variant="navIcon" size="icon" onClick={() => handleDelete(option)} title="Delete">
                                        <X className="text-primary" size={16}/>
                                    </Button>
                                </div>
                            </div>

                            {/* Expanded info section */}
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedNumbers.includes(option.did) ? 'max-h-96' : 'max-h-0'}`}>
                                <div className="pl-10 pr-2 py-1 text-sm bg-muted/20 border-l-2 border-muted/25 ml-2">
                                    <Table className="w-full [&_td]:py-1 [&_td]:px-2">
                                        <TableBody>
                                            <TableRow>
                                                <TableCell>DID</TableCell>
                                                <TableCell className="text-right">{option.did}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Name</TableCell>
                                                <TableCell className="text-right">{option.name}</TableCell>
                                            </TableRow>
                                            <Show when={!!option.where_did}>
                                                <TableRow>
                                                    <TableCell>Location</TableCell>
                                                    <TableCell className="text-right">{option.where_did}</TableCell>
                                                </TableRow>
                                            </Show>
                                            <TableRow>
                                                <TableCell>Setup Fee</TableCell>
                                                <TableCell className="text-right">${option.setup_rate?.toFixed(2) || '0.00'}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Monthly Fee</TableCell>
                                                <TableCell className="text-right">${option.fix_rate?.toFixed(2) || '0.00'}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Features</TableCell>
                                                <TableCell className="text-right flex justify-end space-x-2">
                                                    {option.voice && <Phone weight="fill" className="text-primary" size={16}/>}
                                                    {option.sms && <ChatCircleText weight="fill" className="text-primary" size={16}/>}
                                                    {option.toll_free && <Headset weight="fill" className="text-primary" size={16}/>}
                                                </TableCell>
                                            </TableRow>
                                            <Show when={!!option.incoming_per_minute}>
                                                <TableRow>
                                                    <TableCell>Incoming Rate</TableCell>
                                                    <TableCell className="text-right">${option.incoming_per_minute?.toFixed(2)}/min</TableCell>
                                                </TableRow>
                                            </Show>
                                            <Show when={!!option.toll_free_rate_in_min}>
                                                <TableRow>
                                                    <TableCell>Toll Free Rate</TableCell>
                                                    <TableCell className="text-right">${option.toll_free_rate_in_min?.toFixed(2)}/min</TableCell>
                                                </TableRow>
                                            </Show>
                                            <Show when={!!option.incoming_rate_sms}>
                                                <TableRow>
                                                    <TableCell>SMS Rate</TableCell>
                                                    <TableCell className="text-right">${option.incoming_rate_sms?.toFixed(2)}/msg</TableCell>
                                                </TableRow>
                                            </Show>
                                            <Show when={!!option.creation_date}>
                                                <TableRow>
                                                    <TableCell>Creation Date</TableCell>
                                                    <TableCell className="text-right">
                                                        <FormattedDate date={option.creation_date} />
                                                    </TableCell>
                                                </TableRow>
                                            </Show>
                                            <Show when={!!option.paid_till}>
                                                <TableRow>
                                                    <TableCell>Paid Until</TableCell>
                                                    <TableCell className="text-right">
                                                        <FormattedDate date={option.paid_till} />
                                                    </TableCell>
                                                </TableRow>
                                            </Show>
                                            <Show when={!!option.months_paid}>
                                                <TableRow>
                                                    <TableCell>Months Paid</TableCell>
                                                    <TableCell className="text-right">{option.months_paid}</TableCell>
                                                </TableRow>
                                            </Show>
                                            <Show when={!!option.voiceDest}>
                                                <TableRow>
                                                    <TableCell>Voice Destination</TableCell>
                                                    <TableCell className="text-right">{option.voiceDest}</TableCell>
                                                </TableRow>
                                            </Show>
                                            <Show when={!!option.voiceExt && Object.keys(option.voiceExt).length > 0}>
                                                <TableRow>
                                                    <TableCell>Voice Extensions</TableCell>
                                                    <TableCell className="text-right">{JSON.stringify(option.voiceExt)}</TableCell>
                                                </TableRow>
                                            </Show>
                                            <Show when={!!option.smsDest && Object.keys(option.smsDest).length > 0}>
                                                <TableRow>
                                                    <TableCell>SMS Destination</TableCell>
                                                    <TableCell className="text-right">{JSON.stringify(option.smsDest)}</TableCell>
                                                </TableRow>
                                            </Show>
                                            <Show when={!!option.docs}>
                                                <TableRow>
                                                    <TableCell>Documentation</TableCell>
                                                    <TableCell className="text-right">{option.docs}</TableCell>
                                                </TableRow>
                                            </Show>
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
        </Show>
    )
};
