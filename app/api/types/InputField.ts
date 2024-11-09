import {Icon} from '@phosphor-icons/react'

export interface InputField {
    labelText: string,
    labelFor: string,
    id: string,
    name: string,
    type: string,
    autoComplete: string,
    isRequired: boolean,
    placeholder: string,
    icon: Icon,
}