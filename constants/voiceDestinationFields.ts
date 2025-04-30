import {At, Plus} from '@phosphor-icons/react'
import {InputField} from '@/types/InputField'

const voiceDestinationsFields: InputField[] = [
    {
        labelText: 'phone',
        labelFor: 'voicePhone',
        id: 'voicePhone',
        name: 'voicePhone',
        type: 'tel',
        autoComplete: 'tel',
        isRequired: true,
        placeholder: '1234565789',
        icon: Plus,
    },
    {
        labelText: 'telegram',
        labelFor: 'voiceTelegram',
        id: 'voiceTelegram',
        name: 'voiceTelegram',
        type: 'text',
        autoComplete: 'telegram',
        isRequired: true,
        placeholder: 'number or username',
        icon: At,
    },
    {
        labelText: 'sip',
        labelFor: 'voiceSip',
        id: 'voiceSip',
        name: 'voiceSip',
        type: 'text',
        autoComplete: 'sip',
        isRequired: true,
        placeholder: 'sip/sip_id@provider.com',
    }
]
export {voiceDestinationsFields}