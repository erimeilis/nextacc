import {create} from 'zustand'
import {persist} from 'zustand/middleware'
import {CountryInfo} from '@/types/CountryInfo'
import {AreaInfo} from '@/types/AreaInfo'
import {NumberInfo} from '@/types/NumberInfo'
import {getAreas, getCountries, getDiscounts, getNumbers} from '@/app/api/redreport/offers'
import {idbStorage} from '@/stores/idbStorage'

interface OffersStore {
    countriesMap: {
        [key: string]: CountryInfo[];
    };
    areasMap: {
        [key: string]: AreaInfo[];
    };
    numbersMap: {
        [key: string]: NumberInfo[];
    };
    discounts: { id: string, name: string }[];

    fetchData: () => Promise<void>;
    fetchCountries: (type: string) => Promise<CountryInfo[]>;
    fetchAreas: (type: string, countryId: number) => Promise<AreaInfo[]>;
    fetchNumbers: (type: string, countryId: number, areaPrefix: number) => Promise<NumberInfo[]>;
    fetchDiscounts: () => Promise<{ id: string, name: string }[]>;
}

// Define the persisted state type (only the data that gets stored)
type PersistedOffersState = {
    countriesMap: { [key: string]: CountryInfo[] }
    areasMap: { [key: string]: AreaInfo[] }
    numbersMap: { [key: string]: NumberInfo[] }
    discounts: { id: string, name: string }[]
}

// Type guard to check if the persisted state has the expected shape
function isValidPersistedOffersState(state: unknown): state is Partial<PersistedOffersState> {
    return state !== null && typeof state === 'object'
}

export const useOffersStore = create<OffersStore>()(
    persist(
        (set) => ({
            countriesMap: {},
            areasMap: {},
            numbersMap: {},
            discounts: [],

            fetchData: async () => {
                try {
                    // This could be expanded to load initial data if needed
                } catch (error) {
                    console.error('Failed to fetch offers data:', error)
                }
            },

            fetchCountries: async (type): Promise<CountryInfo[]> => {
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
                return countries // Return the fetched countries
            },

            fetchAreas: async (type, countryId): Promise<AreaInfo[]> => {
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
                return areas // Return the fetched areas
            },

            fetchNumbers: async (type, countryId, areaPrefix): Promise<NumberInfo[]> => {
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
                return numbers // Return the fetched numbers
            },

            fetchDiscounts: async (): Promise<{ id: string, name: string }[]> => {
                const discounts = await getDiscounts()
                set(state => {
                    if (
                        state.discounts.length === 0 ||
                        JSON.stringify(state.discounts) !== JSON.stringify(discounts)
                    ) {
                        return {
                            discounts: discounts
                        }
                    }
                    return state
                })
                return discounts // Return the fetched discounts
            }
        }),
        {
            name: 'offers-storage',
            storage: idbStorage,
            version: 2,
            migrate: (persistedState: unknown, version: number): PersistedOffersState => {
                // Handle migration from version 1 to version 2
                if (version === 1 && isValidPersistedOffersState(persistedState)) {
                    return {
                        countriesMap: persistedState.countriesMap ?? {},
                        areasMap: persistedState.areasMap ?? {},
                        numbersMap: persistedState.numbersMap ?? {},
                        discounts: persistedState.discounts ?? [],
                    }
                }

                // For any other version mismatches or invalid state, return a clean state
                return {
                    countriesMap: {},
                    areasMap: {},
                    numbersMap: {},
                    discounts: [],
                }
            },
            partialize: (state: OffersStore): PersistedOffersState => ({
                countriesMap: state.countriesMap,
                areasMap: state.areasMap,
                numbersMap: state.numbersMap,
                discounts: state.discounts,
            }),
        }
    )
)
