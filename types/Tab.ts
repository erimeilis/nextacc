import {FC, SVGProps} from 'react'

export type Tab = {
    name: string,
    slug: string,
    icon?: FC<SVGProps<SVGSVGElement>>
}