'use client'
import React, {ChangeEvent, SyntheticEvent, useEffect, useState} from 'react'
import {NumberInfo} from '@/types/NumberInfo'
import DropdownSelect from '@/components/shared/DropdownSelect'
import {useTranslations} from 'next-intl'
import Button from '@/components/shared/Button'
import Input from '@/components/shared/Input'
import {voiceDestinationsFields} from '@/constants/voiceDestinationFields'
import {smsDestinationsFields} from '@/constants/smsDestinationFields'
import {validateFormData, validateInputData} from '@/utils/validation'
import {schemaPhone} from '@/schemas/phone.schema'
import {schemaTelegram} from '@/schemas/telegram.schema'
import {schemaSip} from '@/schemas/sip.schema'
import {schemaEmail} from '@/schemas/email.schema'
import {schemaHttps} from '@/schemas/https.schema'
import {z} from 'zod'
import {ChatText, PhoneTransfer} from '@phosphor-icons/react'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table'
import {addToCart} from '@/app/api/redreport/cart'
import usePersistState, {getPersistState} from '@/utils/usePersistState'
import {ClientInfo} from '@/types/ClientInfo'
import {slack} from '@/utils/slack'
import {useCartStore} from '@/stores/useCartStore'
import {useOffersStore} from '@/stores/useOffersStore'
import {useToast} from '@/hooks/use-toast'
import {useRouter} from 'next/navigation'

export default function BuyNumberForm({
                                          numberInfo,
                                          countryId,
                                          areaCode
                                      }: {
    numberInfo: NumberInfo | null
    countryId: number | null
    areaCode: number | null
}) {
    const t = useTranslations('offers')
    const d = useTranslations('docs')
    const persistentId = getPersistState<string>('persistentId', 'no-id')
    const [persistentClientInfo, setPersistentClientInfo] = usePersistState<ClientInfo>({
        'ip': '',
        'country': '',
    }, 'persistentClientInfo')
    const {updateData} = useCartStore()
    const {toast} = useToast()
    const router = useRouter()
    const getClientInfo = async () => {
        const res = await fetch('https://ipinfo.io/json?token=39d5c35f2d7eb1')
        const info = await res.json()
        await slack(info.ip)
        setPersistentClientInfo(info)
    }

    const voice: { id: string, name: string }[] = voiceDestinationsFields.map((i) => {
        return {id: i.id, name: t(i.labelText)}
    })
    const sms: { id: string, name: string }[] = smsDestinationsFields.map((i) => {
        return {id: i.id, name: t(i.labelText)}
    })
    const handleAddToCart = async (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
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
                    smsDestination: smsDestinationState
                }

                // Validate form data
                const schema = createFormSchema(numberInfo)
                const {errors} = validateFormData(schema, formData)

                // If there are validation errors, display them and stop submission
                if (errors) {
                    setFormErrors(errors)
                    console.error('Validation errors:', errors)

                    // Show error toast for validation
                    toast({
                        variant: 'destructive',
                        title: 'Validation Error',
                        description: 'Please check the form for errors',
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
                    console.error('Field validation errors exist')

                    // Show error toast for field validation
                    toast({
                        variant: 'destructive',
                        title: 'Validation Error',
                        description: 'Please check the form for errors',
                    })

                    return
                }

                console.log('Adding to cart:', numberInfo)
                await getClientInfo()
                const data = await addToCart({
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
                        undefined
                })
                if (data) {
                    updateData(data)
                    // Show success toast
                    toast({
                        variant: 'success',
                        title: 'Success',
                        description: 'Item added to cart successfully',
                        onDismiss: () => {
                            // Open minicart when toast is dismissed
                            const url = new URL(window.location.href)
                            url.searchParams.set('cart', 'open')
                            router.push(url.pathname + url.search)
                        }
                    })
                }
            }
        } catch (error) {
            console.error('Error adding to cart:', error)
            // Show error toast
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to add item to cart',
                onDismiss: () => {
                    // Open minicart when toast is dismissed
                    const url = new URL(window.location.href)
                    url.searchParams.set('cart', 'open')
                    router.push(url.pathname + url.search)
                }
            })
        } finally {
            setLoadingButton(null)
        }
    }

    function Discounts(): { id: string, name: string }[] {
        const {discounts, updateDiscounts} = useOffersStore()

        // First show cached data from the store
        // Then update in the background
        useEffect(() => {
            updateDiscounts().then()
        }, [updateDiscounts])

        // Add a default "1 month" option if a discount array is empty
        if (discounts.length === 0) {
            return [{id: '0', name: '1'}]
        }

        return discounts
    }

    const discounts = Discounts()

    function GetDocs(numberInfo: NumberInfo | null) {
        if (!numberInfo) return null
        let res = ''
        const docs = JSON.parse(numberInfo.docs as string)
        for (const key in docs) {
            if (docs.hasOwnProperty(key) && docs[key] === 1) {
                res += d(key) + ' '
            }
        }
        return res
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

        // Merge all schemas
        return baseSchema.merge(voiceSchema).merge(smsSchema)
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
    return numberInfo ? (
        <form
            id="buyNumberForm"
            name="buyNumberForm"
            className="mt-8 space-y-8 transition-transform duration-300"
            onSubmit={handleAddToCart}
            method="post"
        >
            <div className="flex flex-col lg:flex-row gap-6 justify-between">
                <div className="w-full space-y-6">
                    <div className="flex flex-row items-center p-2 h-8 bg-gradient-to-r from-secondary/50 to-secondary/30 rounded-lg text-sm font-medium shadow-sm overflow-hidden">
                        <span className="flex items-center">{t('setupfee')}:</span>
                        <span className="text-price font-semibold mx-2 flex items-center">${numberInfo.setup_rate}</span>
                        /
                        <span className="ml-2 flex items-center">{t('monthlyfee')}:</span>
                        <span className="text-price font-semibold mx-2 flex items-center">${numberInfo.fix_rate}</span>
                    </div>
                    {numberInfo.voice || numberInfo.toll_free ? (
                        <div className="flex w-full flex-col xl:flex-row items-start gap-4">
                            <div className="flex w-full flex-row items-center gap-3">
                                <div className="flex flex-row items-center gap-3 mt-8">
                                    <PhoneTransfer size={24} className="text-primary"/>
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
                            <Input
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
                                customClass="w-full"
                            />
                        </div>
                    ) : null}

                    {numberInfo.sms ? (
                        <div className="flex w-full flex-col xl:flex-row items-start gap-4">
                            <div className="flex w-full flex-row items-center gap-3">
                                <div className="flex flex-row items-center gap-3 mt-8">
                                    <ChatText size={24} className="text-primary"/>
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
                            <Input
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
                                customClass="w-full"
                            />
                        </div>
                    ) : null}

                    {GetDocs(numberInfo) ? (
                        <div className="text-sm text-muted-foreground">
                            {GetDocs(numberInfo)}
                        </div>
                    ) : null}
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
                            <TableHeader>
                                <TableRow>
                                    <TableHead colSpan={4} className="bg-gradient-to-r from-muted/60 to-muted/40 text-center font-medium">{t('discount')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {discounts.map(d => {
                                    return (d.id !== '0') ? (
                                        <TableRow key={d.name} className="text-sm">
                                            <TableCell className="whitespace-nowrap">{t('more_than')} {d.name} {t('month', {count: d.name})}</TableCell>
                                            <TableCell className="text-price font-medium">-{d.id}%</TableCell>
                                            <TableCell>=</TableCell>
                                            <TableCell className="whitespace-nowrap text-right font-medium">
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
                        <Button
                            type="submit"
                            style="pillow"
                            id="cart"
                            loading={loadingButton === 'cart'}
                        >
                            {t('add_to_cart')}
                        </Button>
                        <Button
                            type="submit"
                            style="pillow"
                            id="buy"
                            loading={loadingButton === 'buy'}
                        >
                            {t('buy')}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    ) : ''
};