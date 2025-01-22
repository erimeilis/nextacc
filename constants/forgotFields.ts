import {At} from '@phosphor-icons/react'
import {InputField} from '@/types/InputField'

const forgotFields: InputField[] = [
    {
        labelText: 'email',
        labelFor: 'forgotEmail',
        id: 'forgotEmail',
        name: 'forgotEmail',
        type: 'email',
        autoComplete: 'email',
        isRequired: true,
        placeholder: 'email',
        icon: At,
    }
]
export {forgotFields}