'use client'
import React, {ChangeEvent, SyntheticEvent, useMemo, useState} from 'react'
import {NumberInfo} from '@/types/NumberInfo'
import DropdownSelect from '@/components/shared/DropdownSelect'
import {useTranslations} from 'next-intl'
import ActionButton from '@/components/shared/ActionButton'
import CommonInput from '@/components/shared/CommonInput'
import {voiceDestinationsFields} from '@/constants/voiceDestinationFields'
import {smsDestinationsFields} from '@/constants/smsDestinationFields'
import {validateFormData, validateInputData} from '@/utils/validation'
import {schemaPhone} from '@/schemas/phone.schema'
import {schemaTelegram} from '@/schemas/telegram.schema'
import {schemaSip} from '@/schemas/sip.schema'
import {schemaEmail} from '@/schemas/email.schema'
import {schemaHttps} from '@/schemas/https.schema'
import {z} from 'zod'
import {ChatTextIcon, PhoneTransferIcon} from '@phosphor-icons/react'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/Table'
import usePersistState, {getPersistState} from '@/utils/usePersistState'
import {ClientInfo} from '@/types/ClientInfo'
import {useToast} from '@/hooks/use-toast'
import {useRouter} from 'next/navigation'
import {CountryInfo} from '@/types/CountryInfo'
import {AreaInfo} from '@/types/AreaInfo'
import {Card} from '@/components/ui/Card'
import {useAddToCart, useBuyNumbers} from '@/hooks/queries/use-cart'
import {useDiscounts} from '@/hooks/queries/use-offers'
import {useUploads, useUploadFile} from '@/hooks/queries/use-uploads'
import {useAuthSession} from '@/hooks/use-auth-session'

export default function BuyNumberForm({
                                          numberInfo,
                                          countryId,
                                          areaCode,
                                          countriesMap,
                                          areasMap
                                      }: {
    numberInfo: NumberInfo | null
    countryId: number | null
    areaCode: number | null
    countriesMap: CountryInfo[] | null
    areasMap: AreaInfo[] | null
}) {
    const router = useRouter()

    const t = useTranslations('offers')
    const d = useTranslations('docs')
    const toastT = useTranslations('toast')
    const persistentId = getPersistState<string>('persistentId', 'no-id')
    const [persistentClientInfo, setPersistentClientInfo] = usePersistState<ClientInfo>({
        'ip': '',
        'country': '',
    }, 'persistentClientInfo')

    // TanStack Query hooks
    const addToCartMutation = useAddToCart()
    const buyNumbersMutation = useBuyNumbers()
    const {data: discountsData = []} = useDiscounts()
    const {data: uploads = []} = useUploads()
    const uploadFileMutation = useUploadFile()
    const {status: authStatus} = useAuthSession()
    const isUserLoggedIn = authStatus === 'authenticated'

    const {toast} = useToast()
    const getClientInfo = async () => {
        const res = await fetch('https://ipinfo.io/json?token=39d5c35f2d7eb1')
        const info = await res.json()
        setPersistentClientInfo(info)
    }

    const voice: { id: string, name: string }[] = voiceDestinationsFields.map((i) => {
        return {id: i.id, name: t(i.labelText)}
    })
    const sms: { id: string, name: string }[] = smsDestinationsFields.map((i) => {
        return {id: i.id, name: t(i.labelText)}
    })
    const handleFormSubmit = async (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault()

        // Get the button that was clicked
        const buttonId = (e.nativeEvent as SubmitEvent).submitter?.id || null
        setLoadingButton(buttonId)

        // Clear previous form errors
        setFormErrors({})

        try {
            if (numberInfo) {
                // Create form a data object for validation
                const formData = {
                    qty: discountState,
                    voiceType: voiceTypeState,
                    voiceDestination: voiceDestinationState,
                    smsType: smsTypeState,
                    smsDestination: smsDestinationState,
                    // Include document type selection if document requirements are present
                    ...(numberInfo.docs_personal?.length > 0 || numberInfo.docs_business?.length > 0 ? {docType: selectedDocType || ''} : {}),
                    // Include document uploads based on the selected type
                    ...(selectedDocType === 'personal' ? personalDocUploads :
                        selectedDocType === 'business' ? businessDocUploads : {})
                }

                // Validate form data
                const schema = createFormSchema(numberInfo)
                const {errors} = validateFormData(schema, formData)

                // If there are validation errors, display them and stop submission
                if (errors) {
                    setFormErrors(errors)
                    toast({
                        variant: 'destructive',
                        title: toastT('validation_error_title'),
                        description: toastT('validation_error_description'),
                    })

                    return
                }

                // Additional validation for specific field types
                let hasFieldErrors = false

                // Validate voice destination based on type
                if (numberInfo.voice || numberInfo.toll_free) {
                    if (voiceTypeState === 'voicePhone' && voiceDestinationErrorState) {
                        hasFieldErrors = true
                    } else if (voiceTypeState === 'voiceTelegram' && voiceDestinationErrorState) {
                        hasFieldErrors = true
                    } else if (voiceTypeState === 'voiceSip' && voiceDestinationErrorState) {
                        hasFieldErrors = true
                    }
                }

                // Validate SMS destination based on type
                if (numberInfo.sms) {
                    if (smsTypeState === 'smsPhone' && smsDestinationErrorState) {
                        hasFieldErrors = true
                    } else if (smsTypeState === 'smsEmail' && smsDestinationErrorState) {
                        hasFieldErrors = true
                    } else if ((smsTypeState === 'smsHttps' || smsTypeState === 'smsTelegram' || smsTypeState === 'smsSlack') && smsDestinationErrorState) {
                        hasFieldErrors = true
                    }
                }

                // If there are field-specific errors, stop submission
                if (hasFieldErrors) {
                    toast({
                        variant: 'destructive',
                        title: toastT('validation_error_title'),
                        description: toastT('validation_error_description'),
                    })
                    return
                }

                // Prepare common parameters for both cart and buy actions
                const commonParams = {
                    clientInfo: persistentClientInfo,
                    uid: persistentId,
                    number: numberInfo,
                    countryId: countryId,
                    areaCode: areaCode,
                    qty: Number(qty?.name ?? 1),
                    voice: numberInfo.voice || numberInfo.toll_free ?
                        {type: voiceTypeState, destination: voiceDestinationState} :
                        undefined,
                    sms: numberInfo.sms ?
                        {type: smsTypeState, destination: smsDestinationState} :
                        undefined,
                    docs: selectedDocType === 'personal' && personalDocUploads ?
                        Object.entries(personalDocUploads).map(([key, value]) => {
                            // Remove 'doc_' prefix from key
                            const type = key.startsWith('doc_') ? key.substring(4) : key
                            return {type, file: value}
                        }) :
                        selectedDocType === 'business' && businessDocUploads ?
                            Object.entries(businessDocUploads).map(([key, value]) => {
                                // Remove the 'doc _' prefix from a key
                                const type = key.startsWith('doc_') ? key.substring(4) : key
                                return {type, file: value}
                            }) : undefined
                }

                await getClientInfo()

                // Determine which action to take based on the button clicked
                if (buttonId === 'buy') {
                    buyNumbersMutation.mutate(
                        {
                            ...commonParams,
                            numbers: [numberInfo]
                        },
                        {
                            onSuccess: (response) => {
                                // Show success toast with the appropriate message
                                const isManual = response && 'status' in response && response.status === 'pending'
                                toast({
                                    variant: 'success',
                                    title: toastT('success_title'),
                                    description: isManual
                                        ? toastT('buy_success_manual')
                                        : toastT('buy_success'),
                                    onDismiss: () => {
                                        setSelectedDocType(null)
                                        // If the type is manual, redirect to waiting-numbers page
                                        const url = new URL(window.location.href)
                                        if (isManual) {
                                            router.push('/waiting-numbers' + url.search)
                                        } else {
                                            router.push('/numbers' + url.search)
                                        }
                                    }
                                })
                            },
                            onError: (error) => {
                                // Handle specific error cases
                                const errorMessage = error.message
                                if (errorMessage.includes('404') || errorMessage.includes('not found')) {
                                    toast({
                                        variant: 'destructive',
                                        title: toastT('error_title'),
                                        description: toastT('number_not_available')
                                    })
                                } else if (errorMessage.includes('402') || errorMessage.includes('balance')) {
                                    toast({
                                        variant: 'destructive',
                                        title: toastT('error_title'),
                                        description: toastT('low_balance')
                                    })
                                } else if (errorMessage.includes('409') || errorMessage.includes('exists')) {
                                    toast({
                                        variant: 'destructive',
                                        title: toastT('error_title'),
                                        description: toastT('already_exists')
                                    })
                                } else {
                                    toast({
                                        variant: 'destructive',
                                        title: toastT('error_title'),
                                        description: toastT('unknown_error')
                                    })
                                }
                            }
                        }
                    )
                } else {
                    addToCartMutation.mutate(
                        commonParams,
                        {
                            onSuccess: () => {
                                // Show success toast
                                toast({
                                    variant: 'success',
                                    title: toastT('success_title'),
                                    description: toastT('cart_add_success'),
                                    onDismiss: () => {
                                        // Open minicart when toast is dismissed
                                        const url = new URL(window.location.href)
                                        url.searchParams.set('cart', 'open')
                                        router.push(url.pathname + url.search)
                                    }
                                })
                            },
                            onError: (error) => {
                                // Handle specific error cases
                                const errorMessage = error.message
                                if (errorMessage.includes('404') || errorMessage.includes('not found')) {
                                    toast({
                                        variant: 'destructive',
                                        title: toastT('error_title'),
                                        description: toastT('number_not_available'),
                                    })
                                } else if (errorMessage.includes('402') || errorMessage.includes('balance')) {
                                    toast({
                                        variant: 'destructive',
                                        title: toastT('error_title'),
                                        description: toastT('low_balance'),
                                    })
                                } else if (errorMessage.includes('409') || errorMessage.includes('exists')) {
                                    toast({
                                        variant: 'destructive',
                                        title: toastT('error_title'),
                                        description: toastT('already_exists'),
                                    })
                                } else {
                                    toast({
                                        variant: 'destructive',
                                        title: toastT('error_title'),
                                        description: toastT('unknown_error'),
                                    })
                                }
                            }
                        }
                    )
                }
            }
        } catch (error) {
            console.error('Error processing request:', error)
            // Show error toast
            toast({
                variant: 'destructive',
                title: toastT('error_title'),
                description: toastT('cart_add_error')
            })
        } finally {
            setLoadingButton(null)
        }
    }

    // Use discounts from TanStack Query, with default "1 month" option if empty
    const discounts = discountsData.length > 0 ? discountsData : [{id: '0', name: '1'}]

    function GetDocsPersonal(numberInfo: NumberInfo | null) {
        if (!numberInfo || !numberInfo.docs_personal || !numberInfo.docs_personal.length) return null
        const docsList = numberInfo.docs_personal.map(key => d(key))
        return docsList.length > 0 ? docsList : null
    }

    function GetDocsBusiness(numberInfo: NumberInfo | null) {
        if (!numberInfo || !numberInfo.docs_business || !numberInfo.docs_business.length) return null
        const docsList = numberInfo.docs_business.map(key => d(key))
        return docsList.length > 0 ? docsList : null
    }

    const formatSelectedNumber = (numberInfo: NumberInfo | null) => {
        if (!numberInfo) return null

        let formattedNumber = numberInfo.did

        // Add country code prefix if available
        if (!formattedNumber.startsWith('+')) {
            formattedNumber = `+${formattedNumber}`
        }

        // Get country name
        const countryName = countryId ?
            countriesMap?.find(c => c.id === countryId)?.countryname || '' : ''

        // Get area name
        const areaName = areaCode ?
            areasMap?.find(a => a.areaprefix === areaCode)?.areaname || '' : ''

        // Build location string
        const locationParts = [countryName, areaName].filter(Boolean)

        // Check if the area contains '/' to determine layout
        const shouldBreakLine = areaName && areaName.includes('/')

        // Get country code for a flag
        const countryCode = countryId ?
            countriesMap?.find(c => c.id === countryId)?.geo || '' : ''

        return (
            <>
                {countryCode && (
                    <img
                        src={`https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`}
                        alt={`${countryName} flag`}
                        className="mr-2 h-3 w-5 inline-block"
                    />
                )}
                <span className="mr-2">
                    {formattedNumber}
                </span>
                {locationParts.length > 0 && (
                    <>
                        {shouldBreakLine ? <br/> : ' '}
                        <span className="text-muted-foreground font-light">
                            {locationParts.join(', ')}
                        </span>
                    </>
                )}
            </>
        )
    }

    const [voiceTypeState, setVoiceTypeState] = useState<string>('none')
    const [smsTypeState, setSmsTypeState] = useState<string>('none')
    const [voiceDestinationState, setVoiceDestinationState] = useState<string>('')
    const [smsDestinationState, setSmsDestinationState] = useState<string>('')
    const [voiceDestinationErrorState, setVoiceDestinationErrorState] = useState<string>('')
    const [smsDestinationErrorState, setSmsDestinationErrorState] = useState<string>('')
    const [discountState, setDiscountState] = useState<string>('0')
    const [loadingButton, setLoadingButton] = useState<string | null>(null)
    const [formErrors, setFormErrors] = useState<{ [index: string]: string[] | undefined }>({})

    // Document selection state
    const [selectedDocType, setSelectedDocType] = useState<'personal' | 'business' | null>(null)
    const [personalDocUploads, setPersonalDocUploads] = useState<{ [key: string]: string }>({})
    const [businessDocUploads, setBusinessDocUploads] = useState<{ [key: string]: string }>({})
    const [uploadingField, setUploadingField] = useState<string | null>(null)

    // For backward compatibility with existing code,
    // Wrap in useMemo to prevent recreation on every render
    const docUploads = useMemo(() => {
        return selectedDocType === 'personal' ? personalDocUploads :
            selectedDocType === 'business' ? businessDocUploads : {}
    }, [selectedDocType, personalDocUploads, businessDocUploads])

    // Handle document upload selection
    const handleDocUploadSelection = (fieldName: string, value: string) => {
        if (selectedDocType === 'personal') {
            setPersonalDocUploads(prev => ({
                ...prev,
                [fieldName]: value
            }))
        } else if (selectedDocType === 'business') {
            setBusinessDocUploads(prev => ({
                ...prev,
                [fieldName]: value
            }))
        }
    }

    // Handle file upload for documents
    const handleFileUpload = async (fieldName: string, file: File) => {
        try {
            setUploadingField(fieldName)
            // Extract doc type from field name (remove 'doc_' prefix)
            const docType = fieldName.startsWith('doc_') ? fieldName.substring(4) : fieldName

            uploadFileMutation.mutate(
                {file, type: docType},
                {
                    onSuccess: (newUpload) => {
                        if (newUpload) {
                            // Update the document selection with the new file
                            handleDocUploadSelection(fieldName, newUpload.filename)
                        }
                        setUploadingField(null)
                    },
                    onError: (uploadError) => {
                        console.error('Error uploading file:', uploadError)
                        setUploadingField(null)
                    }
                }
            )
        } catch (error) {
            console.error('Error uploading file:', error)
            setUploadingField(null)
        }
    }

    // Create a form validation schema based on the numberInfo properties
    const createFormSchema = (numberInfo: NumberInfo | null) => {
        if (!numberInfo) return z.object({})

        // Base schema with common fields
        const baseSchema = z.object({
            qty: z.string().min(1, {message: 'qty_required'}),
        })

        // Add voice validation if voice or toll_free is enabled
        const voiceSchema = numberInfo.voice || numberInfo.toll_free
            ? z.object({
                voiceType: z.string().min(1, {message: 'voice_type_required'}),
                voiceDestination: z.string().min(1, {message: 'voice_destination_required'}),
            })
            : z.object({})

        // Add SMS validation if SMS is enabled
        const smsSchema = numberInfo.sms
            ? z.object({
                smsType: z.string().min(1, {message: 'sms_type_required'}),
                smsDestination: z.string().min(1, {message: 'sms_destination_required'}),
            })
            : z.object({})

        // Add document type validation if document requirements are present
        let docsSchema = z.object({})

        // Check if document requirements are present
        const hasDocRequirements = (numberInfo.docs_personal && numberInfo.docs_personal.length > 0) ||
            (numberInfo.docs_business && numberInfo.docs_business.length > 0)

        if (hasDocRequirements) {
            // Require document type selection if document requirements are present
            docsSchema = docsSchema.merge(z.object({
                docType: z.string({
                    required_error: 'document_type_required'
                }).min(1, {message: 'document_type_required'})
            }))

            // Add validation for the selected document type
            if (selectedDocType === 'personal' && numberInfo.docs_personal && numberInfo.docs_personal.length > 0) {
                // Create a dynamic schema for each document in docs_personal
                const docFields: Record<string, z.ZodString> = {}
                numberInfo.docs_personal.forEach(doc => {
                    docFields[`doc_${doc}`] = z.string({
                        required_error: 'document_upload_required'
                    }).min(1, {message: 'document_upload_required'})
                })
                docsSchema = docsSchema.merge(z.object(docFields))
            } else if (selectedDocType === 'business' && numberInfo.docs_business && numberInfo.docs_business.length > 0) {
                // Create a dynamic schema for each document in docs_business
                const docFields: Record<string, z.ZodString> = {}
                numberInfo.docs_business.forEach(doc => {
                    docFields[`doc_${doc}`] = z.string({
                        required_error: 'document_upload_required'
                    }).min(1, {message: 'document_upload_required'})
                })
                docsSchema = docsSchema.merge(z.object(docFields))
            }
        }

        // Merge all schemas
        return baseSchema.merge(voiceSchema).merge(smsSchema).merge(docsSchema)
    }

    const handleVoiceTypeChange = (value: string) => {
        setVoiceTypeState(value)
        setVoiceDestinationState('')
        setVoiceDestinationErrorState('')
    }
    const handleSmsTypeChange = (value: string) => {
        setSmsTypeState(value)
        setSmsDestinationState('')
        setSmsDestinationErrorState('')
    }
    const handleVoiceDestinationChange = (e: ChangeEvent<HTMLInputElement>) => {
        switch (voiceTypeState) {
            case 'voicePhone': {
                const {error, data} = validateInputData(schemaPhone, e.target.value)
                setVoiceDestinationState(data ?? e.target.value.replace(/\D/g, ''))
                setVoiceDestinationErrorState(error ?? '')
            }
                break
            case 'voiceTelegram': {
                if (/^\d/.test(e.target.value)) {
                    const {error, data} = validateInputData(schemaPhone, e.target.value)
                    setVoiceDestinationState(data ?? e.target.value.replace(/\D/g, ''))
                    setVoiceDestinationErrorState(error ?? '')
                } else {
                    const {error, data} = validateInputData(schemaTelegram, e.target.value)
                    setVoiceDestinationState(data ?? e.target.value.toLowerCase())
                    setVoiceDestinationErrorState(error ?? '')
                }
            }
                break
            case 'voiceSip': {
                const {error, data} = validateInputData(schemaSip, 'sip/' + e.target.value.toLowerCase().replace(/^sips?[:\/]/, ''))
                setVoiceDestinationState(data ?? 'sip/' + e.target.value.toLowerCase().replace(/^sips?[:\/]/, ''))
                setVoiceDestinationErrorState(error ?? '')
            }
                break
            default: {
            }
        }
    }
    const handleSmsDestinationChange = (e: ChangeEvent<HTMLInputElement>) => {
        switch (smsTypeState) {
            case 'smsPhone': {
                const {error, data} = validateInputData(schemaPhone, e.target.value)
                setSmsDestinationState(data ?? e.target.value.replace(/\D/g, ''))
                setSmsDestinationErrorState(error ?? '')
            }
                break
            case 'smsEmail': {
                const {error, data} = validateInputData(schemaEmail, e.target.value.toLowerCase())
                setSmsDestinationState(data ?? e.target.value.toLowerCase())
                setSmsDestinationErrorState(error ?? '')
            }
                break
            case 'smsHttps':
            case 'smsTelegram':
            case 'smsSlack': {
                const {
                    error,
                    data
                } = validateInputData(schemaHttps, (/^https?:\/\//.test(e.target.value)) ? e.target.value.toLowerCase() : 'https://' + e.target.value.toLowerCase())
                setSmsDestinationState(data ?? ((/^https?:\/\//.test(e.target.value)) ? e.target.value.toLowerCase() : 'https://' + e.target.value.toLowerCase()))
                setSmsDestinationErrorState(error ?? '')
            }
                break
            default: {
            }
        }
    }

    const qty = discounts.find(q => q.id == discountState)
    const handleQtyChange = (value: string) => {
        setDiscountState(value)
    }

    const voiceDestination = voiceDestinationsFields.find(i => i.id === voiceTypeState)
    const smsDestination = smsDestinationsFields.find(i => i.id === smsTypeState)

    const getCardClassName = (docType: 'personal' | 'business') => {
        const isSelected = selectedDocType === docType
        const hasGeneralDocTypeError = formErrors.docType && formErrors.docType.length > 0
        const hasSpecificDocError = isSelected && Object.keys(formErrors).some(key =>
            key.startsWith('doc_') && formErrors[key] && formErrors[key]!.length > 0
        )

        if (isSelected) {
            return 'border-primary bg-primary/5'
        } else if (hasGeneralDocTypeError || hasSpecificDocError) {
            return 'border-destructive bg-destructive/5'
        } else {
            return 'border-muted bg-background hover:bg-muted/50'
        }
    }

    return numberInfo ? (
        <form
            id="buyNumberForm"
            name="buyNumberForm"
            className="mt-8 space-y-8 transition-all duration-500 ease-in-out"
            onSubmit={handleFormSubmit}
            method="post"
        >
            <div className="flex flex-col lg:flex-row gap-6 justify-between">
                {/* Mobile only: Selected number display */}
                <div className="block lg:hidden">
                    <div className="flex flex-col items-center p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20 shadow-sm">
                        <div className="text-sm font-bold text-foreground tracking-wider">
                            {formatSelectedNumber(numberInfo)}
                        </div>
                    </div>
                </div>
                <div className="w-full space-y-4 sm:space-y-6">
                    <div className="flex flex-row items-center p-2 h-8 bg-gradient-to-r from-secondary/50 to-secondary/30 rounded-lg text-sm font-medium shadow-sm overflow-hidden">
                        <span className="flex items-center">{t('setupfee')}:</span>
                        <span className="text-price font-semibold mx-2 flex items-center">${numberInfo.setup_rate}</span>
                        /
                        <span className="ml-2 flex items-center">{t('monthlyfee')}:</span>
                        <span className="text-price font-semibold mx-2 flex items-center">${numberInfo.fix_rate}</span>
                    </div>
                    {numberInfo.voice || numberInfo.toll_free ? (
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
                                isRequired={numberInfo.voice || numberInfo.toll_free}
                                placeholder={voiceDestination ? voiceDestination.placeholder : ''}
                                icon={voiceDestination ? voiceDestination.icon : undefined}
                                error={
                                    formErrors.voiceDestination && formErrors.voiceDestination.length > 0
                                        ? formErrors.voiceDestination.map(err => t(err)).join(', ')
                                        : (t.has(voiceDestinationErrorState) ? t(voiceDestinationErrorState) : '')
                                }
                                customClass="w-full pl-9 sm:pl-0"
                                hideLabel={true}
                            />
                        </div>
                    ) : null}

                    {numberInfo.sms ? (
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
                                isRequired={numberInfo.sms || numberInfo.toll_free}
                                placeholder={smsDestination ? smsDestination.placeholder : ''}
                                icon={smsDestination ? smsDestination.icon : undefined}
                                error={
                                    formErrors.smsDestination && formErrors.smsDestination.length > 0
                                        ? formErrors.smsDestination.map(err => t(err)).join(', ')
                                        : (t.has(smsDestinationErrorState) ? t(smsDestinationErrorState) : '')
                                }
                                customClass="w-full pl-9 sm:pl-0"
                                hideLabel={true}
                            />
                        </div>
                    ) : null}

                    {/* Document selection section */}
                    {(GetDocsPersonal(numberInfo) || GetDocsBusiness(numberInfo)) && (
                        <div className="space-y-4 mt-4">
                            <div className="font-medium text-sm">{t('required_documents')}</div>

                            <div className="flex flex-col gap-4">
                                {/* Personal Documents Card */}
                                {GetDocsPersonal(numberInfo) && (
                                    <Card
                                        className={`p-4 border cursor-pointer transition-all ${getCardClassName('personal')}`}
                                        onClick={() => {
                                            setSelectedDocType('personal')
                                            // Clear form errors when switching document types
                                            setFormErrors(prev => ({
                                                ...prev,
                                                docType: undefined
                                            }))
                                        }}
                                    >
                                        <div className="font-medium text-sm mb-2">{t('personal_docs')}</div>

                                        {selectedDocType === 'personal' ? (
                                            <div className="space-y-2">
                                                {numberInfo?.docs_personal?.map((docKey, index) => {
                                                    const docName = d(docKey)
                                                    const fieldName = `doc_${docKey}`

                                                    return (
                                                        <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                                                            <div className="text-sm text-muted-foreground flex-2">{docName}</div>
                                                            <div className="flex-1">
                                                                <DropdownSelect
                                                                    selectId={fieldName}
                                                                    selectTitle={t('select_upload')}
                                                                    data={uploads.map(upload => ({
                                                                        id: upload.filename,
                                                                        name: upload.name || upload.filename
                                                                    }))}
                                                                    onSelectAction={(value) => {
                                                                        handleDocUploadSelection(fieldName, value)
                                                                    }}
                                                                    selectedOption={docUploads[fieldName] || ''}
                                                                    customClass="w-full text-xs"
                                                                    disabled={uploads.length === 0}
                                                                    success={!!docUploads[fieldName]}
                                                                    allowUpload={true}
                                                                    isUploading={uploadingField === fieldName}
                                                                    onFileUpload={(file) => handleFileUpload(fieldName, file)}
                                                                />
                                                                {formErrors[fieldName] && (
                                                                    <div className="text-destructive text-xs mt-1">
                                                                        {formErrors[fieldName]?.map(err => t(err)).join(', ')}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        ) : (
                                            <ul className="list-disc pl-5 text-sm text-muted-foreground">
                                                {GetDocsPersonal(numberInfo)?.map((doc, index) => (
                                                    <li key={index}>{doc}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </Card>
                                )}

                                {/* Business Documents Card */}
                                {GetDocsBusiness(numberInfo) && (
                                    <Card
                                        className={`p-4 border cursor-pointer transition-all ${getCardClassName('business')}`}
                                        onClick={() => {
                                            setSelectedDocType('business')
                                            // Clear form errors when switching document types
                                            setFormErrors(prev => ({
                                                ...prev,
                                                docType: undefined
                                            }))
                                        }}
                                    >
                                        <div className="font-medium text-sm mb-2">{t('business_docs')}</div>

                                        {selectedDocType === 'business' ? (
                                            <div className="space-y-2">
                                                {numberInfo?.docs_business?.map((docKey, index) => {
                                                    const docName = d(docKey)
                                                    const fieldName = `doc_${docKey}`

                                                    return (
                                                        <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                                                            <div className="text-sm text-muted-foreground flex-2">{docName}</div>
                                                            <div className="flex-1">
                                                                <DropdownSelect
                                                                    selectId={fieldName}
                                                                    selectTitle={t('select_upload')}
                                                                    data={uploads.map(upload => ({
                                                                        id: upload.filename,
                                                                        name: upload.name || upload.filename
                                                                    }))}
                                                                    onSelectAction={(value) => {
                                                                        handleDocUploadSelection(fieldName, value)
                                                                    }}
                                                                    selectedOption={docUploads[fieldName] || ''}
                                                                    customClass="w-full text-xs"
                                                                    disabled={uploads.length === 0}
                                                                    success={!!docUploads[fieldName]}
                                                                    allowUpload={true}
                                                                    isUploading={uploadingField === fieldName}
                                                                    onFileUpload={(file) => handleFileUpload(fieldName, file)}
                                                                />
                                                                {formErrors[fieldName] && (
                                                                    <div className="text-destructive text-xs mt-1">
                                                                        {formErrors[fieldName]?.map(err => t(err)).join(', ')}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        ) : (
                                            <ul className="list-disc pl-5 text-sm text-muted-foreground">
                                                {GetDocsBusiness(numberInfo)?.map((doc, index) => (
                                                    <li key={index}>{doc}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </Card>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-6 w-full lg:w-fit">
                    <div className="flex flex-row gap-2 justify-end items-center bg-gradient-to-r from-secondary/40 to-secondary/20 p-2 h-8 rounded-lg shadow-sm overflow-hidden">
                        <div className="flex items-center text-xs font-medium">{t('pay_for')}</div>
                        <div className="flex items-center">
                            <DropdownSelect
                                selectId="discount"
                                selectTitle={t('select_qty')}
                                data={discounts}
                                onSelectAction={handleQtyChange}
                                selectedOption={discountState}
                                customClass="min-w-max w-fit text-xs text-muted-foreground h-8 hide-label"
                            />
                        </div>
                        <div className="flex items-center text-xs font-medium">{t('month', {count: qty !== undefined ? qty.name : 1})}</div>
                    </div>

                    <div className="bg-gradient-to-br from-card to-muted/30 dark:from-card dark:to-muted/30 rounded-lg overflow-hidden shadow-md border border-muted/25">
                        <Table>
                            <TableHeader className="p-2">
                                <TableRow>
                                    <TableHead colSpan={4} className="bg-gradient-to-r from-muted/60 to-muted/40 text-center font-medium">{t('discount')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {discounts.map(d => {
                                    return (d.id !== '0') ? (
                                        <TableRow key={d.name} className="text-xs p-1">
                                            <TableCell className="whitespace-nowrap pl-4 py-3">{t('more_than')} {d.name} {t('month', {count: d.name})}</TableCell>
                                            <TableCell className="text-price font-medium p-3">-{d.id}%</TableCell>
                                            <TableCell>=</TableCell>
                                            <TableCell className="whitespace-nowrap text-right font-medium pr-4 p-3">
                                                ${Number(Number(d.id) / 100 * (numberInfo.fix_rate * Number(d.name) + numberInfo.setup_rate)).toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ) : null
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex flex-row gap-3 justify-end items-center whitespace-nowrap text-sm font-medium">
                        {t('total_price')} <span className="text-price text-lg font-bold">
                            ${Number((100 - (qty !== undefined ? Number(qty.id) : 0)) / 100 * (numberInfo.fix_rate * (qty !== undefined ? Number(qty.name) : 1) + numberInfo.setup_rate)).toFixed(2)}
                        </span>
                    </div>

                    <div className="flex w-full flex-row justify-end gap-3 mt-2">
                        <ActionButton
                            type="submit"
                            style="pillow"
                            id="cart"
                            loading={loadingButton === 'cart' || addToCartMutation.isPending}
                        >
                            {t('add_to_cart')}
                        </ActionButton>
                        {isUserLoggedIn && (
                            <ActionButton
                                type="submit"
                                style="pillow"
                                id="buy"
                                loading={loadingButton === 'buy' || buyNumbersMutation.isPending}
                            >
                                {t('buy')}
                            </ActionButton>
                        )}
                    </div>
                </div>
            </div>
        </form>
    ) : ''
}
