/**
 * Maps legacy voice destination type values to current values.
 *
 * Legacy API returns 'skype', 'phone', 'sip' but the current UI
 * uses 'voiceTelegram', 'voicePhone', 'voiceSip'.
 *
 * @param value - The type value to map (may be undefined or empty)
 * @param defaultValue - Default value to return for undefined/empty input (default: 'none')
 * @returns The mapped type value
 */
export function mapLegacyTypeValue(value: string | undefined, defaultValue: string = 'none'): string {
    if (!value) return defaultValue

    switch (value) {
        case 'skype':
            return 'voiceTelegram'
        case 'phone':
            return 'voicePhone'
        case 'sip':
            return 'voiceSip'
        default:
            return value
    }
}
