'use client'
import React, {ChangeEvent, useState} from 'react'
import {useTranslations} from 'next-intl'
import {ChatTextIcon, PhoneTransferIcon} from '@phosphor-icons/react'
import DropdownSelect from '@/components/forms/DropdownSelect'
import CommonInput from '@/components/forms/CommonInput'
import {voiceDestinationsFields} from '@/constants/voiceDestinationFields'
import {smsDestinationsFields} from '@/constants/smsDestinationFields'
import {validateInputData} from '@/utils/validation'
import {schemaPhone} from '@/schemas/phone.schema'
import {schemaTelegram} from '@/schemas/telegram.schema'
import {schemaSip} from '@/schemas/sip.schema'
import {schemaEmail} from '@/schemas/email.schema'
import {schemaHttps} from '@/schemas/https.schema'
import {MyWaitingNumberInfo} from '@/types/MyWaitingNumberInfo'

type DestinationSettingsProps = {
    numberData: MyWaitingNumberInfo | null
    formData: Partial<MyWaitingNumberInfo>
    setFormDataAction: React.Dispatch<React.SetStateAction<Partial<MyWaitingNumberInfo>>>
    formErrors: Record<string, string>
    setFormErrorsAction: React.Dispatch<React.SetStateAction<Record<string, string>>>
    initialVoiceType?: string
    initialVoiceDest?: string
    initialSmsType?: string
    initialSmsDest?: string
}

export default function DestinationSettings({
                                                numberData,
                                                formData,
                                                setFormDataAction,
                                                formErrors,
                                                setFormErrorsAction,
                                                initialVoiceType,
                                                initialVoiceDest,
                                                initialSmsType,
                                                initialSmsDest
                                            }: DestinationSettingsProps) {
    const t = useTranslations('offers')

    // Helper function to convert shortened voice type to full type
    const convertVoiceType = (type: string | undefined): string => {
        if (!type) return 'none';

        // If it already has the 'voice' prefix, return as is
        if (type.startsWith('voice')) return type;

        // Convert shortened types to full types
        switch (type.toLowerCase()) {
            case 'phone': return 'voicePhone';
            case 'telegram': return 'voiceTelegram';
            case 'sip': return 'voiceSip';
            default: return type;
        }
    }

    // Helper function to convert shortened SMS type to full type
    const convertSmsType = (type: string | undefined): string => {
        if (!type) return 'none';

        // If it already has the 'sms' prefix, return as is
        if (type.startsWith('sms')) return type;

        // Convert shortened types to full types
        switch (type.toLowerCase()) {
            case 'phone': return 'smsPhone';
            case 'email': return 'smsEmail';
            case 'https': return 'smsHttps';
            case 'telegram': return 'smsTelegram';
            case 'slack': return 'smsSlack';
            default: return type;
        }
    }

    // Initialize state with either initial values or values from numberData
    const [voiceTypeState, setVoiceTypeState] = useState<string>(
        convertVoiceType(initialVoiceType || formData.voiceDestType || numberData?.voiceDestType) || 'none'
    )
    const [smsTypeState, setSmsTypeState] = useState<string>(
        convertSmsType(initialSmsType || formData.smsDestType || numberData?.smsDestType) || 'none'
    )
    const [voiceDestinationState, setVoiceDestinationState] = useState<string>(
        initialVoiceDest || formData.voiceDest || numberData?.voiceDest || ''
    )
    const [smsDestinationState, setSmsDestinationState] = useState<string>(
        initialSmsDest || formData.smsDest || numberData?.smsDest || ''
    )
    const [voiceDestinationErrorState, setVoiceDestinationErrorState] = useState<string>('')
    const [smsDestinationErrorState, setSmsDestinationErrorState] = useState<string>('')


    const handleVoiceTypeChange = (value: string) => {
        setVoiceTypeState(value)
        setVoiceDestinationState('')
        setVoiceDestinationErrorState('')

        // Update formData with the new type and clear destination
        setFormDataAction(prev => ({
            ...prev,
            voiceDestType: value,
            voiceDest: ''
        }))

        // Clear any voice destination errors
        setFormErrorsAction(prev => {
            const newErrors = {...prev}
            delete newErrors.voiceDestination
            return newErrors
        })
    }

    const handleSmsTypeChange = (value: string) => {
        setSmsTypeState(value)
        setSmsDestinationState('')
        setSmsDestinationErrorState('')

        // Update formData with the new type and clear destination
        setFormDataAction(prev => ({
            ...prev,
            smsDestType: value,
            smsDest: ''
        }))

        // Clear any SMS destination errors
        setFormErrorsAction(prev => {
            const newErrors = {...prev}
            delete newErrors.smsDestination
            return newErrors
        })
    }

    const handleVoiceDestinationChange = (e: ChangeEvent<HTMLInputElement>) => {
        let validationError = ''
        let validatedData = ''

        switch (voiceTypeState) {
            case 'voicePhone': {
                const {error, data} = validateInputData(schemaPhone, e.target.value)
                validatedData = data ?? e.target.value.replace(/\D/g, '')
                validationError = error ?? ''
                setVoiceDestinationState(validatedData)
                setVoiceDestinationErrorState(validationError)
            }
                break
            case 'voiceTelegram': {
                if (/^\d/.test(e.target.value)) {
                    const {error, data} = validateInputData(schemaPhone, e.target.value)
                    validatedData = data ?? e.target.value.replace(/\D/g, '')
                    validationError = error ?? ''
                } else {
                    const {error, data} = validateInputData(schemaTelegram, e.target.value)
                    validatedData = data ?? e.target.value.toLowerCase()
                    validationError = error ?? ''
                }
                setVoiceDestinationState(validatedData)
                setVoiceDestinationErrorState(validationError)
            }
                break
            case 'voiceSip': {
                const {error, data} = validateInputData(schemaSip, 'sip/' + e.target.value.toLowerCase().replace(/^sips?[:\/]/, ''))
                validatedData = data ?? 'sip/' + e.target.value.toLowerCase().replace(/^sips?[:\/]/, '')
                validationError = error ?? ''
                setVoiceDestinationState(validatedData)
                setVoiceDestinationErrorState(validationError)
            }
                break
            case 'none': {
                // Intelligently determine a validation type based on input value
                // This ensures appropriate validation when no specific type is selected
                if (/^\d/.test(e.target.value)) {
                    // Value starts with a digit - likely a phone number
                    const {error, data} = validateInputData(schemaPhone, e.target.value)
                    validatedData = data ?? e.target.value.replace(/\D/g, '')
                    validationError = error ?? ''
                } else if (e.target.value.includes('@') || /^[a-zA-Z]/.test(e.target.value)) {
                    // Value contains @ or starts with a letter - likely a Telegram username
                    const {error, data} = validateInputData(schemaTelegram, e.target.value)
                    validatedData = data ?? e.target.value.toLowerCase()
                    validationError = error ?? ''
                } else if (e.target.value.toLowerCase().includes('sip')) {
                    // Value contains 'sip' - likely a SIP address
                    const sipValue = 'sip/' + e.target.value.toLowerCase().replace(/^sips?[:\/]/, '')
                    const {error, data} = validateInputData(schemaSip, sipValue)
                    validatedData = data ?? sipValue
                    validationError = error ?? ''
                } else {
                    // Default to phone validation for other cases
                    const {error, data} = validateInputData(schemaPhone, e.target.value)
                    validatedData = data ?? e.target.value.replace(/\D/g, '')
                    validationError = error ?? ''
                }
                setVoiceDestinationState(validatedData)
                setVoiceDestinationErrorState(validationError)
            }
                break
            default: {
                // Use the same validation as the 'none' case
                if (/^\d/.test(e.target.value)) {
                    // Value starts with a digit - likely a phone number
                    const {error, data} = validateInputData(schemaPhone, e.target.value)
                    validatedData = data ?? e.target.value.replace(/\D/g, '')
                    validationError = error ?? ''
                } else if (e.target.value.includes('@') || /^[a-zA-Z]/.test(e.target.value)) {
                    // Value contains @ or starts with a letter - likely a Telegram username
                    const {error, data} = validateInputData(schemaTelegram, e.target.value)
                    validatedData = data ?? e.target.value.toLowerCase()
                    validationError = error ?? ''
                } else if (e.target.value.toLowerCase().includes('sip')) {
                    // Value contains 'sip' - likely a SIP address
                    const sipValue = 'sip/' + e.target.value.toLowerCase().replace(/^sips?[:\/]/, '')
                    const {error, data} = validateInputData(schemaSip, sipValue)
                    validatedData = data ?? sipValue
                    validationError = error ?? ''
                } else {
                    // Default to phone validation for other cases
                    const {error, data} = validateInputData(schemaPhone, e.target.value)
                    validatedData = data ?? e.target.value.replace(/\D/g, '')
                    validationError = error ?? ''
                }
                setVoiceDestinationState(validatedData)
                setVoiceDestinationErrorState(validationError)
            }
        }

        // Update formData with the new value
        setFormDataAction(prev => ({
            ...prev,
            voiceDest: validatedData,
            voiceDestType: voiceTypeState
        }))

        // Update formErrors
        setFormErrorsAction(prev => {
            const newErrors = {...prev}
            if (validationError) {
                newErrors.voiceDestination = validationError
            } else {
                delete newErrors.voiceDestination
            }
            return newErrors
        })
    }

    const handleSmsDestinationChange = (e: ChangeEvent<HTMLInputElement>) => {
        let validationError = ''
        let validatedData = ''

        switch (smsTypeState) {
            case 'smsPhone': {
                const {error, data} = validateInputData(schemaPhone, e.target.value)
                validatedData = data ?? e.target.value.replace(/\D/g, '')
                validationError = error ?? ''
                setSmsDestinationState(validatedData)
                setSmsDestinationErrorState(validationError)
            }
                break
            case 'smsEmail': {
                const {error, data} = validateInputData(schemaEmail, e.target.value.toLowerCase())
                validatedData = data ?? e.target.value.toLowerCase()
                validationError = error ?? ''
                setSmsDestinationState(validatedData)
                setSmsDestinationErrorState(validationError)
            }
                break
            case 'smsHttps':
            case 'smsTelegram':
            case 'smsSlack': {
                const inputValue = (/^https?:\/\//.test(e.target.value))
                    ? e.target.value.toLowerCase()
                    : 'https://' + e.target.value.toLowerCase()
                const {error, data} = validateInputData(schemaHttps, inputValue)
                validatedData = data ?? inputValue
                validationError = error ?? ''
                setSmsDestinationState(validatedData)
                setSmsDestinationErrorState(validationError)
            }
                break
            case 'none': {
                // Even if no type is selected, try to detect and validate the input format
                if (/^\d/.test(e.target.value)) {
                    // Looks like a phone number
                    const {error, data} = validateInputData(schemaPhone, e.target.value)
                    validatedData = data ?? e.target.value.replace(/\D/g, '')
                    validationError = error ?? ''
                } else if (/@/.test(e.target.value)) {
                    // Looks like an email
                    const {error, data} = validateInputData(schemaEmail, e.target.value.toLowerCase())
                    validatedData = data ?? e.target.value.toLowerCase()
                    validationError = error ?? ''
                } else if (/^https?:\/\//.test(e.target.value) || e.target.value.includes('.')) {
                    // Looks like a URL
                    const inputValue = (/^https?:\/\//.test(e.target.value))
                        ? e.target.value.toLowerCase()
                        : 'https://' + e.target.value.toLowerCase()
                    const {error, data} = validateInputData(schemaHttps, inputValue)
                    validatedData = data ?? inputValue
                    validationError = error ?? ''
                } else {
                    validatedData = e.target.value
                }
                setSmsDestinationState(validatedData)
                setSmsDestinationErrorState(validationError)
            }
                break
            default: {
                // Use the same validation as the 'none' case
                if (/^\d/.test(e.target.value)) {
                    // Looks like a phone number
                    const {error, data} = validateInputData(schemaPhone, e.target.value)
                    validatedData = data ?? e.target.value.replace(/\D/g, '')
                    validationError = error ?? ''
                } else if (/@/.test(e.target.value)) {
                    // Looks like an email
                    const {error, data} = validateInputData(schemaEmail, e.target.value.toLowerCase())
                    validatedData = data ?? e.target.value.toLowerCase()
                    validationError = error ?? ''
                } else if (/^https?:\/\//.test(e.target.value) || e.target.value.includes('.')) {
                    // Looks like a URL
                    const inputValue = (/^https?:\/\//.test(e.target.value))
                        ? e.target.value.toLowerCase()
                        : 'https://' + e.target.value.toLowerCase()
                    const {error, data} = validateInputData(schemaHttps, inputValue)
                    validatedData = data ?? inputValue
                    validationError = error ?? ''
                } else {
                    validatedData = e.target.value
                }
                setSmsDestinationState(validatedData)
                setSmsDestinationErrorState(validationError)
            }
        }

        // Update formData with the new value
        setFormDataAction(prev => ({
            ...prev,
            smsDest: validatedData,
            smsDestType: smsTypeState
        }))

        // Update formErrors
        setFormErrorsAction(prev => {
            const newErrors = {...prev}
            if (validationError) {
                newErrors.smsDestination = validationError
            } else {
                delete newErrors.smsDestination
            }
            return newErrors
        })
    }

    // Convert voice and SMS destination fields to dropdown options
    const voice: { id: string, name: string }[] = voiceDestinationsFields.map((i) => {
        return {id: i.id, name: t(i.labelText)}
    })
    const sms: { id: string, name: string }[] = smsDestinationsFields.map((i) => {
        return {id: i.id, name: t(i.labelText)}
    })

    const voiceDestination = voiceDestinationsFields.find(i => i.id === voiceTypeState)
    const smsDestination = smsDestinationsFields.find(i => i.id === smsTypeState)

    return (
        <div className="bg-card pt-4 px-4 rounded-lg">
            {/* Voice forwarding */}
            {numberData?.voice || numberData?.toll_free ? (
                <div className="flex w-full flex-col xl:flex-row items-start sm:gap-2">
                    <div className="flex w-full flex-row items-center gap-3">
                        <div className="flex flex-row items-center">
                            <PhoneTransferIcon size={24} className="text-primary"/>
                        </div>
                        <DropdownSelect
                            selectId="voiceType"
                            selectTitle={t('select_voice_destination')}
                            data={voice}
                            onSelectAction={handleVoiceTypeChange}
                            selectedOption={voiceTypeState}
                            customClass="w-full"
                        />
                    </div>
                    <CommonInput
                        handleChangeAction={handleVoiceDestinationChange}
                        value={voiceDestinationState}
                        labelText={voiceDestination ? t(voiceDestination.labelText) : t('select_voice_destination')}
                        labelFor={voiceDestination ? voiceDestination.labelFor : ''}
                        id={voiceDestination ? voiceDestination.id : ''}
                        name={voiceDestination ? voiceDestination.name : ''}
                        type={voiceDestination ? voiceDestination.type : ''}
                        isRequired={numberData.voice || numberData.toll_free}
                        placeholder={voiceDestination ? voiceDestination.placeholder : ''}
                        icon={voiceDestination ? voiceDestination.icon : undefined}
                        error={
                            formErrors.voiceDestination
                                ? t(formErrors.voiceDestination)
                                : (t.has(voiceDestinationErrorState) ? t(voiceDestinationErrorState) : '')
                        }
                        customClass="w-full pl-9 sm:pl-0"
                        hideLabel={true}
                    />
                </div>
            ) : null}

            {/* SMS forwarding */}
            {numberData?.sms ? (
                <div className="flex w-full flex-col xl:flex-row items-start sm:gap-2">
                    <div className="flex w-full flex-row items-center gap-3">
                        <div className="flex flex-row items-center">
                            <ChatTextIcon size={24} className="text-primary"/>
                        </div>
                        <DropdownSelect
                            selectId="smsType"
                            selectTitle={t('select_sms_destination')}
                            data={sms}
                            onSelectAction={handleSmsTypeChange}
                            selectedOption={smsTypeState}
                            customClass="w-full"
                        />
                    </div>
                    <CommonInput
                        handleChangeAction={handleSmsDestinationChange}
                        value={smsDestinationState}
                        labelText={smsDestination ? t(smsDestination.labelText) : t('select_sms_destination')}
                        labelFor={smsDestination ? smsDestination.labelFor : ''}
                        id={smsDestination ? smsDestination.id : ''}
                        name={smsDestination ? smsDestination.name : ''}
                        type={smsDestination ? smsDestination.type : ''}
                        isRequired={numberData.sms || numberData.toll_free}
                        placeholder={smsDestination ? smsDestination.placeholder : ''}
                        icon={smsDestination ? smsDestination.icon : undefined}
                        error={
                            formErrors.smsDestination
                                ? t(formErrors.smsDestination)
                                : (t.has(smsDestinationErrorState) ? t(smsDestinationErrorState) : '')
                        }
                        customClass="w-full pl-9 sm:pl-0"
                        hideLabel={true}
                    />
                </div>
            ) : null}
        </div>
    )
}
