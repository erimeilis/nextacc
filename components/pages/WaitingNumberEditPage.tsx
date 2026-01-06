'use client'
import React, {useEffect, useState} from 'react'
import {useParams, useRouter, useSearchParams} from 'next/navigation'
import {useTranslations} from 'next-intl'
import {Button} from '@/components/ui/primitives/Button'
import {ArrowArcLeftIcon, ArrowLeftIcon, CircleNotchIcon, FileIcon as DocIcon, FloppyDiskIcon} from '@phosphor-icons/react'
import Loader from '@/components/ui/loading/Loader'
import {MyWaitingNumberInfo} from '@/types/MyWaitingNumberInfo'
import {useToast} from '@/hooks/use-toast'
import DropdownSelect from '@/components/forms/DropdownSelect'
import DestinationSettings from '@/components/settings/DestinationSettings'
import {useWaitingDidSettings, useUpdateWaitingDidSettings} from '@/hooks/queries/use-waiting-dids'
import {useUploads, useUploadFile} from '@/hooks/queries/use-uploads'

export default function WaitingNumberEditPage() {
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const id = params?.id as string
    const t = useTranslations('offers')
    const wt = useTranslations('waiting-numbers')
    const d = useTranslations('docs')
    const toastT = useTranslations('toast')
    const errorsT = useTranslations('errors')
    const {toast} = useToast()

    // TanStack Query hooks
    const {data: numberData, isLoading: loading, error} = useWaitingDidSettings(id)
    const updateWaitingDidMutation = useUpdateWaitingDidSettings()
    const {data: uploads = []} = useUploads()
    const uploadFileMutation = useUploadFile()

    const [formData, setFormData] = useState<Partial<MyWaitingNumberInfo>>({})
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    // Document selection state
    const [personalDocUploads, setPersonalDocUploads] = useState<{ [key: string]: string }>({})
    const [uploadingField, setUploadingField] = useState<string | null>(null)

    // Track previous numberData for render-time sync (React 19 pattern)
    const [prevNumberData, setPrevNumberData] = useState(numberData)

    // Sync form data when numberData loads (React 19 approved pattern - no useEffect)
    if (numberData !== prevNumberData) {
        setPrevNumberData(numberData)
        if (numberData) {
            setFormData(numberData)

            // Initialize document uploads if there are any docs
            if (numberData.docs && numberData.docs.length > 0) {
                const docUploads: { [key: string]: string } = {}
                numberData.docs.forEach(doc => {
                    if (typeof doc === 'object' && doc.type && doc.file) {
                        docUploads[`doc_${doc.type}`] = doc.file
                    }
                })
                setPersonalDocUploads(docUploads)
            }
        }
    }

    // Show error toast if loading fails
    useEffect(() => {
        if (error) {
            toast({
                variant: 'destructive',
                title: toastT('error_title'),
                description: toastT('failed_to_load_number'),
            })
        }
    }, [error, toast, toastT])

    // Handle document upload selection
    const handleDocUploadSelection = (fieldName: string, value: string) => {
        setPersonalDocUploads(prev => ({
            ...prev,
            [fieldName]: value
        }))
    }

    // Handle file upload for documents
    const handleFileUpload = async (fieldName: string, file: File) => {
        try {
            setUploadingField(fieldName)
            // Extract doc type from field name (remove 'doc_' prefix)
            const docType = fieldName.startsWith('doc_') ? fieldName.substring(4) : fieldName

            uploadFileMutation.mutate(
                { file, type: docType },
                {
                    onSuccess: (newUpload) => {
                        if (newUpload) {
                            handleDocUploadSelection(fieldName, newUpload.filename)
                        }
                        setUploadingField(null)
                    },
                    onError: (uploadError) => {
                        console.error(errorsT('error_uploading_file'), uploadError)
                        setUploadingField(null)
                    }
                }
            )
        } catch (uploadError) {
            console.error(errorsT('error_uploading_file'), uploadError)
            setUploadingField(null)
        }
    }


    // Handle back navigation
    const handleBack = () => {
        const backUrl = `/waiting-numbers/?${searchParams?.toString()}`
        router.push(backUrl)
    }

    // Handle form submission
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!id || !formData) {
            return
        }

        // Check if there are any validation errors in formErrors
        const hasValidationErrors = Object.keys(formErrors).length > 0

        // Use formData directly for submission, ensuring types and destinations are included
        const dataToSave: Partial<MyWaitingNumberInfo> = {
            ...formData,
            voiceDestType: formData.voiceDestType || numberData?.voiceDestType,
            voiceDest: formData.voiceDest || numberData?.voiceDest,
            smsDestType: formData.smsDestType || numberData?.smsDestType,
            smsDest: formData.smsDest || numberData?.smsDest
        }

        // Check if there are any validation errors
        if (hasValidationErrors) {
            toast({
                variant: 'destructive',
                title: toastT('error_title'),
                description: toastT('validation_error_description'),
            })
            return
        }

        // Add document uploads if any
        if (Object.keys(personalDocUploads).length > 0) {
            const docObjects = Object.entries(personalDocUploads).map(([key, value]) => {
                const docType = key.startsWith('doc_') ? key.substring(4) : key
                return value ? {type: docType, file: value} : null
            }).filter(Boolean) as { type: string; file: string }[]

            if (docObjects.length > 0) {
                dataToSave.docs = docObjects
            }
        }

        updateWaitingDidMutation.mutate(
            { id, data: dataToSave },
            {
                onSuccess: () => {
                    toast({
                        variant: 'success',
                        title: toastT('success_title'),
                        description: toastT('changes_saved'),
                    })
                },
                onError: (mutationError) => {
                    console.error(errorsT('failed_to_save_waiting_number'), mutationError)
                    toast({
                        variant: 'destructive',
                        title: toastT('error_title'),
                        description: toastT('failed_to_save_changes'),
                    })
                }
            }
        )
    }

    const saving = updateWaitingDidMutation.isPending

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
                <p>{wt('waiting_number_not_found')}</p>
                <Button onClick={handleBack} className="mt-4">
                    {wt('back_to_waiting_numbers')}
                </Button>
            </div>
        )
    }

    return (
        <form
            id="waitingNumberForm"
            name="waitingNumberForm"
            className="mt-4 space-y-6 transition-all duration-500 ease-in-out"
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
                    <h1 className="text-md font-light">{wt('edit_waiting_number')} {numberData?.did}</h1>
                </div>
                <div className="flex space-x-2">
                    <Button
                        variant="ghost"
                        type="button"
                        size="icon"
                        onClick={handleBack}
                        title={wt('cancel')}
                        className="h-7 w-7 text-destructive"
                    >
                        <ArrowArcLeftIcon size={16}/>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        type="submit"
                        disabled={saving}
                        title={saving ? wt('saving') : wt('save_changes')}
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

                {/* Basic Number Info */}
                <div className="bg-card px-4 py-2 rounded-lg flex flex-col sm:flex-row justify-between items-center">
                    <div className="flex flex-row items-center h-8 text-sm">
                        <span className="flex items-center">{t('setupfee')}:</span>
                        <span className="text-price font-semibold mx-2 flex items-center">${numberData?.setup_rate}</span>
                        /
                        <span className="ml-2 flex items-center">{t('monthlyfee')}:</span>
                        <span className="text-price font-semibold mx-2 flex items-center">${numberData?.fix_rate}</span>
                    </div>
                    <div
                        className="flex flex-row items-center h-8 text-sm">
                        <span className="flex items-center">{wt('months')}:</span>
                        <span className="text-price font-semibold mx-2 flex items-center">{numberData?.count_month}</span>
                        /
                        <span className="ml-2 flex items-center">{wt('pay_sum')}:</span>
                        <span className="text-price font-semibold mx-2 flex items-center">${numberData?.pay_sum}</span>
                    </div>
                </div>

                <DestinationSettings
                    numberData={numberData}
                    formData={formData}
                    setFormDataAction={setFormData}
                    formErrors={formErrors}
                    setFormErrorsAction={setFormErrors}
                />

                {/* Document section */}
                {numberData?.docs && numberData?.docs.length > 0 && (
                    <div className="bg-card p-4 rounded-lg">
                        <div className="font-medium text-sm mb-4 flex items-center">
                            <DocIcon size={16} className="text-primary mr-2"/>
                            {t('required_documents')}:
                        </div>

                        <div className="space-y-2">
                            {numberData?.docs.map((docKey, index) => {
                                // Handle both string and object docs
                                const docType = typeof docKey === 'object' && docKey.type ? docKey.type : docKey
                                const docName = typeof docType === 'string' ? d(docType) : String(docType)
                                const fieldName = `doc_${docType}`

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
                                                selectedOption={personalDocUploads[fieldName] || ''}
                                                customClass="w-full text-xs"
                                                disabled={uploads.length === 0}
                                                success={!!personalDocUploads[fieldName]}
                                                allowUpload={true}
                                                isUploading={uploadingField === fieldName}
                                                onFileUpload={(file) => handleFileUpload(fieldName, file)}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Save Button (bottom) */}
            <div className="flex justify-end space-x-2 pt-4">
                <Button
                    variant="ghost"
                    type="button"
                    size="icon"
                    onClick={handleBack}
                    title={wt('cancel')}
                    className="h-7 w-7 text-destructive"
                >
                    <ArrowArcLeftIcon size={16}/>
                </Button>
                <Button
                    variant="ghost"
                    type="submit"
                    size="icon"
                    disabled={saving}
                    title={saving ? wt('saving') : wt('save_changes')}
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
