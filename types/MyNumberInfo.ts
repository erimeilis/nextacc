import {ExtManInfo} from './ExtManInfo'
import {SmsDestinationInfo} from './SmsDestinationInfo'
import {CallDestinationInfo} from './CallDestinationInfo'

export type MyNumberInfo = {
    did: string
    name: string
    autorenew: boolean
} & ExtManInfo & SmsDestinationInfo & CallDestinationInfo
