import {At, Plus} from '@phosphor-icons/react'
import {InputField} from '@/types/InputField'

const voiceDestinationsFields: InputField[] = [
    {
        labelText: 'phone',
        labelFor: 'phone',
        id: 'voiceDestination',
        name: 'voiceDestination',
        type: 'tel',
        autoComplete: 'tel',
        isRequired: true,
        placeholder: '1234565789',
        icon: Plus,
    },
    {
        labelText: 'telegram',
        labelFor: 'telegram',
        id: 'voiceDestination',
        name: 'voiceDestination',
        type: 'text',
        autoComplete: 'telegram',
        isRequired: true,
        placeholder: 'number or username',
        icon: At,
    },
    {
        labelText: 'sip',
        labelFor: 'sip',
        id: 'voiceDestination',
        name: 'voiceDestination',
        type: 'text',
        autoComplete: 'sip',
        isRequired: true,
        placeholder: 'sip/sip_id@provider.com',
    }
]
export {voiceDestinationsFields}