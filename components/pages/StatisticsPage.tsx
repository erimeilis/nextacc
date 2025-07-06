'use client'
import React, {useEffect, useState} from 'react'
import {useTranslations} from 'next-intl'
import {useParams, useRouter, useSearchParams} from 'next/navigation'
import {ChatTextIcon, PhoneIcon} from '@phosphor-icons/react'
import {Switch} from '@/components/ui/Switch'
import DropdownSelect from '@/components/shared/DropdownSelect'
import CallsList from '@/components/CallsList'
import SmsList from '@/components/SmsList'
import {useClientStore} from '@/stores/useClientStore'

export default function StatisticsPage() {
    const t = useTranslations('Statistics')
    const router = useRouter()
    const searchParams = useSearchParams()
    const params = useParams()

    // State
    const [statisticsType, setStatisticsType] = useState<'calls' | 'sms'>('calls')

    // Get numbers from the client store
    const {getNumbers} = useClientStore()
    const numbers = getNumbers()

    // Get the selected number from the URL params
    const selectedNumberDid = params?.number as string
    const selectedNumber = selectedNumberDid ? numbers?.find(number => number.did === selectedNumberDid) : null

    // Determine switch state based on selected number features
    const isSwitchDisabled = selectedNumber ? (
        (selectedNumber.voice || selectedNumber.toll_free) && !selectedNumber.sms || // Voice/toll_free without SMS
        (!selectedNumber.voice && !selectedNumber.toll_free && selectedNumber.sms)   // SMS only
    ) : false

    // Set default statistics type based on selected number features
    useEffect(() => {
        if (selectedNumber) {
            if ((selectedNumber.voice || selectedNumber.toll_free) && !selectedNumber.sms) {
                // If the number has voice/toll_free but no SMS, set to calls
                setStatisticsType('calls')
            } else if (!selectedNumber.voice && !selectedNumber.toll_free && selectedNumber.sms) {
                // If the number has SMS only, set to sms
                setStatisticsType('sms')
            }
        }
    }, [selectedNumber])

    // Handle number selection
    const handleNumberSelect = (value: string) => {
        const params = searchParams?.toString()
        const queryString = params ? `?${params}` : ''

        if (value === 'all') {
            router.push(`/statistics${queryString}`)
        } else {
            router.push(`/statistics/${value}${queryString}`)
        }
    }

    return (
        <>
            <div className="flex flex-row items-center justify-between mb-4">
                <div className="flex items-center space-x-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                        <PhoneIcon size={16} className={`inline-block ${statisticsType === 'calls' ? 'text-primary' : 'text-muted-foreground'}`}/>
                        <span className={statisticsType === 'calls' ? 'font-medium' : 'text-muted-foreground'}>{t('calls')}</span>
                    </div>
                    <Switch
                        checked={statisticsType === 'sms'}
                        onCheckedChange={(checked) => {
                            if (!isSwitchDisabled) {
                                setStatisticsType(checked ? 'sms' : 'calls')
                            }
                        }}
                        disabled={isSwitchDisabled}
                    />
                    <div className="flex items-center gap-2">
                        <ChatTextIcon size={16} className={`inline-block ${statisticsType === 'sms' ? 'text-primary' : 'text-muted-foreground'}`}/>
                        <span className={statisticsType === 'sms' ? 'font-medium' : 'text-muted-foreground'}>{t('sms')}</span>
                    </div>
                </div>
                <div className="w-max">
                    <DropdownSelect
                        selectId="statistics-number-select"
                        selectTitle={t('select_number')}
                        data={[
                            {id: 'all', name: t('show_all')},
                            ...(numbers?.map(number => ({id: number.did, name: number.did})) || [])
                        ]}
                        selectedOption={selectedNumberDid || 'all'}
                        onSelectAction={handleNumberSelect}
                        customClass="text-xs w-max"
                    />
                </div>
            </div>
            {statisticsType === 'calls' ? (
                <CallsList/>
            ) : (
                <SmsList/>
            )}
        </>
    )
}
