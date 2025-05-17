import {create} from 'zustand'
import {persist} from 'zustand/middleware'
import {CountryInfo} from '@/types/CountryInfo'
import {AreaInfo} from '@/types/AreaInfo'
import {NumberInfo} from '@/types/NumberInfo'
import {getAreas, getCountries, getNumbers} from '@/app/api/redreport/offers'

interface State {
    countriesMap: {
        [key: string]: CountryInfo[];
    };
    areasMap: {
        [key: string]: AreaInfo[];
    };
    numbersMap: {
        [key: string]: NumberInfo[];
    };
    isLoading: boolean;
    error: unknown;
}

interface Actions {
    fetchData: () => Promise<void>;
    updateCountries: (type: string) => Promise<void>;
    updateAreas: (type: string, countryId: number) => Promise<void>;
    updateNumbers: (type: string, countryId: number, areaPrefix: number) => Promise<void>;
}

const INITIAL_STATE: State = {
    countriesMap: {},
    areasMap: {},
    numbersMap: {},
    isLoading: false,
    error: null
}

export const useOffersStore = create(
    persist<State & Actions>(
        (set) => ({
            ...INITIAL_STATE,

            fetchData: async () => {
                try {
                    set({isLoading: true, error: null})
                    // This could be expanded to load initial data if needed
                    set({isLoading: false})
                } catch (error) {
                    console.error('Failed to fetch offers data:', error)
                    set({error, isLoading: false})
                }
            },

            updateCountries: async (type) => {
                const countries = await getCountries({type})
                set(state => {
                    if (
                        state.countriesMap[type] === undefined ||
                        state.countriesMap[type] !== countries
                    ) {
                        return {
                            countriesMap: {
                                ...state.countriesMap,
                                [type]: countries
                            }
                        }
                    }
                    return state
                })
            },

            updateAreas: async (type, countryId) => {
                const areas = await getAreas({type, country: countryId})
                set(state => {
                    const key = `${type}_${countryId}`
                    if (
                        state.areasMap[key] === undefined ||
                        state.areasMap[key] !== areas
                    ) {
                        return {
                            areasMap: {
                                ...state.areasMap,
                                [key]: areas
                            }
                        }
                    }
                    return state
                })
            },

            updateNumbers: async (type, countryId, areaPrefix) => {
                const numbers = await getNumbers({type, country: countryId, area: areaPrefix})
                set(state => {
                    const key = `${type}_${countryId}_${areaPrefix}`
                    if (
                        state.numbersMap[key] === undefined ||
                        state.numbersMap[key] !== numbers
                    ) {
                        return {
                            numbersMap: {
                                ...state.numbersMap,
                                [key]: numbers
                            }
                        }
                    }
                    return state
                })
            }
        }),
        {
            name: 'offers-storage',
            // Optional: specify storage type
            // getStorage: () => sessionStorage,
        }
    )
)