import {ReadonlyURLSearchParams} from 'next/navigation'

export default function CreateQueryString(
    name: string | null,
    value: string | number | null,
    searchParams: ReadonlyURLSearchParams | null,
    drop?: string[]
) {
    const params = new URLSearchParams(searchParams?.toString() || '')

    // Only set the param if name and value are provided
    if (name && value !== null && value !== '') {
        params.set(name, value.toString())
    }

    if (drop) {
        drop.forEach(v => params.delete(v))
    }

    // Clean up any empty keys that might exist
    params.delete('')

    return params.toString()
}
