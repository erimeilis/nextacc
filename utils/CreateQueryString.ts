import {ReadonlyURLSearchParams} from 'next/navigation'

export default function CQS(
    name: string, value: string | number,
    searchParams: ReadonlyURLSearchParams,
    drop?: string[]
) {
    const params = new URLSearchParams(searchParams.toString())
    params.set(name, value.toString())
    if (drop) {
        drop.forEach(v => params.delete(v))
    }
    return params.toString()
}