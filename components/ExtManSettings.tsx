'use client'
import React, {useState} from 'react'
import {useTranslations} from 'next-intl'
import {Input} from '@/components/ui/Input'
import {Checkbox} from '@/components/ui/Checkbox'
import {RadioGroup, RadioGroupItem} from '@/components/ui/RadioGroup'
import {Slider} from '@/components/ui/Slider'
import DropdownSelect from '@/components/shared/DropdownSelect'
import Show from '@/components/service/Show'
import {DetailedNumberInfo} from '@/types/DetailedNumberInfo'
import {voiceDestinationsFields} from '@/constants/voiceDestinationFields'

interface ExtManSettingsProps {
    numberData: DetailedNumberInfo
    formData: Partial<DetailedNumberInfo>
    onInputChangeAction: (field: keyof DetailedNumberInfo, value: string | number | boolean | null) => void
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
    const helloEnableState = formData.hello_enable || numberData.hello_enable || '0'
    const helloFileState = formData.hello_file || numberData.hello_file || ''
    const FirstTypeState = mapLegacyTypeValue(formData.type_num1 || numberData.type_num1) || 'none'
    const FirstDestinationState = formData.f_num1 !== undefined ? formData.f_num1 : (numberData.f_num1 || '')
    const FirstDelayState = formData.f_time1 || numberData.f_time1 || 0
    const SecondForwardingState = formData.forward_type2 || numberData.forward_type2 || 'no'
    const SecondTypeState = mapLegacyTypeValue(formData.type_num2 || numberData.type_num2) || 'none'
    const SecondDestinationState = formData.f_num2 !== undefined ? formData.f_num2 : (numberData.f_num2 || '')
    const SecondDelayState = formData.f_time2 || numberData.f_time2 || 0
    const ffNumState = formData.ff_num || numberData.ff_num || ''
    const vmState = formData.vm || numberData.vm || null
    const vmFileState = formData.vm_file || numberData.vm_file || ''
    const vmEmailState = formData.vm_email || numberData.vm_email || ''
    const vmBeepState = formData.vm_beep || numberData.vm_beep || ''
    const folowDroidIdState = formData.folow_droid_id || numberData.folow_droid_id || ''
    const showRealCallerIdState = formData.show_real_caller_id || numberData.show_real_caller_id || '0'
    const useUserPbxState = formData.use_user_pbx || numberData.use_user_pbx || '0'
    const extendUserPbxState = formData.extend_user_pbx || numberData.extend_user_pbx || '0'

    // Local state for forwarding enabled - initialize based on f_num1, then manage independently
    const [isForwardingEnabled, setIsForwardingEnabled] = useState(() => {
        return !!(FirstDestinationState && FirstDestinationState.trim())
    })

    // State for conditional rendering using form data
    const isHelloEnabled = helloEnableState === '1' || helloEnableState === 'true'
    const showTypeNumber2 = SecondForwardingState !== 'no'
    const showForwardTime2 = SecondForwardingState === 'in_series'

    return (
        <Show when={numberData.ff_num !== undefined || numberData.type_num1 !== undefined}>
            <div className="bg-card p-6 rounded-lg">
                <h2 className="text-lg font-semibold mb-6">{t('voice_settings')}</h2>

                <div className="space-y-6">
                    {/* 1. Hello enable checkbox -> Hello file input (same row) */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="hello_enable"
                                checked={isHelloEnabled}
                                onCheckedChange={(checked) => onInputChangeAction('hello_enable', checked ? '1' : '0')}
                            />
                            <label htmlFor="hello_enable" className="text-sm font-medium">{t('hello_enable')}</label>
                        </div>
                        {isHelloEnabled && (
                            <div className="flex-1">
                                <Input
                                    value={helloFileState}
                                    onChange={(e) => onInputChangeAction('hello_file', e.target.value)}
                                    placeholder={t('hello_file')}
                                    hideLabel={true}
                                />
                            </div>
                        )}
                    </div>

                    {/* Show all forwarding options only when forwarding is enabled */}
                    <div className="space-y-6">
                        {/* First row = 3 columns: forward enabled, type select, number + slider */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Column 1: Forward enabled checkbox */}
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="forwarding_enable"
                                        checked={isForwardingEnabled}
                                        onCheckedChange={(checked) => {
                                            setIsForwardingEnabled(checked)
                                        }}
                                    />
                                    <label htmlFor="forwarding_enable" className="text-sm font-medium">
                                        {t('forwarding_enabled')}
                                    </label>
                                </div>
                            </div>

                            {/* Column 2 & 3: Type select and number input on one row for mobile */}
                            <div className="md:col-span-2 space-y-4">
                                {/* Select and number input on one row for mobile */}
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
                                    <div className="flex-1">
                                        <Input
                                            value={FirstDestinationState}
                                            onChange={(e) => onInputChangeAction('f_num1', e.target.value)}
                                            placeholder={voiceDestinationsFields.find(f => f.id === FirstTypeState)?.placeholder || 'Enter forward number'}
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
                                            onChange={(value) => onInputChangeAction('f_time1', value)}
                                            min={0}
                                            max={60}
                                            step={5}
                                            label={t('forward_time_1_seconds')}
                                            disabled={!isForwardingEnabled}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Second row = 3 columns: forward type, type select, number + slider */}
                        {isForwardingEnabled && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Column 1: Forward type radio buttons */}
                                <div className="space-y-4">
                                    <div className="space-y-4 pt-2">
                                        <RadioGroup
                                            value={SecondForwardingState}
                                            onValueChange={(value) => onInputChangeAction('forward_type2', value)}
                                            className="flex flex-row sm:flex-col space-x-4 sm:space-x-0 sm:space-y-2"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="no" id="forward_type_no"/>
                                                <label htmlFor="forward_type_no" className="text-sm">No</label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="same_time" id="forward_type_same_time"/>
                                                <label htmlFor="forward_type_same_time" className="text-sm">Same Time</label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="in_series" id="forward_type_in_series"/>
                                                <label htmlFor="forward_type_in_series" className="text-sm">In Series</label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </div>

                                {/* Column 2 & 3: Type select and number input on one row for mobile */}
                                <div className="md:col-span-2 space-y-4">
                                    {showTypeNumber2 && (
                                        <>
                                            {/* Select and number input on one row for mobile */}
                                            <div className="flex flex-row gap-4">
                                                <div className="flex flex-row-reverse w-fit sm:flex-1 ml-auto">
                                                    <DropdownSelect
                                                        selectId="type_num2"
                                                        selectTitle={offersT('select_voice_destination')}
                                                        data={voiceOptions}
                                                        onSelectAction={(value) => onInputChangeAction('type_num2', value)}
                                                        selectedOption={mapLegacyTypeValue(SecondTypeState)}
                                                        customClass="w-fit"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <Input
                                                        value={SecondDestinationState}
                                                        onChange={(e) => onInputChangeAction('f_num2', e.target.value)}
                                                        placeholder={voiceDestinationsFields.find(f => f.id === SecondTypeState)?.placeholder || 'Enter forward number 2'}
                                                        className={formErrors.f_num2 ? 'border-red-500' : ''}
                                                        hideLabel={true}
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
                                                            onChange={(value) => onInputChangeAction('f_time2', value)}
                                                            min={0}
                                                            max={60}
                                                            step={5}
                                                            label={t('forward_time_2_seconds')}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* All the rest goes below */}
                    <div className="border-t pt-6 mt-8">
                        <h3 className="text-md font-medium mb-4">Other Settings</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Input
                                    value={ffNumState}
                                    onChange={(e) => onInputChangeAction('ff_num', e.target.value)}
                                    placeholder={t('forward_number')}
                                    hideLabel={true}
                                />
                            </div>
                            <div>
                                <Input
                                    type="number"
                                    value={vmState?.toString() || ''}
                                    onChange={(e) => onInputChangeAction('vm', e.target.value ? parseInt(e.target.value) : null)}
                                    placeholder={t('voicemail')}
                                    hideLabel={true}
                                />
                            </div>
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
                            <div>
                                <Input
                                    value={vmBeepState}
                                    onChange={(e) => onInputChangeAction('vm_beep', e.target.value)}
                                    placeholder={t('vm_beep')}
                                    hideLabel={true}
                                />
                            </div>
                            <div>
                                <Input
                                    value={folowDroidIdState}
                                    onChange={(e) => onInputChangeAction('folow_droid_id', e.target.value)}
                                    placeholder={t('follow_droid_id')}
                                    hideLabel={true}
                                />
                            </div>
                        </div>

                        {/* Other Checkboxes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="show_real_caller_id"
                                    checked={showRealCallerIdState === '1' || showRealCallerIdState === 'true'}
                                    onCheckedChange={(checked) => onInputChangeAction('show_real_caller_id', checked ? '1' : '0')}
                                />
                                <label htmlFor="show_real_caller_id" className="text-sm font-medium">{t('show_real_caller_id')}</label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="use_user_pbx"
                                    checked={useUserPbxState === '1' || useUserPbxState === 'true'}
                                    onCheckedChange={(checked) => onInputChangeAction('use_user_pbx', checked ? '1' : '0')}
                                />
                                <label htmlFor="use_user_pbx" className="text-sm font-medium">{t('use_user_pbx')}</label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="extend_user_pbx"
                                    checked={extendUserPbxState === '1' || extendUserPbxState === 'true'}
                                    onCheckedChange={(checked) => onInputChangeAction('extend_user_pbx', checked ? '1' : '0')}
                                />
                                <label htmlFor="extend_user_pbx" className="text-sm font-medium">{t('extend_user_pbx')}</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Show>
    )
}
