import {At, Key} from '@phosphor-icons/react'
import {InputField} from '@/app/api/types/InputField'

const loginFields: InputField[] = [
    {
        labelText: 'email',
        labelFor: 'loginEmail',
        id: 'loginEmail',
        name: 'loginEmail',
        type: 'email',
        autoComplete: 'email',
        isRequired: true,
        placeholder: 'email',
        icon: At,
    },
    {
        labelText: 'password',
        labelFor: 'loginPassword',
        id: 'loginPassword',
        name: 'loginPassword',
        type: 'password',
        autoComplete: 'current-password',
        isRequired: true,
        placeholder: 'password',
        //icon: 'Key',
        icon: Key
    }
]
export {loginFields}