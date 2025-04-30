'use client'
import React, {ChangeEvent, SyntheticEvent, useState} from 'react'
import {NumberInfo} from '@/types/NumberInfo'
import DropdownSelect from '@/components/shared/DropdownSelect'
import {useTranslations} from 'next-intl'
import Button from '@/components/shared/Button'
import Input from '@/components/shared/Input'
import {voiceDestinationsFields} from '@/constants/voiceDestinationFields'
import {smsDestinationsFields} from '@/constants/smsDestinationFields'
import {validateInputData} from '@/utils/validation'
import {schemaPhone} from '@/schemas/phone.schema'
import {schemaTelegram} from '@/schemas/telegram.schema'
import {schemaSip} from '@/schemas/sip.schema'
import {schemaEmail} from '@/schemas/email.schema'
import {schemaHttps} from '@/schemas/https.schema'
import useSWR from 'swr'
import {getDiscounts} from '@/app/api/redreport/offers'
import {ChatText, PhoneTransfer} from '@phosphor-icons/react'
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell
} from '@/components/ui/table'
import {addToCart} from '@/app/api/redreport/buy'
import {getPersistState} from '@/usePersistState'

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

    const voice: { id: string, name: string }[] = voiceDestinationsFields.map((i) => {
        return {id: i.id, name: t(i.labelText)}
    })
    const sms: { id: string, name: string }[] = smsDestinationsFields.map((i) => {
        return {id: i.id, name: t(i.labelText)}
    })
    const handleAddToCart = async (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault()
        //TODO add validation here
        if (numberInfo) {
            const data = await addToCart({
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
            alert(JSON.stringify(data))
        }
    }

    function Discounts(): { id: string, name: string }[] {
        const {data} = useSWR({}, getDiscounts, {})
        return data ?? []
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
                    <div className="p-4 bg-secondary/50 rounded-lg text-sm font-medium">
                        {t('setupfee')}: <span className="text-primary font-semibold">{numberInfo.setup_rate} $</span> / {t('monthlyfee')}: <span className="text-primary font-semibold">{numberInfo.fix_rate} $</span>
                    </div>
                    {numberInfo.voice || numberInfo.toll_free ? (
                        <div className="flex w-full flex-col xl:flex-row items-start gap-4">
                            <div className="flex w-full flex-row items-center gap-3">
                                <PhoneTransfer size={20} className="text-primary" />
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
                                error={t.has(voiceDestinationErrorState) ? t(voiceDestinationErrorState) : ''}
                                customClass="w-full"
                            />
                        </div>
                    ) : null}

                    {numberInfo.sms ? (
                        <div className="flex w-full flex-col xl:flex-row items-start gap-4">
                            <div className="flex w-full flex-row items-center gap-3">
                                <ChatText size={20} className="text-primary" />
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
                                error={t.has(smsDestinationErrorState) ? t(smsDestinationErrorState) : ''}
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
                    <div className="flex flex-row gap-3 justify-end items-center">
                        <div className="text-sm font-medium">{t('pay_for')}</div>
                        <DropdownSelect
                            selectId="discount"
                            selectTitle={t('select_qty')}
                            data={discounts}
                            onSelectAction={handleQtyChange}
                            selectedOption={discountState}
                            customClass="min-w-max w-fit"
                        />
                        <div className="text-sm font-medium">{t('month', {count: qty !== undefined ? qty.name : 1})}</div>
                    </div>

                    <div className="bg-card rounded-lg overflow-hidden shadow-sm border border-border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead colSpan={4} className="bg-muted/50 text-center font-medium">{t('discount')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {discounts.map(d => {
                                    return (d.id !== '0') ? (
                                        <TableRow key={d.name} className="text-sm">
                                            <TableCell className="whitespace-nowrap">{t('more_than')} {d.name} {t('month', {count: d.name})}</TableCell>
                                            <TableCell className="text-destructive font-medium">-{d.id}%</TableCell>
                                            <TableCell>=</TableCell>
                                            <TableCell className="whitespace-nowrap text-right font-medium">
                                                {Number(Number(d.id) / 100 * (numberInfo.fix_rate * Number(d.name) + numberInfo.setup_rate)).toFixed(2)}&thinsp;$
                                            </TableCell>
                                        </TableRow>
                                    ) : null
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex flex-row gap-3 justify-end items-center whitespace-nowrap text-sm font-medium">
                        {t('total_price')} <span className="text-primary text-lg font-bold">
                            {Number((100 - (qty !== undefined ? Number(qty.id) : 0)) / 100 * (numberInfo.fix_rate * (qty !== undefined ? Number(qty.name) : 1) + numberInfo.setup_rate)).toFixed(2)}&thinsp;$
                        </span>
                    </div>

                    <div className="flex w-full flex-row justify-end gap-3 mt-2">
                        <Button
                            type="submit"
                            style="pillow"
                            id="cart"
                        >
                            {t('add_to_cart')}
                        </Button>
                        <Button
                            type="submit"
                            style="pillow"
                            id="buy"
                        >
                            {t('buy')}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    ) : ''
};
