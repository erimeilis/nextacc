import {At} from '@phosphor-icons/react'
import {InputField} from '@/types/InputField'

const verifyFields: InputField[] = [
    {
        labelText: 'email',
        labelFor: 'verifyEmail',
        id: 'verifyEmail',
        name: 'verifyEmail',
        type: 'email',
        autoComplete: 'email',
        isRequired: true,
        placeholder: 'email',
        icon: At,
    }
]
export {verifyFields}