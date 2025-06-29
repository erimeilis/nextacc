'use client'
import React from 'react'
import {useTranslations} from 'next-intl'
import {Input} from '@/components/ui/Input'
import {Checkbox} from '@/components/ui/Checkbox'
import {RadioGroup, RadioGroupItem} from '@/components/ui/RadioGroup'
import {Slider} from '@/components/ui/Slider'
import DropdownSelect from '@/components/shared/DropdownSelect'
import Show from '@/components/service/Show'
import {MyNumberInfo} from '@/types/MyNumberInfo'
import {voiceDestinationsFields} from '@/constants/voiceDestinationFields'
import {PhoneTransferIcon, VoicemailIcon} from '@phosphor-icons/react'

interface ExtManSettingsProps {
    numberData: MyNumberInfo
    formData: Partial<MyNumberInfo>
    onInputChangeAction: (field: keyof MyNumberInfo, value: string | number | boolean | null) => void
    formErrors: Record<string, string>
}

export default function ExtManSettings({
                                           numberData,
                                           formData,
                                           onInputChangeAction,
                                           formErrors
                                       }: ExtManSettingsProps) {
    const t = useTranslations('number-edit')
    const errorT = useTranslations('offers')
    const offersT = useTranslations('offers')

    // Create voice destination options like in BuyNumberForm
    const voiceOptions: { id: string, name: string }[] = voiceDestinationsFields.map((i) => {
        return {id: i.id, name: offersT(i.labelText)}
    })

    // Helper function to map legacy type values to current values
    const mapLegacyTypeValue = (value: string | undefined): string => {
        if (!value) return 'none'

        switch (value) {
            case 'skype':
                return 'voiceTelegram'
            case 'phone':
                return 'voicePhone'
            case 'sip':
                return 'voiceSip'
            default:
                return value
        }
    }

    // Get values from formData with fallbacks to numberData
    // Handle different possible formats of hello_enable (boolean, string '1', string 'true')
    const getHelloEnableValue = (value: boolean | string | number | null | undefined): boolean => {
        if (value === undefined || value === null) return false
        return value === '1' || value === 'true' || Boolean(value)
    }
    const helloEnableState = formData.hello_enable !== undefined
        ? getHelloEnableValue(formData.hello_enable)
        : getHelloEnableValue(numberData.hello_enable)
    const helloFileState = formData.hello_file || numberData.hello_file || ''

    // Get forwarding state - invert the logic from disabled to enabled
    // Also initialize as false (disabled) if f_num1 is empty
    const FirstDestinationState = formData.f_num1 !== undefined ? formData.f_num1 : (numberData.f_num1 || '')
    const hasForwardingNumber = FirstDestinationState.trim() !== ''

    // If forwarding_disabled is explicitly set in formData, use its inverse for forwarding_enabled
    // Otherwise, base it on whether there's a forwarding number
    const forwardingEnabledState = formData.forwarding_disabled !== undefined
        ? !formData.forwarding_disabled
        : (numberData.forwarding_disabled !== undefined ? !numberData.forwarding_disabled : hasForwardingNumber)

    const FirstTypeState = mapLegacyTypeValue(formData.type_num1 || numberData.type_num1) || 'none'
    const FirstDelayState = formData.f_time1 || numberData.f_time1 || 0
    const SecondForwardingState = formData.forward_type2 || numberData.forward_type2 || 'no'
    const SecondTypeState = mapLegacyTypeValue(formData.type_num2 || numberData.type_num2) || 'none'
    const SecondDestinationState = formData.f_num2 !== undefined ? formData.f_num2 : (numberData.f_num2 || '')
    const SecondDelayState = formData.f_time2 || numberData.f_time2 || 0
    const vmState = formData.vm || numberData.vm || null
    const vmFileState = formData.vm_file || numberData.vm_file || ''
    const vmEmailState = formData.vm_email || numberData.vm_email || ''


    // State for conditional rendering using form data
    const isHelloEnabled = helloEnableState
    const isVoicemailEnabled = !!vmState
    const isForwardingEnabled = forwardingEnabledState
    const showTypeNumber2 = SecondForwardingState !== 'no'
    const showForwardTime2 = SecondForwardingState === 'in_series'

    return (
        <Show when={numberData.ff_num !== undefined || numberData.type_num1 !== undefined}>
            <div className="bg-card p-4 rounded-lg">
                <div className="w-full grid grid-cols-1 sm:grid-cols-4 gap-6">
                    <div className="sm:col-span-4">
                        <h2 className="w-full text-muted-foreground text-sm font-light text-right mb-2 flex justify-end items-center">
                            <PhoneTransferIcon className="h-4 w-4 mr-2"/>
                            {t('voice_settings')}
                        </h2>
                    </div>
                    <div className="sm:col-span-3 flex flex-row gap-4">
                        <div className="flex flex-1 flex-row items-center space-x-2">
                            <Checkbox
                                id="hello_enable"
                                checked={isHelloEnabled}
                                onCheckedChange={(checked) => onInputChangeAction('hello_enable', checked)}
                            />
                            <div className="flex flex-col">
                                <label htmlFor="hello_enable" className="text-sm">{t('hello_enable')}</label>
                                <span className="text-xs text-muted-foreground">(IVR)</span>
                            </div>
                        </div>
                        {isHelloEnabled && (
                            <div className="flex-3">
                                <Input
                                    value={helloFileState}
                                    onChange={(e) => onInputChangeAction('hello_file', e.target.value)}
                                    placeholder={t('hello_file')}
                                    hideLabel={true}
                                />
                            </div>
                        )}
                    </div>
                    <div className="sm:col-span-3 flex flex-row gap-4">
                        <div className="flex flex-1 flex-row items-center space-x-2">
                            <Checkbox
                                id="forwarding_disabled"
                                checked={isForwardingEnabled}
                                onCheckedChange={(checked) => onInputChangeAction('forwarding_disabled', !checked)}
                            />
                            <div className="flex flex-col">
                                <label htmlFor="forwarding_disabled" className="text-sm">{t('forwarding_enabled') || 'Enable forwarding'}</label>
                            </div>
                        </div>
                    </div>
                    <div className="sm:col-span-3 space-y-4">
                        <div className="flex flex-row gap-4">
                            <div className="flex flex-row-reverse w-fit sm:flex-1 ml-auto">
                                <DropdownSelect
                                    selectId="type_num1"
                                    selectTitle={offersT('select_voice_destination')}
                                    data={voiceOptions}
                                    onSelectAction={(value) => onInputChangeAction('type_num1', value)}
                                    selectedOption={mapLegacyTypeValue(FirstTypeState)}
                                    customClass="w-fit"
                                    disabled={!isForwardingEnabled}
                                />
                            </div>
                            <div className="flex-2">
                                <Input
                                    value={FirstDestinationState}
                                    onChange={(e) => onInputChangeAction('f_num1', e.target.value)}
                                    placeholder={voiceDestinationsFields.find(f => f.id === FirstTypeState)?.placeholder || t('enter_forward_number')}
                                    className={formErrors.f_num1 ? 'border-red-500' : ''}
                                    hideLabel={true}
                                    disabled={!isForwardingEnabled}
                                />
                                {formErrors.f_num1 && (
                                    <span
                                        className="flex items-center w-fit transition-transform duration-300 font-medium tracking-wide text-destructive-foreground text-xs px-2 py-1 bg-destructive rounded-md">
                                        {errorT.has(formErrors.f_num1) ? errorT(formErrors.f_num1) : formErrors.f_num1}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="hidden sm:block sm:flex-1"></div>
                            <div className="flex-1">
                                <Slider
                                    value={FirstDelayState}
                                    onChangeAction={(value) => onInputChangeAction('f_time1', value)}
                                    min={0}
                                    max={60}
                                    step={5}
                                    label={t('timeout')}
                                    disabled={!isForwardingEnabled}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4 sm:row-span-2 sm:col-span-1">
                        <h3 className={`text-sm font-light pt-2 ${!isForwardingEnabled ? 'text-muted-foreground' : ''}`}>{t('second_forwarding')}</h3>
                        <div className="space-y-4">
                            <RadioGroup
                                value={SecondForwardingState}
                                onValueChange={(value) => onInputChangeAction('forward_type2', value)}
                                className="flex flex-row sm:flex-col space-x-4 sm:space-x-0 sm:space-y-2"
                                disabled={!isForwardingEnabled}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="no" id="forward_type_no"/>
                                    <label htmlFor="forward_type_no" className={`text-sm ${!isForwardingEnabled ? 'text-muted-foreground' : ''}`}>{t('forward_no')}</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="same_time" id="forward_type_same_time"/>
                                    <label htmlFor="forward_type_same_time"
                                           className={`text-sm ${!isForwardingEnabled ? 'text-muted-foreground' : ''}`}>{t('forward_same_time')}</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="in_series" id="forward_type_in_series"/>
                                    <label htmlFor="forward_type_in_series"
                                           className={`text-sm ${!isForwardingEnabled ? 'text-muted-foreground' : ''}`}>{t('forward_in_series')}</label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                    <div className="sm:col-span-3 space-y-4">
                        {showTypeNumber2 && (
                            <>
                                <div className="flex flex-row gap-4">
                                    <div className="flex flex-row-reverse w-fit sm:flex-1 ml-auto">
                                        <DropdownSelect
                                            selectId="type_num2"
                                            selectTitle={offersT('select_voice_destination')}
                                            data={voiceOptions}
                                            onSelectAction={(value) => onInputChangeAction('type_num2', value)}
                                            selectedOption={mapLegacyTypeValue(SecondTypeState)}
                                            customClass="w-fit"
                                            disabled={!isForwardingEnabled}
                                        />
                                    </div>
                                    <div className="flex-2">
                                        <Input
                                            value={SecondDestinationState}
                                            onChange={(e) => onInputChangeAction('f_num2', e.target.value)}
                                            placeholder={voiceDestinationsFields.find(f => f.id === SecondTypeState)?.placeholder || t('enter_forward_number_2')}
                                            className={formErrors.f_num2 ? 'border-red-500' : ''}
                                            hideLabel={true}
                                            disabled={!isForwardingEnabled}
                                        />
                                        {formErrors.f_num2 && (
                                            <span
                                                className="flex items-center w-fit transition-transform duration-300 font-medium tracking-wide text-destructive-foreground text-xs px-2 py-1 bg-destructive rounded-md">
                                                {errorT.has(formErrors.f_num2) ? errorT(formErrors.f_num2) : formErrors.f_num2}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {showForwardTime2 && (
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="hidden sm:block sm:flex-1"></div>
                                        <div className="flex-1">
                                            <Slider
                                                value={SecondDelayState}
                                                onChangeAction={(value) => onInputChangeAction('f_time2', value)}
                                                min={0}
                                                max={60}
                                                step={5}
                                                label={t('timeout')}
                                                disabled={!isForwardingEnabled}
                                            />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <div className="sm:col-span-4 border-t-1 border-muted mt-4 pt-2">
                        <h2 className="w-full text-muted-foreground text-sm font-light text-right mb-2 flex justify-end items-center">
                            <VoicemailIcon className="h-4 w-4 mr-2"/>
                            {t('voice_mail')}
                        </h2>
                    </div>
                    <div className="sm:col-span-3 flex flex-row gap-4">
                        <div className="flex flex-1 flex-row items-center space-x-2">
                            <Checkbox
                                id="vm"
                                checked={!!vmState}
                                onCheckedChange={(checked) => onInputChangeAction('vm', checked ? 1 : 0)}
                            />
                            <div className="flex flex-col">
                                <label htmlFor="vm" className="text-sm">{t('voicemail')}</label>
                                <span className="text-xs text-muted-foreground">{t('if_no_response')}</span>
                            </div>
                        </div>
                        {isVoicemailEnabled && (
                            <div className="flex-3 flex-col space-y-4">
                                <div>
                                    <Input
                                        value={vmFileState}
                                        onChange={(e) => onInputChangeAction('vm_file', e.target.value)}
                                        placeholder={t('vm_file')}
                                        hideLabel={true}
                                    />
                                </div>
                                <div>
                                    <Input
                                        type="email"
                                        value={vmEmailState}
                                        onChange={(e) => onInputChangeAction('vm_email', e.target.value)}
                                        placeholder={t('vm_email')}
                                        className={formErrors.vm_email ? 'border-red-500' : ''}
                                        hideLabel={true}
                                    />
                                    {formErrors.vm_email && (
                                        <p className="flex items-center w-fit transition-transform duration-300 font-medium tracking-wide text-destructive-foreground text-xs mt-1.5 px-2 py-1 bg-destructive rounded-md">{errorT(formErrors.vm_email)}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Show>
    )
}
