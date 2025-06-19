'use client'
import React from 'react'
import {useTranslations} from 'next-intl'
import {Input} from '@/components/ui/Input'
import {Checkbox} from '@/components/ui/Checkbox'
import Show from '@/components/service/Show'
import {DetailedNumberInfo} from '@/types/DetailedNumberInfo'

interface ExtManSettingsProps {
    numberData: DetailedNumberInfo
    formData: Partial<DetailedNumberInfo>
    onInputChange: (field: keyof DetailedNumberInfo, value: string | number | boolean | null) => void
}

export default function ExtManSettings({ numberData, formData, onInputChange }: ExtManSettingsProps) {
    const t = useTranslations('number-edit')

    return (
        <Show when={numberData.ff_num !== undefined || numberData.type_num1 !== undefined}>
            <div className="bg-card p-6 rounded-lg">
                <h2 className="text-lg font-semibold mb-4">{t('voice_settings')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('forward_number')}</label>
                        <Input
                            value={formData.ff_num || ''}
                            onChange={(e) => onInputChange('ff_num', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('type_number_1')}</label>
                        <Input
                            value={formData.type_num1 || ''}
                            onChange={(e) => onInputChange('type_num1', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('forward_number_1')}</label>
                        <Input
                            value={formData.f_num1 || ''}
                            onChange={(e) => onInputChange('f_num1', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('forward_type_2')}</label>
                        <Input
                            value={formData.forward_type2 || ''}
                            onChange={(e) => onInputChange('forward_type2', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('type_number_2')}</label>
                        <Input
                            value={formData.type_num2 || ''}
                            onChange={(e) => onInputChange('type_num2', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('forward_number_2')}</label>
                        <Input
                            value={formData.f_num2 || ''}
                            onChange={(e) => onInputChange('f_num2', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('forward_time_1_seconds')}</label>
                        <Input
                            type="number"
                            value={formData.f_time1 || ''}
                            onChange={(e) => onInputChange('f_time1', e.target.value ? parseInt(e.target.value) : null)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('forward_time_2_seconds')}</label>
                        <Input
                            type="number"
                            value={formData.f_time2 || ''}
                            onChange={(e) => onInputChange('f_time2', e.target.value ? parseInt(e.target.value) : null)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('voicemail')}</label>
                        <Input
                            type="number"
                            value={formData.vm || ''}
                            onChange={(e) => onInputChange('vm', e.target.value ? parseInt(e.target.value) : null)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('vm_file')}</label>
                        <Input
                            value={formData.vm_file || ''}
                            onChange={(e) => onInputChange('vm_file', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('vm_email')}</label>
                        <Input
                            type="email"
                            value={formData.vm_email || ''}
                            onChange={(e) => onInputChange('vm_email', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('vm_beep')}</label>
                        <Input
                            value={formData.vm_beep || ''}
                            onChange={(e) => onInputChange('vm_beep', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('hello_file')}</label>
                        <Input
                            value={formData.hello_file || ''}
                            onChange={(e) => onInputChange('hello_file', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('follow_droid_id')}</label>
                        <Input
                            value={formData.folow_droid_id || ''}
                            onChange={(e) => onInputChange('folow_droid_id', e.target.value)}
                        />
                    </div>
                </div>

                {/* Checkboxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="hello_enable"
                            checked={formData.hello_enable === '1' || formData.hello_enable === 'true'}
                            onCheckedChange={(checked) => onInputChange('hello_enable', checked ? '1' : '0')}
                        />
                        <label htmlFor="hello_enable" className="text-sm font-medium">{t('hello_enable')}</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="show_real_caller_id"
                            checked={formData.show_real_caller_id === '1' || formData.show_real_caller_id === 'true'}
                            onCheckedChange={(checked) => onInputChange('show_real_caller_id', checked ? '1' : '0')}
                        />
                        <label htmlFor="show_real_caller_id" className="text-sm font-medium">{t('show_real_caller_id')}</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="call_to_all_device"
                            checked={formData.call_to_all_device === '1' || formData.call_to_all_device === 'true'}
                            onCheckedChange={(checked) => onInputChange('call_to_all_device', checked ? '1' : '0')}
                        />
                        <label htmlFor="call_to_all_device" className="text-sm font-medium">{t('call_to_all_device')}</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="use_user_pbx"
                            checked={formData.use_user_pbx === '1' || formData.use_user_pbx === 'true'}
                            onCheckedChange={(checked) => onInputChange('use_user_pbx', checked ? '1' : '0')}
                        />
                        <label htmlFor="use_user_pbx" className="text-sm font-medium">{t('use_user_pbx')}</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="extend_user_pbx"
                            checked={formData.extend_user_pbx === '1' || formData.extend_user_pbx === 'true'}
                            onCheckedChange={(checked) => onInputChange('extend_user_pbx', checked ? '1' : '0')}
                        />
                        <label htmlFor="extend_user_pbx" className="text-sm font-medium">{t('extend_user_pbx')}</label>
                    </div>
                </div>
            </div>
        </Show>
    )
}
