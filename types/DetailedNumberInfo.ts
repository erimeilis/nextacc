import { ExtManInfo } from './ExtManInfo'
import { SmsDestinationInfo } from './SmsDestinationInfo'
import { CallDestinationInfo } from './CallDestinationInfo'

export type DetailedNumberInfo = {
    did: string
} & ExtManInfo & SmsDestinationInfo & CallDestinationInfo
