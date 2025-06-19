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
import CallDestinationSettings from '../CallDestinationSettings'
import {useToast} from '@/hooks/use-toast'
import {schemaNumberEdit} from '@/schemas/numberEdit.schema'
import {validateFormData, validateInputData} from '@/utils/validation'
import {schemaEmail} from '@/schemas/email.schema'
import {schemaPhone} from '@/schemas/phone.schema'
import {schemaHttps} from '@/schemas/https.schema'

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
        if (typeof value === 'string' && value.trim() !== '') {
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
        if (!number || !formData) return

        // Clear previous form errors
        setFormErrors({})

        // Validate form data
        const {errors} = validateFormData(schemaNumberEdit, formData)

        // If there are validation errors, display them and stop submission
        if (errors) {
            // Convert errors from Record<string, string[] | undefined> to Record<string, string>
            const formattedErrors: Record<string, string> = {}
            Object.entries(errors).forEach(([key, value]) => {
                if (value && Array.isArray(value) && value.length > 0) {
                    formattedErrors[key] = value[0] // Take the first error message
                }
            })
            setFormErrors(formattedErrors)
            console.error('Validation errors:', errors)

            // Show error toast for validation
            toast({
                variant: 'destructive',
                title: toastT('validation_error_title'),
                description: toastT('validation_error_description'),
            })

            return
        }

        setSaving(true)
        try {
            const updatedData = await redUpdateNumberDetails(number, formData)
            if (updatedData) {
                setNumberData(updatedData)

                // Show success toast
                toast({
                    variant: 'success',
                    title: toastT('success_title'),
                    description: toastT('number_updated_successfully'),
                })
            }
        } catch (error) {
            console.error('Failed to save number details:', error)

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
        <>
            {/* Header */}
            <div className="flex items-center justify-between text-sm mb-4">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
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
                        onClick={handleSave}
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
                    onInputChange={handleInputChange}
                    formErrors={formErrors}
                />

                {/* SMS Settings */}
                <SmsSettings
                    numberData={numberData}
                    formData={formData}
                    onInputChange={handleInputChange}
                    formErrors={formErrors}
                />

                {/* Call Destination Settings */}
                <CallDestinationSettings
                    numberData={numberData}
                    formData={formData}
                    onInputChange={handleInputChange}
                    formErrors={formErrors}
                />
            </div>

            {/* Save Button (bottom) */}
            <div className="flex justify-end space-x-2 pt-4">
                <Button
                    variant="ghost"
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
                    onClick={handleSave}
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
        </>
    )
}
