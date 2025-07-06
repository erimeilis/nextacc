'use client'
import React, {useEffect, useState} from 'react'
import {useParams, useRouter, useSearchParams} from 'next/navigation'
import {useTranslations} from 'next-intl'
import {Button} from '@/components/ui/Button'
import {ArrowArcLeftIcon, ArrowLeftIcon, CircleNotchIcon, FileIcon as DocIcon, FloppyDiskIcon} from '@phosphor-icons/react'
import Loader from '@/components/service/Loader'
import {MyWaitingNumberInfo} from '@/types/MyWaitingNumberInfo'
import {redGetWaitingDidSettings, redUpdateWaitingDidSettings} from '@/app/api/redreport/waiting-dids'
import {useToast} from '@/hooks/use-toast'
import DropdownSelect from '@/components/shared/DropdownSelect'
import {useClientStore} from '@/stores/useClientStore'
import {UploadInfo} from '@/types/UploadInfo'
import DestinationSettings from '@/components/DestinationSettings'

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

    const [numberData, setNumberData] = useState<MyWaitingNumberInfo | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState<Partial<MyWaitingNumberInfo>>({})
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    // Document selection state
    // We only need personal docs for waiting numbers
    const [personalDocUploads, setPersonalDocUploads] = useState<{ [key: string]: string }>({})
    const [uploads, setUploads] = useState<UploadInfo[]>([])
    const [uploadingField, setUploadingField] = useState<string | null>(null)

    // Get uploads from the client store
    const {getUploads, fetchUploads, uploadFile} = useClientStore()

    // Fetch uploads when the component mounts
    useEffect(() => {
        if (getUploads()) {
            setUploads(getUploads()!)
        } else {
            fetchUploads().then(fetchedUploads => {
                setUploads(fetchedUploads ?? [])
            })
        }
    }, [fetchUploads, getUploads])

    // Load waiting number details on a component mount
    useEffect(() => {
        const loadNumberDetails = async () => {
            if (!id) return

            setLoading(true)
            try {
                // Use redGetWaitingDidSettings to get the waiting number details
                const data = await redGetWaitingDidSettings(id)
                if (data) {
                    setNumberData(data)
                    setFormData(data)

                    // Initialize document uploads if there are any docs
                    if (data.docs && data.docs.length > 0) {
                        // For each doc in the array, create an entry in personalDocUploads
                        const docUploads: { [key: string]: string } = {}
                        data.docs.forEach(doc => {
                            if (typeof doc === 'object' && doc.type && doc.file) {
                                docUploads[`doc_${doc.type}`] = doc.file
                            }
                        })
                        setPersonalDocUploads(docUploads)
                    }
                }
            } catch (error) {
                console.error('Failed to load waiting number details:', error)
                toast({
                    variant: 'destructive',
                    title: toastT('error_title'),
                    description: toastT('failed_to_load_number'),
                })
            } finally {
                setLoading(false)
            }
        }
        loadNumberDetails().then()
    }, [id, toast, toastT])

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
            const res = await uploadFile(file)
            if (res) {
                if (res.length > 0) {
                    const newUpload = res[0]

                    // Update the document selection with the new file
                    handleDocUploadSelection(fieldName, newUpload.filename)

                    // Update the local uploads state
                    setUploads(res)
                }
            }
        } catch (error) {
            console.error(errorsT('error_uploading_file'), error)
        } finally {
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
            // Show error toast for validation
            toast({
                variant: 'destructive',
                title: toastT('error_title'),
                description: toastT('validation_error_description'),
            })
            return
        }

        setSaving(true)
        try {
            // Add document uploads if any
            if (Object.keys(personalDocUploads).length > 0) {
                // Convert the personalDocUploads object to an array of objects with type and file properties
                // The API expects an array of objects in the 'docs' field
                const docObjects = Object.entries(personalDocUploads).map(([key, value]) => {
                    // Extract the document type from the key (remove 'doc_' prefix)
                    const docType = key.startsWith('doc_') ? key.substring(4) : key
                    return value ? {type: docType, file: value} : null
                }).filter(Boolean) as { type: string; file: string }[]

                if (docObjects.length > 0) {
                    dataToSave.docs = docObjects
                }
            }
            // Call the API to update the waiting number settings
            const updatedData = await redUpdateWaitingDidSettings(id, dataToSave)
            if (updatedData) {
                setNumberData(updatedData)
                console.log('[DEBUG_LOG] Save successful, showing success toast')
                // Show success toast
                toast({
                    variant: 'success',
                    title: toastT('success_title'),
                    description: toastT('changes_saved'),
                })
            } else {
                // Show error toast if the update failed
                toast({
                    variant: 'destructive',
                    title: toastT('error_title'),
                    description: toastT('failed_to_save_changes'),
                })
            }
        } catch (error) {
            console.error(errorsT('failed_to_save_waiting_number'), error)
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
