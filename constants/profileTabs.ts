import {Tab} from '@/types/Tab'
import {ChartPieSliceIcon, CloudArrowUpIcon, SimCardIcon, UserIcon} from '@phosphor-icons/react'

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
        icon: CloudArrowUpIcon
    },
]
export {profileTabs}
