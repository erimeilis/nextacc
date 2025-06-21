'use client'
import React, {useEffect, useState} from 'react'
import {useParams, useRouter, useSearchParams} from 'next/navigation'
import {useTranslations} from 'next-intl'
import {Button} from '@/components/ui/Button'
import {ArrowLeftIcon, CircleNotchIcon, FloppyDiskIcon, XIcon} from '@phosphor-icons/react'
import {redGetNumberDetails, redUpdateNumberDetails} from '@/app/api/redreport/numbers'
import Loader from '@/components/service/Loader'
import {DetailedNumberInfo} from '@/types/DetailedNumberInfo'
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

    const [numberData, setNumberData] = useState<DetailedNumberInfo | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState<Partial<DetailedNumberInfo>>({})
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    // Load number details on component mount
    useEffect(() => {
        const loadNumberDetails = async () => {
            if (!number) return

            setLoading(true)
            try {
                const data = await redGetNumberDetails(number)
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
    const handleInputChange = (field: keyof DetailedNumberInfo, value: string | number | boolean | null) => {
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
                    // Only validate if value is not empty
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
                                // Intelligently determine validation type based on input value
                                // This ensures appropriate validation when no specific type is selected
                                if (/^\d/.test(value)) {
                                    // Value starts with digit - likely a phone number
                                    const phoneValidation = validateInputData(schemaPhone, value)
                                    validationError = phoneValidation.error || ''
                                } else if (value.includes('@') || /^[a-zA-Z]/.test(value)) {
                                    // Value contains @ or starts with letter - likely a Telegram username
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
                    // If value is empty, validationError remains empty string, which will clear any existing errors
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
    const handleSave = async () => {
        console.log('[DEBUG_LOG] handleSave function called!')
        console.log('[DEBUG_LOG] number:', number)
        console.log('[DEBUG_LOG] formData exists:', !!formData)
        console.log('[DEBUG_LOG] formData:', formData)

        if (!number || !formData) {
            console.log('[DEBUG_LOG] Early return triggered - number or formData missing')
            console.log('[DEBUG_LOG] number missing:', !number)
            console.log('[DEBUG_LOG] formData missing:', !formData)
            return
        }

        // Clear previous form errors
        //setFormErrors({})

        // Debug: Log form data being submitted
        console.log('[DEBUG_LOG] Form data being submitted:', JSON.stringify(formData, null, 2))
        console.log('[DEBUG_LOG] Form data keys:', Object.keys(formData))

        // Validate form data
        const {errors} = validateFormData(schemaNumberEdit, formData)

        // Debug: Log validation result
        console.log('[DEBUG_LOG] Validation result - errors:', errors)
        console.log('[DEBUG_LOG] Errors type:', typeof errors)
        console.log('[DEBUG_LOG] Errors is null:', errors === null)
        console.log('[DEBUG_LOG] Errors is undefined:', errors === undefined)
        console.log('[DEBUG_LOG] Errors keys length:', errors ? Object.keys(errors).length : 'N/A')
        console.log('[DEBUG_LOG] Condition check - errors exists:', !!errors)
        console.log('[DEBUG_LOG] Condition check - has keys:', errors ? Object.keys(errors).length > 0 : false)

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
            console.error('[DEBUG_LOG] Detailed validation errors:', errors)
            console.error('[DEBUG_LOG] Formatted errors for UI:', formattedErrors)

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
            const updatedData = await redUpdateNumberDetails(number, formData)
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
            className="mt-8 space-y-8 transition-all duration-500 ease-in-out"
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
                    <h1 className="text-lg font-bold">{t('edit_number')} {number}</h1>
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
