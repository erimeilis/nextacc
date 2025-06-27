import {Icon} from '@phosphor-icons/react'

export type InputField = {
    labelText: string,
    labelFor: string,
    id: string,
    name: string,
    type: string,
    autoComplete: string,
    isRequired: boolean,
    placeholder: string,
    icon?: Icon,
    isDropdown?: boolean,
    dropdownData?: { id: string, name: string }[],
}
