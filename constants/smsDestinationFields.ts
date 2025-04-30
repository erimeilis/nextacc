import {Plus} from '@phosphor-icons/react'
import {InputField} from '@/types/InputField'

const smsDestinationsFields: InputField[] = [
    {
        labelText: 'phone',
        labelFor: 'smsPhone',
        id: 'smsPhone',
        name: 'smsPhone',
        type: 'tel',
        autoComplete: 'tel',
        isRequired: true,
        placeholder: '1234565789',
        icon: Plus,
    },
    {
        labelText: 'email',
        labelFor: 'smsEmail',
        id: 'smsEmail',
        name: 'smsEmail',
        type: 'email',
        autoComplete: 'email',
        isRequired: true,
        placeholder: 'email',
    },
    {
        labelText: 'https',
        labelFor: 'smsHttps',
        id: 'smsHttps',
        name: 'smsHttps',
        type: 'url',
        autoComplete: 'https',
        isRequired: true,
        placeholder: 'webhook url',
    },
    {
        labelText: 'telegram',
        labelFor: 'smsTelegram',
        id: 'smsTelegram',
        name: 'smsTelegram',
        type: 'url',
        autoComplete: 'telegram',
        isRequired: true,
        placeholder: 'bot incoming webhook url',
    },
    {
        labelText: 'slack',
        labelFor: 'smsSlack',
        id: 'smsSlack',
        name: 'smsSlack',
        type: 'url',
        autoComplete: 'slack',
        isRequired: true,
        placeholder: 'webhook url',
    }
]
export {smsDestinationsFields}