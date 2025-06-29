'use client'
import React, {useEffect, useState} from 'react'
import {useParams, useRouter, useSearchParams} from 'next/navigation'
import {useTranslations} from 'next-intl'
import {Button} from '@/components/ui/Button'
import {Input} from '@/components/ui/Input'
import {Checkbox} from '@/components/ui/Checkbox'
import {ArrowLeftIcon, CircleNotchIcon, FadersHorizontalIcon, FloppyDiskIcon, XIcon} from '@phosphor-icons/react'
import {redGetDidSettings, redUpdateDidSettings} from '@/app/api/redreport/dids'
import Loader from '@/components/service/Loader'
import {MyNumberInfo} from '@/types/MyNumberInfo'
import ExtManSettings from '../ExtManSettings'
import SmsSettings from '../SmsSettings'
import {useToast} from '@/hooks/use-toast'
import {schemaNumberEdit} from '@/schemas/numberEdit.schema'
import {validateFormData, validateInputData} from '@/utils/validation'
import {schemaEmail} from '@/schemas/email.schema'
import {schemaPhone} from '@/schemas/phone.schema'
import {schemaHttps} from '@/schemas/https.schema'
import {schemaTelegram} from '@/schemas/telegram.schema'
import {schemaSip} from '@/schemas/sip.schema'

export default function NumberEditPage() {
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const number = params?.number as string
    const t = useTranslations('number-edit')
    const toastT = useTranslations('toast')
    const {toast} = useToast()

    const [numberData, setNumberData] = useState<MyNumberInfo | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState<Partial<MyNumberInfo>>({})
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    // Load number details on component mount
    useEffect(() => {
        const loadNumberDetails = async () => {
            if (!number) return

            setLoading(true)
            try {
                const data = await redGetDidSettings(number)
                if (data) {
                    setNumberData(data)
                    setFormData(data)
                }
            } catch (error) {
                console.error('Failed to load number details:', error)
            } finally {
                setLoading(false)
            }
        }

        loadNumberDetails().then()
    }, [number])

    // Handle form field changes
    const handleInputChange = (field: keyof MyNumberInfo, value: string | number | boolean | null) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))

        // Real-time validation for specific fields
        let validationError = ''
        if (typeof value === 'string' && (value.trim() !== '' || field === 'f_num1' || field === 'f_num2')) {
            switch (field) {
                case 'vm_email':
                case 'forward_email':
                    const emailResult = validateInputData(schemaEmail, value)
                    validationError = emailResult.error || ''
                    break
                case 'forward_sms':
                    const phoneResult = validateInputData(schemaPhone, value)
                    validationError = phoneResult.error || ''
                    break
                case 'forward_http':
                case 'forward_telegram':
                case 'forward_slack':
                    const urlResult = validateInputData(schemaHttps, value)
                    validationError = urlResult.error || ''
                    break
                case 'f_num1':
                case 'f_num2':
                    // Only validate if the value is not empty
                    if (value.trim() !== '') {
                        // Get the corresponding type field for validation
                        const typeField = field === 'f_num1' ? 'type_num1' : 'type_num2'
                        // Check both formData and numberData for the type to ensure validation works from start
                        const currentType = formData[typeField] || numberData?.[typeField] || ''

                        // Map legacy type values to current values
                        const mapLegacyTypeValue = (typeValue: string): string => {
                            switch (typeValue) {
                                case 'skype':
                                    return 'voiceTelegram'
                                case 'phone':
                                    return 'voicePhone'
                                case 'sip':
                                    return 'voiceSip'
                                default:
                                    return typeValue
                            }
                        }

                        const mappedType = mapLegacyTypeValue(currentType)
                        // Validate based on type
                        switch (mappedType) {
                            case 'voicePhone': {
                                const phoneValidation = validateInputData(schemaPhone, value)
                                validationError = phoneValidation.error || ''
                                break
                            }
                            case 'voiceTelegram': {
                                if (/^\d/.test(value)) {
                                    const phoneValidation = validateInputData(schemaPhone, value)
                                    validationError = phoneValidation.error || ''
                                } else {
                                    const telegramValidation = validateInputData(schemaTelegram, value)
                                    validationError = telegramValidation.error || ''
                                }
                                break
                            }
                            case 'voiceSip': {
                                const sipValue = 'sip/' + value.toLowerCase().replace(/^sips?[:\/]/, '')
                                const sipValidation = validateInputData(schemaSip, sipValue)
                                validationError = sipValidation.error || ''
                                break
                            }
                            default: {
                                // Intelligently determine a validation type based on input value
                                // This ensures appropriate validation when no specific type is selected
                                if (/^\d/.test(value)) {
                                    // Value starts with a digit - likely a phone number
                                    const phoneValidation = validateInputData(schemaPhone, value)
                                    validationError = phoneValidation.error || ''
                                } else if (value.includes('@') || /^[a-zA-Z]/.test(value)) {
                                    // Value contains @ or starts with a letter - likely a Telegram username
                                    const telegramValidation = validateInputData(schemaTelegram, value)
                                    validationError = telegramValidation.error || ''
                                } else if (value.toLowerCase().includes('sip')) {
                                    // Value contains 'sip' - likely a SIP address
                                    const sipValue = 'sip/' + value.toLowerCase().replace(/^sips?[:\/]/, '')
                                    const sipValidation = validateInputData(schemaSip, sipValue)
                                    validationError = sipValidation.error || ''
                                } else {
                                    // Default to phone validation for other cases
                                    const phoneValidation = validateInputData(schemaPhone, value)
                                    validationError = phoneValidation.error || ''
                                }
                                break
                            }
                        }
                    }
                    // If value is empty, validationError remains an empty string, which will clear any existing errors
                    break
            }
        }

        // Update form errors
        setFormErrors(prev => {
            const newErrors = {...prev}
            if (validationError) {
                newErrors[field] = validationError
            } else {
                delete newErrors[field]
            }
            return newErrors
        })
    }

    // Handle form submission
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault() // Prevent page reload
        if (!number || !formData) {
            return
        }

        // Use formData directly for submission and ensure required fields are not undefined
        const dataToSubmit = {
            ...formData,
            // Ensure name is never undefined - use empty string as fallback
            name: formData.name ?? numberData?.name ?? '',
            // Ensure autorenew is never undefined - use false as fallback
            autorenew: formData.autorenew ?? numberData?.autorenew ?? false
        }

        // Special case for forwarding_disabled
        if (dataToSubmit.forwarding_disabled) {
            // If forwarding is disabled, clear all forwarding fields
            dataToSubmit.type_num1 = 'none'
            dataToSubmit.f_num1 = ''
            dataToSubmit.type_num2 = 'none'
            dataToSubmit.f_num2 = ''
            dataToSubmit.f_time1 = 0
            dataToSubmit.f_time2 = 0
            dataToSubmit.forward_type2 = 'no'
        }
        // Special case for forward_type2
        else if (dataToSubmit.forward_type2 === 'no') {
            // If forward_type2 is set to "no", update multiple fields at once
            dataToSubmit.type_num2 = 'none'
            dataToSubmit.f_num2 = ''
            dataToSubmit.f_time2 = 60
        }

        // Custom validation: either voice greeting or forwarding must be enabled
        const isHelloEnabled = Boolean(dataToSubmit.hello_enable)
        const isForwardingEnabled = !dataToSubmit.forwarding_disabled

        if (!isHelloEnabled && !isForwardingEnabled) {
            // If neither voice greeting nor forwarding is enabled, show an error
            const formattedErrors: Record<string, string> = {}
            formattedErrors['hello_enable'] = 'forwarding_or_greeting_required'
            setFormErrors(formattedErrors)

            // Show error toast for validation
            toast({
                variant: 'destructive',
                title: toastT('validation_error_title'),
                description: t('forwarding_or_greeting_required'),
            })

            return
        }

        // Validate form data
        const {errors} = validateFormData(schemaNumberEdit, dataToSubmit)

        // If there are validation errors, display them and stop submission
        if (errors && Object.keys(errors).length > 0) {
            // Convert errors from Record<string, string[] | undefined> to Record<string, string>
            const formattedErrors: Record<string, string> = {}
            Object.entries(errors).forEach(([key, value]) => {
                if (value && Array.isArray(value) && value.length > 0) {
                    formattedErrors[key] = value[0] // Take the first error message
                }
            })
            setFormErrors(formattedErrors)

            // Show error toast for validation
            toast({
                variant: 'destructive',
                title: toastT('validation_error_title'),
                description: toastT('validation_error_description'),
            })

            return
        }

        console.log('[DEBUG_LOG] Validation passed, proceeding to save...')
        setSaving(true)
        try {
            console.log('[DEBUG_LOG] Calling API to update number details...')
            const updatedData = await redUpdateDidSettings(number, dataToSubmit)
            console.log('[DEBUG_LOG] API response received:', updatedData)
            if (updatedData) {
                setNumberData(updatedData)
                console.log('[DEBUG_LOG] Save successful, showing success toast')

                // Show success toast
                toast({
                    variant: 'success',
                    title: toastT('success_title'),
                    description: toastT('number_updated_successfully'),
                })
            } else {
                console.log('[DEBUG_LOG] API returned no data')
            }
        } catch (error) {
            console.error('[DEBUG_LOG] Failed to save number details:', error)

            // Show error toast
            toast({
                variant: 'destructive',
                title: toastT('error_title'),
                description: toastT('failed_to_save_changes'),
            })
        } finally {
            setSaving(false)
        }
    }

    // Handle back navigation
    const handleBack = () => {
        const backUrl = `/numbers/?${searchParams?.toString()}`
        router.push(backUrl)
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader height={32}/>
            </div>
        )
    }

    if (!numberData) {
        return (
            <div className="text-center py-8">
                <p>{t('number_not_found')}</p>
                <Button onClick={handleBack} className="mt-4">
                    {t('back_to_numbers')}
                </Button>
            </div>
        )
    }

    return (
        <form
            id="editNumberForm"
            name="editNumberForm"
            className="mt-4 space-y-2 transition-all duration-500 ease-in-out"
            onSubmit={handleSave}
            method="post"
        >
            {/* Header */}
            <div className="flex items-center justify-between text-sm mb-4">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        type="button"
                        size="icon"
                        onClick={handleBack}
                        className="h-7 w-7"
                    >
                        <ArrowLeftIcon size={16}/>
                    </Button>
                    <h1 className="text-md font-light">{t('edit_number')} {number}</h1>
                </div>
                <div className="flex space-x-2">
                    <Button
                        variant="ghost"
                        type="button"
                        size="icon"
                        onClick={handleBack}
                        title={t('cancel')}
                        className="h-7 w-7 text-destructive"
                    >
                        <XIcon size={16}/>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        type="submit"
                        disabled={saving}
                        title={saving ? t('saving') : t('save_changes')}
                        className="h-7 w-7"
                    >
                        {saving ? (
                            <CircleNotchIcon size={16} className="animate-spin"/>
                        ) : (
                            <FloppyDiskIcon size={16}/>
                        )}
                    </Button>
                </div>
            </div>

            {/* Form */}
            <div className="space-y-6">
                {/* Basic Number Settings */}
                <div className="bg-card p-4 rounded-lg">
                    <div className="w-full grid grid-cols-4 gap-6">
                        <div className="col-span-4">
                            <h2 className="w-full text-muted-foreground text-sm font-light text-right mb-2 flex justify-end items-center">
                                <FadersHorizontalIcon className="h-4 w-4 mr-2"/>
                                {t('basic_settings')}
                            </h2>
                        </div>
                        <div className="col-span-3">
                            <Input
                                id="name"
                                value={formData.name !== undefined ? formData.name : numberData.name || ''}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder={t('name_placeholder')}
                                className="mt-1"
                            />
                        </div>
                        <div className="col-span-1">
                            <div className="flex flex-row items-center space-x-2 h-full">
                                <Checkbox
                                    id="autorenew"
                                    checked={formData.autorenew !== undefined ? formData.autorenew : numberData.autorenew}
                                    onCheckedChange={(checked) => handleInputChange('autorenew', checked)}
                                />
                                <label htmlFor="autorenew" className="text-sm">
                                    {t('autorenew')}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ExtMan Settings (for voice/toll-free numbers) */}
                <ExtManSettings
                    numberData={numberData}
                    formData={formData}
                    onInputChangeAction={handleInputChange}
                    formErrors={formErrors}
                />

                {/* SMS Settings */}
                <SmsSettings
                    numberData={numberData}
                    formData={formData}
                    onInputChangeAction={handleInputChange}
                    formErrors={formErrors}
                />

            </div>

            {/* Save Button (bottom) */}
            <div className="flex justify-end space-x-2 pt-4">
                <Button
                    variant="ghost"
                    type="button"
                    size="icon"
                    onClick={handleBack}
                    title={t('cancel')}
                    className="h-7 w-7 text-destructive"
                >
                    <XIcon size={16}/>
                </Button>
                <Button
                    variant="ghost"
                    type="submit"
                    size="icon"
                    disabled={saving}
                    title={saving ? t('saving') : t('save_changes')}
                    className="h-7 w-7"
                >
                    {saving ? (
                        <CircleNotchIcon size={16} className="animate-spin"/>
                    ) : (
                        <FloppyDiskIcon size={16}/>
                    )}
                </Button>
            </div>
        </form>
    )
}
