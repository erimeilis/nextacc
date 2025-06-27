import countries from 'i18n-iso-countries'
import en from 'i18n-iso-countries/langs/en.json'

// Register the languages you want to use
countries.registerLocale(en)

export interface CountryOption {
    id: string;  // ISO-3 code
    name: string; // Country name
    alpha2?: string; // ISO-2 code for flags
}

/**
 * Get a list of all countries with their names and ISO-3 codes
 * @returns Array of country objects with id (ISO-3 code), name, and alpha2 (ISO-2 code for flags)
 */
export function getCountries(): CountryOption[] {
    // Get the mapping of alpha3 to alpha2 codes
    const countryCodes = countries.getAlpha3Codes()

    return Object.entries(countryCodes).map(([alpha3, alpha2]) => {
        // Use alpha2 to get the country name
        const name = countries.getName(alpha2, 'en')

        return {
            id: alpha3,
            name: name || alpha2, // Fallback to alpha2 code if the name is undefined
            alpha2: alpha2.toLowerCase() // ISO-2 code for flags (lowercase for URL compatibility)
        }
    }).filter(country => country.name) // Filter out any countries without names
        .sort((a, b) => a.name.localeCompare(b.name))
}
