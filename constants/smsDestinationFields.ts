import {Plus} from '@phosphor-icons/react'
import {InputField} from '@/types/InputField'

const smsDestinationsFields: InputField[] = [
    {
        labelText: 'phone',
        labelFor: 'phone',
        id: 'smsDestination',
        name: 'smsDestination',
        type: 'tel',
        autoComplete: 'tel',
        isRequired: true,
        placeholder: '1234565789',
        icon: Plus,
    },
    {
        labelText: 'email',
        labelFor: 'email',
        id: 'smsDestination',
        name: 'smsDestination',
        type: 'email',
        autoComplete: 'email',
        isRequired: true,
        placeholder: 'email',
    },
    {
        labelText: 'https',
        labelFor: 'https',
        id: 'smsDestination',
        name: 'smsDestination',
        type: 'url',
        autoComplete: 'https',
        isRequired: true,
        placeholder: 'webhook url',
    },
    {
        labelText: 'telegram',
        labelFor: 'telegram',
        id: 'smsDestination',
        name: 'smsDestination',
        type: 'url',
        autoComplete: 'telegram',
        isRequired: true,
        placeholder: 'bot incoming webhook url',
    },
    {
        labelText: 'slack',
        labelFor: 'slack',
        id: 'smsDestination',
        name: 'smsDestination',
        type: 'url',
        autoComplete: 'slack',
        isRequired: true,
        placeholder: 'webhook url',
    }
]
export {smsDestinationsFields}