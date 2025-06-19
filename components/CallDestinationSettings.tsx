'use client'
import React from 'react'
import {useTranslations} from 'next-intl'
import {Input} from '@/components/ui/Input'
import {Checkbox} from '@/components/ui/Checkbox'
import Show from '@/components/service/Show'
import {DetailedNumberInfo} from '@/types/DetailedNumberInfo'

interface CallDestinationSettingsProps {
    numberData: DetailedNumberInfo
    formData: Partial<DetailedNumberInfo>
    onInputChange: (field: keyof DetailedNumberInfo, value: string | number | boolean | null) => void
}

export default function CallDestinationSettings({ numberData, formData, onInputChange }: CallDestinationSettingsProps) {
    const t = useTranslations('number-edit')

    return (
        <Show when={numberData.call_destination !== undefined}>
            <div className="bg-card p-6 rounded-lg">
                <h2 className="text-lg font-semibold mb-4">{t('call_destination_settings')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('call_destination')}</label>
                        <Input
                            value={formData.call_destination || ''}
                            onChange={(e) => onInputChange('call_destination', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('call_priority')}</label>
                        <Input
                            type="number"
                            value={formData.call_priority || ''}
                            onChange={(e) => onInputChange('call_priority', e.target.value ? parseInt(e.target.value) : null)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('follow_droid_caller_id')}</label>
                        <Input
                            value={formData.follow_droid_caller_id || ''}
                            onChange={(e) => onInputChange('follow_droid_caller_id', e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="call_activated"
                            checked={formData.call_activated || false}
                            onCheckedChange={(checked) => onInputChange('call_activated', checked)}
                        />
                        <label htmlFor="call_activated" className="text-sm font-medium">{t('call_activated')}</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="voip_call"
                            checked={formData.voip_call || false}
                            onCheckedChange={(checked) => onInputChange('voip_call', checked)}
                        />
                        <label htmlFor="voip_call" className="text-sm font-medium">{t('voip_call')}</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="call_show_real_caller_id"
                            checked={formData.call_show_real_caller_id || false}
                            onCheckedChange={(checked) => onInputChange('call_show_real_caller_id', checked)}
                        />
                        <label htmlFor="call_show_real_caller_id" className="text-sm font-medium">{t('show_real_caller_id')}</label>
                    </div>
                </div>
            </div>
        </Show>
    )
}
