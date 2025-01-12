import {At, Checks, Key, Phone} from '@phosphor-icons/react'
import {InputField} from '@/types/InputField'

const signupFields: InputField[] = [
    {
        labelText: 'phone',
        labelFor: 'signupPhone',
        id: 'signupPhone',
        name: 'signupPhone',
        type: 'phone',
        autoComplete: 'phone',
        isRequired: true,
        placeholder: 'phone',
        icon: Phone,
    },
    {
        labelText: 'email',
        labelFor: 'signupEmail',
        id: 'signupEmail',
        name: 'signupEmail',
        type: 'email',
        autoComplete: 'email',
        isRequired: true,
        placeholder: 'email',
        icon: At,
    },
    {
        labelText: 'password',
        labelFor: 'signupPassword',
        id: 'signupPassword',
        name: 'signupPassword',
        type: 'password',
        autoComplete: 'current-password',
        isRequired: true,
        placeholder: 'password',
        icon: Key,
    },
    {
        labelText: 'confirm',
        labelFor: 'signupConfirmPassword',
        id: 'signupConfirmPassword',
        name: 'signupConfirmPassword',
        type: 'password',
        autoComplete: 'confirm-password',
        isRequired: true,
        placeholder: 'confirm',
        icon: Checks,
    }
]

export {signupFields}