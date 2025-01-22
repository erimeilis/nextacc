'use client'
import React, {ChangeEvent, useState} from 'react'
import {NumberInfo} from '@/types/NumberInfo'
import DropdownSelectString from '@/components/shared/DropdownSelectString'
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
import DropdownSelectNumber from '@/components/shared/DropdownSelectNumber'
import {ChatText, PhoneTransfer} from '@phosphor-icons/react'

export default function BuyNumberForm({numberInfo}: { numberInfo: NumberInfo | null }) {
    const t = useTranslations('offers')
    const d = useTranslations('docs')

    const voice: { id: string, name: string }[] = voiceDestinationsFields.map((i) => {
        return {id: i.labelText, name: t(i.labelText)}
    })
    const sms: { id: string, name: string }[] = smsDestinationsFields.map((i) => {
        return {id: i.labelText, name: t(i.labelText)}
    })
    const handleChoice = () => {
    }

    function Discounts(): { id: number, name: string }[] {
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

    const [voiceTypeState, setVoiceTypeState] = useState<string>('phone')
    const [smsTypeState, setSmsTypeState] = useState<string>('phone')
    const [voiceDestinationState, setVoiceDestinationState] = useState('')
    const [smsDestinationState, setSmsDestinationState] = useState('')
    const [voiceDestinationErrorState, setVoiceDestinationErrorState] = useState<string>('')
    const [smsDestinationErrorState, setSmsDestinationErrorState] = useState<string>('')
    const [discountState, setDiscountState] = useState<number>(0)

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
            case 'phone': {
                const {error, data} = validateInputData(schemaPhone, e.target.value)
                setVoiceDestinationState(data ?? e.target.value.replace(/\D/g, ''))
                setVoiceDestinationErrorState(error ?? '')
            }
                break
            case 'telegram': {
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
            case 'sip': {
                const {error, data} = validateInputData(schemaSip, 'sip/' + e.target.value.toLowerCase().replace(/^sips?[:\/]/, ''))
                setVoiceDestinationState(data ?? 'sip/' + e.target.value.toLowerCase().replace(/^sips?[:\/]/, ''))
                setVoiceDestinationErrorState(error ?? '')
            }
        }
    }
    const handleSmsDestinationChange = (e: ChangeEvent<HTMLInputElement>) => {
        switch (smsTypeState) {
            case 'phone': {
                const {error, data} = validateInputData(schemaPhone, e.target.value)
                setSmsDestinationState(data ?? e.target.value.replace(/\D/g, ''))
                setSmsDestinationErrorState(error ?? '')
            }
                break
            case 'email': {
                const {error, data} = validateInputData(schemaEmail, e.target.value.toLowerCase())
                setSmsDestinationState(data ?? e.target.value.toLowerCase())
                setSmsDestinationErrorState(error ?? '')
            }
                break
            case 'https':
            case 'telegram':
            case 'slack': {
                const {
                    error,
                    data
                } = validateInputData(schemaHttps, (/^https?:\/\//.test(e.target.value)) ? e.target.value.toLowerCase() : 'https://' + e.target.value.toLowerCase())
                setSmsDestinationState(data ?? ((/^https?:\/\//.test(e.target.value)) ? e.target.value.toLowerCase() : 'https://' + e.target.value.toLowerCase()))
                setSmsDestinationErrorState(error ?? '')
            }
        }
    }

    const qnty = discounts.find(q => q.id == discountState)
    const handleQntyChange = (value: number) => {
        setDiscountState(value)
    }

    return numberInfo ? (
        <form
            id="buyNumberForm"
            name="buyNumberForm"
            className="mt-8 space-y-6 transition-transform duration-500"
            onSubmit={handleChoice}
            method="post"
        >
            <div className="flex flex-row gap-4 justify-between">
                <div className="w-full">
                    <div className="mb-2">
                        {t('setupfee') + ': ' + numberInfo.setuprate + '$ / ' + t('monthlyfee') + ': ' + numberInfo.fixrate + '$'}
                    </div>
                    {numberInfo.voice || numberInfo.tollfree ?
                        <div className="flex w-full flex-row items-center gap-2">
                            <PhoneTransfer size={48}/>
                            <DropdownSelectString
                                selectId="voiceType"
                                selectTitle={t('select_voice_destination')}
                                data={voice}
                                onSelectAction={handleVoiceTypeChange}
                                selectedOption={voiceTypeState}
                                customClass="min-w-20 w-fit"
                            />
                            <Input
                                handleChangeAction={handleVoiceDestinationChange}
                                value={voiceDestinationState}
                                labelText={t(voiceDestinationsFields.find(i => i.labelText === voiceTypeState)!.labelText)}
                                labelFor={voiceDestinationsFields.find(i => i.labelText === voiceTypeState)!.labelFor}
                                id={voiceDestinationsFields.find(i => i.labelText === voiceTypeState)!.id}
                                name={voiceDestinationsFields.find(i => i.labelText === voiceTypeState)!.name}
                                type={voiceDestinationsFields.find(i => i.labelText === voiceTypeState)!.type}
                                isRequired={numberInfo.voice || numberInfo.tollfree}
                                placeholder={voiceDestinationsFields.find(i => i.labelText === voiceTypeState)!.placeholder}
                                icon={voiceDestinationsFields.find(i => i.labelText === voiceTypeState)!.icon}
                                error={t.has(voiceDestinationErrorState) ? t(voiceDestinationErrorState) : ''}
                                customClass="w-full"
                            />
                        </div> :
                        ''}
                    {numberInfo.sms ?
                        <div className="flex w-full flex-row items-center gap-2">
                            <ChatText size={48}/>
                            <DropdownSelectString
                                selectId="smsType"
                                selectTitle={t('select_sms_destination')}
                                data={sms}
                                onSelectAction={handleSmsTypeChange}
                                selectedOption={smsTypeState}
                                customClass="min-w-20 w-fit"
                            />
                            <Input
                                handleChangeAction={handleSmsDestinationChange}
                                value={smsDestinationState}
                                labelText={t(smsDestinationsFields.find(i => i.labelText === smsTypeState)!.labelText)}
                                labelFor={smsDestinationsFields.find(i => i.labelText === smsTypeState)!.labelFor}
                                id={smsDestinationsFields.find(i => i.labelText === smsTypeState)!.id}
                                name={smsDestinationsFields.find(i => i.labelText === smsTypeState)!.name}
                                type={smsDestinationsFields.find(i => i.labelText === smsTypeState)!.type}
                                isRequired={numberInfo.sms}
                                placeholder={smsDestinationsFields.find(i => i.labelText === smsTypeState)!.placeholder}
                                icon={smsDestinationsFields.find(i => i.labelText === smsTypeState)!.icon}
                                error={t.has(smsDestinationErrorState) ? t(smsDestinationErrorState) : ''}
                                customClass="w-full"
                            />
                        </div> :
                        ''}
                    <div>
                        {GetDocs(numberInfo)}
                    </div>
                </div>
                <div className="flex flex-col gap-2 min-w-64 w-fit">
                    <div className="flex flex-row gap-2 justify-end items-center">
                        <div className="whitespace-nowrap">{t('pay_for')}</div>
                        <DropdownSelectNumber
                            selectId="discount"
                            selectTitle={t('select_qnty')}
                            data={discounts}
                            onSelectAction={handleQntyChange}
                            selectedOption={discountState}
                            customClass="min-w-max w-fit"
                        />
                        <div className="whitespace-nowrap">{t('month', {count: qnty !== undefined ? qnty.name : 1})}</div>
                    </div>
                    <div className="flex flex-row gap-2 justify-end items-center text-sm">
                        
                    </div>
                    <div className="flex w-full flex-row justify-end gap-2">
                        <Button
                            type="button"
                            style="pillow"
                            onClick={() => {
                            }}
                        >
                            {t('add_to_cart')}
                        </Button>
                        <Button
                            type="button"
                            style="pillow"
                            onClick={() => {
                            }}
                        >
                            {t('buy')}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    ) : ''
};