'use client'
import React, {useEffect, useState} from 'react'
import {useTranslations} from 'next-intl'
import {Input} from '@/components/ui/Input'
import {Checkbox} from '@/components/ui/Checkbox'
import {RadioGroup, RadioGroupItem} from '@/components/ui/RadioGroup'
import DropdownSelect from '@/components/shared/DropdownSelect'
import Show from '@/components/service/Show'
import {DetailedNumberInfo} from '@/types/DetailedNumberInfo'
import {voiceDestinationsFields} from '@/constants/voiceDestinationFields'
import {validateInputData} from '@/utils/validation'
import {schemaPhone} from '@/schemas/phone.schema'
import {schemaTelegram} from '@/schemas/telegram.schema'
import {schemaSip} from '@/schemas/sip.schema'

interface ExtManSettingsProps {
    numberData: DetailedNumberInfo
    formData: Partial<DetailedNumberInfo>
    onInputChange: (field: keyof DetailedNumberInfo, value: string | number | boolean | null) => void
    formErrors: Record<string, string>
}

// Simple Slider component
const Slider = ({
                    value,
                    onChange,
                    min = 0,
                    max = 60,
                    step = 1,
                    label,
                    disabled = false
                }: {
    value: number
    onChange: (value: number) => void
    min?: number
    max?: number
    step?: number
    label: string
    disabled?: boolean
}) => {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium">{label}</label>
                <span className="text-sm text-muted-foreground">{value}s</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                disabled={disabled}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            />
        </div>
    )
}

// Telegram prefix constant
const TELEGRAM_PREFIX = '213231231'

// Helper function to check if number has telegram prefix
const hasTelegramPrefix = (number: string): boolean => {
    return number.startsWith(TELEGRAM_PREFIX)
}

// Helper function to remove telegram prefix from number
const removeTelegramPrefix = (number: string): string => {
    if (hasTelegramPrefix(number)) {
        return number.substring(TELEGRAM_PREFIX.length)
    }
    return number
}

// Helper function to add telegram prefix to number
const addTelegramPrefix = (number: string): string => {
    if (!hasTelegramPrefix(number)) {
        return TELEGRAM_PREFIX + number
    }
    return number
}


// Helper function to get display value for input (removes telegram prefix for display, but keeps sip prefix)
const getDisplayValue = (value: string): string => {
    if (!value) return ''

    // Always remove the telegram prefix if present, regardless of the selected type
    if (hasTelegramPrefix(value)) {
        return removeTelegramPrefix(value)
    }

    // For SIP, we keep the prefix visible to the user (like in BuyNumberForm)
    return value
}


// Helper function to validate forward number based on the detected type
const validateForwardNumber = (forwardNumber: string, detectedType: string): { error: string, data: string } => {
    if (!forwardNumber) return {error: '', data: ''}

    switch (detectedType) {
        case 'voicePhone': {
            const {error, data} = validateInputData(schemaPhone, forwardNumber)
            return {
                error: error || '',
                data: data || forwardNumber.replace(/\D/g, '')
            }
        }
        case 'voiceTelegram': {
            // Check if it has a telegram prefix - if so, validate the number without prefix
            if (hasTelegramPrefix(forwardNumber)) {
                const numberWithoutPrefix = removeTelegramPrefix(forwardNumber)
                if (/^\d/.test(numberWithoutPrefix)) {
                    const {error, data} = validateInputData(schemaPhone, numberWithoutPrefix)
                    return {
                        error: error || '',
                        data: data ? addTelegramPrefix(data) : addTelegramPrefix(numberWithoutPrefix.replace(/\D/g, ''))
                    }
                } else {
                    const {error, data} = validateInputData(schemaTelegram, numberWithoutPrefix)
                    return {
                        error: error || '',
                        data: data ? addTelegramPrefix(data) : addTelegramPrefix(numberWithoutPrefix.toLowerCase())
                    }
                }
            } else {
                // Regular telegram validation
                if (/^\d/.test(forwardNumber)) {
                    const {error, data} = validateInputData(schemaPhone, forwardNumber)
                    return {
                        error: error || '',
                        data: data ? addTelegramPrefix(data) : addTelegramPrefix(forwardNumber.replace(/\D/g, ''))
                    }
                } else {
                    const {error, data} = validateInputData(schemaTelegram, forwardNumber)
                    return {
                        error: error || '',
                        data: data ? addTelegramPrefix(data) : addTelegramPrefix(forwardNumber.toLowerCase())
                    }
                }
            }
        }
        case 'voiceSip': {
            const sipValue = 'sip/' + forwardNumber.toLowerCase().replace(/^sips?[:\/]/, '')
            const {error, data} = validateInputData(schemaSip, sipValue)
            return {
                error: error || '',
                data: data || sipValue
            }
        }
        default:
            return {error: '', data: forwardNumber}
    }
}

export default function ExtManSettings({numberData, formData, onInputChange, formErrors}: ExtManSettingsProps) {
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

    // State for validation errors
    const [f_num1_error, setF_num1_error] = useState<string>('')
    const [f_num2_error, setF_num2_error] = useState<string>('')

    // State for forwarding enabled - can be manually controlled
    const [isForwardingEnabled, setIsForwardingEnabled] = useState<boolean>(
        !!(formData.f_num1 && formData.f_num1.trim())
    )

    // State for conditional rendering
    const isHelloEnabled = formData.hello_enable === '1' || formData.hello_enable === 'true'
    const forwardType2 = formData.forward_type2 || 'no'
    const showTypeNumber2 = forwardType2 !== 'no'
    const showForwardTime2 = forwardType2 === 'in_series'

    // Handle forward number 1 change with validation
    const handleF_num1Change = (value: string) => {
        if (value.trim()) {
            let valueToStore = value

            // Handle different input types like in BuyNumberForm
            if (formData.type_num1 === 'voiceTelegram' && !hasTelegramPrefix(value)) {
                valueToStore = addTelegramPrefix(value)
            } else if (formData.type_num1 === 'voiceSip') {
                // For SIP, always add prefix like in BuyNumberForm
                valueToStore = 'sip/' + value.toLowerCase().replace(/^sips?[:\/]/, '')
            }

            // Save the value (with prefix if telegram or sip)
            onInputChange('f_num1', valueToStore)

            // Use a manually selected type for validation
            if (formData.type_num1) {
                const validation = validateForwardNumber(valueToStore, formData.type_num1)
                setF_num1_error(validation.error)
            } else {
                setF_num1_error('')
            }

            // Update forwarding enabled state
            setIsForwardingEnabled(true)
        } else {
            onInputChange('f_num1', value)
            setF_num1_error('')
            // Update forwarding enabled state
            setIsForwardingEnabled(false)
        }
    }

    // Handle forward number 2 change with validation
    const handleF_num2Change = (value: string) => {
        if (value.trim()) {
            let valueToStore = value

            // Handle different input types like in BuyNumberForm
            if (formData.type_num2 === 'voiceTelegram' && !hasTelegramPrefix(value)) {
                valueToStore = addTelegramPrefix(value)
            } else if (formData.type_num2 === 'voiceSip') {
                // For SIP, always add prefix like in BuyNumberForm
                valueToStore = 'sip/' + value.toLowerCase().replace(/^sips?[:\/]/, '')
            }

            // Save the value (with prefix if telegram or sip)
            onInputChange('f_num2', valueToStore)

            // Use a manually selected type for validation
            if (formData.type_num2) {
                const validation = validateForwardNumber(valueToStore, formData.type_num2)
                setF_num2_error(validation.error)
            } else {
                setF_num2_error('')
            }
        } else {
            onInputChange('f_num2', value)
            setF_num2_error('')
        }
    }

    // Update validation when form data changes
    useEffect(() => {
        // Sync forwarding enabled state with f_num1 existence
        setIsForwardingEnabled(!!(formData.f_num1 && formData.f_num1.trim()))

        if (formData.f_num1 && formData.type_num1) {
            // Validate using a manually selected type
            const validation = validateForwardNumber(formData.f_num1, formData.type_num1)
            setF_num1_error(validation.error)
        } else {
            setF_num1_error('')
        }

        if (formData.f_num2 && formData.type_num2) {
            // Validate using a manually selected type
            const validation = validateForwardNumber(formData.f_num2, formData.type_num2)
            setF_num2_error(validation.error)
        } else {
            setF_num2_error('')
        }
    }, [formData.f_num1, formData.f_num2, formData.type_num1, formData.type_num2])

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
                                onCheckedChange={(checked) => onInputChange('hello_enable', checked ? '1' : '0')}
                            />
                            <label htmlFor="hello_enable" className="text-sm font-medium">{t('hello_enable')}</label>
                        </div>
                        {isHelloEnabled && (
                            <div className="flex-1">
                                <Input
                                    value={formData.hello_file || ''}
                                    onChange={(e) => onInputChange('hello_file', e.target.value)}
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
                                        onCheckedChange={(checked) => setIsForwardingEnabled(!!checked)}
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
                                            onSelectAction={(value) => onInputChange('type_num1', value)}
                                            selectedOption={mapLegacyTypeValue(formData.type_num1)}
                                            customClass="w-fit"
                                            disabled={!isForwardingEnabled}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <Input
                                            value={getDisplayValue(formData.f_num1 || '')}
                                            onChange={(e) => handleF_num1Change(e.target.value)}
                                            placeholder={voiceDestinationsFields.find(f => f.id === formData.type_num1)?.placeholder || 'Enter forward number'}
                                            className={f_num1_error ? 'border-red-500' : ''}
                                            hideLabel={true}
                                            disabled={!isForwardingEnabled}
                                        />
                                    </div>
                                </div>
                                {f_num1_error && (
                                    <span
                                        className="flex items-center w-fit transition-transform duration-300 font-medium tracking-wide text-destructive-foreground text-xs mt-1.5 px-2 py-1 bg-destructive rounded-md">
                                        {errorT.has(f_num1_error) ? errorT(f_num1_error) : f_num1_error}
                                    </span>
                                )}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="hidden sm:block sm:flex-1"></div>
                                    <div className="flex-1">
                                        <Slider
                                            value={formData.f_time1 as number || 0}
                                            onChange={(value) => onInputChange('f_time1', value)}
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
                                            value={forwardType2}
                                            onValueChange={(value) => onInputChange('forward_type2', value)}
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
                                                        onSelectAction={(value) => onInputChange('type_num2', value)}
                                                        selectedOption={mapLegacyTypeValue(formData.type_num2)}
                                                        customClass="w-fit"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <Input
                                                        value={getDisplayValue(formData.f_num2 || '')}
                                                        onChange={(e) => handleF_num2Change(e.target.value)}
                                                        placeholder={voiceDestinationsFields.find(f => f.id === formData.type_num2)?.placeholder || 'Enter forward number 2'}
                                                        className={f_num2_error ? 'border-red-500' : ''}
                                                        hideLabel={true}
                                                    />
                                                </div>
                                            </div>
                                            {f_num2_error && (
                                                <span
                                                    className="flex items-center w-fit transition-transform duration-300 font-medium tracking-wide text-destructive-foreground text-xs mt-1.5 px-2 py-1 bg-destructive rounded-md">
                                                    {errorT.has(f_num2_error) ? errorT(f_num2_error) : f_num2_error}
                                                </span>
                                            )}
                                            {showForwardTime2 && (
                                                <div className="flex flex-col sm:flex-row gap-4">
                                                    <div className="hidden sm:block sm:flex-1"></div>
                                                    <div className="flex-1">
                                                        <Slider
                                                            value={formData.f_time2 as number || 0}
                                                            onChange={(value) => onInputChange('f_time2', value)}
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
                                    value={formData.ff_num || ''}
                                    onChange={(e) => onInputChange('ff_num', e.target.value)}
                                    placeholder={t('forward_number')}
                                    hideLabel={true}
                                />
                            </div>
                            <div>
                                <Input
                                    type="number"
                                    value={formData.vm || ''}
                                    onChange={(e) => onInputChange('vm', e.target.value ? parseInt(e.target.value) : null)}
                                    placeholder={t('voicemail')}
                                    hideLabel={true}
                                />
                            </div>
                            <div>
                                <Input
                                    value={formData.vm_file || ''}
                                    onChange={(e) => onInputChange('vm_file', e.target.value)}
                                    placeholder={t('vm_file')}
                                    hideLabel={true}
                                />
                            </div>
                            <div>
                                <Input
                                    type="email"
                                    value={formData.vm_email || ''}
                                    onChange={(e) => onInputChange('vm_email', e.target.value)}
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
                                    value={formData.vm_beep || ''}
                                    onChange={(e) => onInputChange('vm_beep', e.target.value)}
                                    placeholder={t('vm_beep')}
                                    hideLabel={true}
                                />
                            </div>
                            <div>
                                <Input
                                    value={formData.folow_droid_id || ''}
                                    onChange={(e) => onInputChange('folow_droid_id', e.target.value)}
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
                                    checked={formData.show_real_caller_id === '1' || formData.show_real_caller_id === 'true'}
                                    onCheckedChange={(checked) => onInputChange('show_real_caller_id', checked ? '1' : '0')}
                                />
                                <label htmlFor="show_real_caller_id" className="text-sm font-medium">{t('show_real_caller_id')}</label>
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
                </div>
            </div>
        </Show>
    )
}
