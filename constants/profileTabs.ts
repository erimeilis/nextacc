import {Tab} from '@/types/Tab'
import {ChartLineIcon, ChartPieSliceIcon, CloudArrowUpIcon, SimCardIcon, UserIcon, UserSoundIcon} from '@phosphor-icons/react'

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
    {
        name: 'statistics',
        slug: 'statistics',
        icon: ChartLineIcon
    },
    {
        name: 'ivr',
        slug: 'ivr',
        icon: UserSoundIcon
    },
]
export {profileTabs}
