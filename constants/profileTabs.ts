import {Tab} from '@/types/Tab'
import {ChartPieSliceIcon, CloudArrowUp, SimCardIcon, UserIcon} from '@phosphor-icons/react'

const profileTabs: Tab[] = [
    {
        name: 'profile',
        slug: 'profile',
        icon: UserIcon,
    },
    {
        name: 'transactions',
        slug: 'transactions',
        icon: ChartPieSliceIcon
    },
    {
        name: 'numbers',
        slug: 'numbers',
        icon: SimCardIcon
    },
    {
        name: 'uploads',
        slug: 'uploads',
        icon: CloudArrowUp
    },
]
export {profileTabs}
