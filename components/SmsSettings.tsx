'use client'
import React from 'react'
import {useTranslations} from 'next-intl'
import {Input} from '@/components/ui/Input'
import {Checkbox} from '@/components/ui/Checkbox'
import Show from '@/components/service/Show'
import {DetailedNumberInfo} from '@/types/DetailedNumberInfo'

interface SmsSettingsProps {
    numberData: DetailedNumberInfo
    formData: Partial<DetailedNumberInfo>
    onInputChangeAction: (field: keyof DetailedNumberInfo, value: string | number | boolean | null) => void
    formErrors: Record<string, string>
}

export default function SmsSettings({
                                        numberData,
                                        formData,
                                        onInputChangeAction,
                                        formErrors
                                    }:
                                    SmsSettingsProps) {
    const t = useTranslations('number-edit')
    const errorT = useTranslations('offers')

    return (
        <Show when={numberData.sms_activated !== undefined}>
            <div className="bg-card p-6 rounded-lg">
                <h2 className="text-lg font-semibold mb-4">{t('sms_settings')}</h2>
                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="sms_activated"
                            checked={formData.sms_activated || false}
                            onCheckedChange={(checked) => onInputChangeAction('sms_activated', checked)}
                        />
                        <label htmlFor="sms_activated" className="text-sm font-medium">{t('sms_activated')}</label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="forward_email_activate"
                                checked={formData.forward_email_activate || false}
                                onCheckedChange={(checked) => onInputChangeAction('forward_email_activate', checked)}
                            />
                            <label htmlFor="forward_email_activate" className="text-sm font-medium">{t('forward_email')}</label>
                        </div>
                        <div>
                            <Input
                                type="email"
                                placeholder={t('email_address_placeholder')}
                                value={formData.forward_email || ''}
                                onChange={(e) => onInputChangeAction('forward_email', e.target.value)}
                                disabled={!formData.forward_email_activate}
                                className={formErrors.forward_email ? 'border-red-500' : ''}
                            />
                            {formErrors.forward_email && (
                                <p className="flex items-center w-fit transition-transform duration-300 font-medium tracking-wide text-destructive-foreground text-xs mt-1.5 px-2 py-1 bg-destructive rounded-md">{errorT(formErrors.forward_email)}</p>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="forward_http_activate"
                                checked={formData.forward_http_activate || false}
                                onCheckedChange={(checked) => onInputChangeAction('forward_http_activate', checked)}
                            />
                            <label htmlFor="forward_http_activate" className="text-sm font-medium">{t('forward_http')}</label>
                        </div>
                        <div>
                            <Input
                                type="url"
                                placeholder={t('http_url_placeholder')}
                                value={formData.forward_http || ''}
                                onChange={(e) => onInputChangeAction('forward_http', e.target.value)}
                                disabled={!formData.forward_http_activate}
                                className={formErrors.forward_http ? 'border-red-500' : ''}
                            />
                            {formErrors.forward_http && (
                                <p className="flex items-center w-fit transition-transform duration-300 font-medium tracking-wide text-destructive-foreground text-xs mt-1.5 px-2 py-1 bg-destructive rounded-md">{errorT(formErrors.forward_http)}</p>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="forward_telegram_activate"
                                checked={formData.forward_telegram_activate || false}
                                onCheckedChange={(checked) => onInputChangeAction('forward_telegram_activate', checked)}
                            />
                            <label htmlFor="forward_telegram_activate" className="text-sm font-medium">{t('forward_telegram')}</label>
                        </div>
                        <div>
                            <Input
                                placeholder={t('telegram_id_placeholder')}
                                value={formData.forward_telegram || ''}
                                onChange={(e) => onInputChangeAction('forward_telegram', e.target.value)}
                                disabled={!formData.forward_telegram_activate}
                                className={formErrors.forward_telegram ? 'border-red-500' : ''}
                            />
                            {formErrors.forward_telegram && (
                                <p className="flex items-center w-fit transition-transform duration-300 font-medium tracking-wide text-destructive-foreground text-xs mt-1.5 px-2 py-1 bg-destructive rounded-md">{errorT(formErrors.forward_telegram)}</p>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="forward_slack_activate"
                                checked={formData.forward_slack_activate || false}
                                onCheckedChange={(checked) => onInputChangeAction('forward_slack_activate', checked)}
                            />
                            <label htmlFor="forward_slack_activate" className="text-sm font-medium">{t('forward_slack')}</label>
                        </div>
                        <div>
                            <Input
                                placeholder={t('slack_webhook_placeholder')}
                                value={formData.forward_slack || ''}
                                onChange={(e) => onInputChangeAction('forward_slack', e.target.value)}
                                disabled={!formData.forward_slack_activate}
                                className={formErrors.forward_slack ? 'border-red-500' : ''}
                            />
                            {formErrors.forward_slack && (
                                <p className="flex items-center w-fit transition-transform duration-300 font-medium tracking-wide text-destructive-foreground text-xs mt-1.5 px-2 py-1 bg-destructive rounded-md">{errorT(formErrors.forward_slack)}</p>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="forward_sms_activate"
                                checked={formData.forward_sms_activate || false}
                                onCheckedChange={(checked) => onInputChangeAction('forward_sms_activate', checked)}
                            />
                            <label htmlFor="forward_sms_activate" className="text-sm font-medium">{t('forward_sms')}</label>
                        </div>
                        <div>
                            <Input
                                placeholder={t('phone_number_placeholder')}
                                value={formData.forward_sms || ''}
                                onChange={(e) => onInputChangeAction('forward_sms', e.target.value)}
                                disabled={!formData.forward_sms_activate}
                                className={formErrors.forward_sms ? 'border-red-500' : ''}
                            />
                            {formErrors.forward_sms && (
                                <p className="flex items-center w-fit transition-transform duration-300 font-medium tracking-wide text-destructive-foreground text-xs mt-1.5 px-2 py-1 bg-destructive rounded-md">{errorT(formErrors.forward_sms)}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Show>
    )
}
