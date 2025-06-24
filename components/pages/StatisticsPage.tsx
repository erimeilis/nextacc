'use client'
import React, {useState} from 'react'
import {useTranslations} from 'next-intl'
import {useRouter} from 'next/navigation'
import {ChatTextIcon, PhoneIcon} from '@phosphor-icons/react'
import {Switch} from '@/components/ui/Switch'
import DropdownSelect from '@/components/shared/DropdownSelect'
import CallsList from '@/components/CallsList'
import SmsList from '@/components/SmsList'
import {useClientStore} from '@/stores/useClientStore'

export default function StatisticsPage() {
    const t = useTranslations('Statistics')
    const router = useRouter()

    // State
    const [statisticsType, setStatisticsType] = useState<'calls' | 'sms'>('calls')

    // Get numbers from client store
    const { getNumbers } = useClientStore()
    const numbers = getNumbers()

    // Handle number selection
    const handleNumberSelect = (value: string) => {
        if (value === "all") {
            router.push('/statistics')
        } else {
            router.push(`/statistics/${value}`)
        }
    }

    return (
        <>
            <div className="flex flex-row items-center justify-between -mb-8">
                <div className="flex items-center space-x-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                        <PhoneIcon size={16} className={`inline-block ${statisticsType === 'calls' ? 'text-primary' : 'text-muted-foreground'}`}/>
                        <span className={statisticsType === 'calls' ? 'font-medium' : 'text-muted-foreground'}>{t('calls')}</span>
                    </div>
                    <Switch
                        checked={statisticsType === 'sms'}
                        onCheckedChange={(checked) => setStatisticsType(checked ? 'sms' : 'calls')}
                    />
                    <div className="flex items-center gap-2">
                        <ChatTextIcon size={16} className={`inline-block ${statisticsType === 'sms' ? 'text-primary' : 'text-muted-foreground'}`}/>
                        <span className={statisticsType === 'sms' ? 'font-medium' : 'text-muted-foreground'}>{t('sms')}</span>
                    </div>
                </div>
                <div className="w-64">
                    <DropdownSelect
                        selectId="statistics-number-select"
                        selectTitle={t('select_number')}
                        data={[
                            { id: "all", name: t('show_all') },
                            ...(numbers?.map(number => ({ id: number.did, name: number.did })) || [])
                        ]}
                        onSelectAction={handleNumberSelect}
                        customClass="h-8 text-xs"
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
