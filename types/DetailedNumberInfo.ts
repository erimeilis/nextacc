import {ExtManInfo} from './ExtManInfo'
import {SmsDestinationInfo} from './SmsDestinationInfo'
import {CallDestinationInfo} from './CallDestinationInfo'

export type DetailedNumberInfo = {
    did: string
    name: string
    autorenew: boolean
} & ExtManInfo & SmsDestinationInfo & CallDestinationInfo
