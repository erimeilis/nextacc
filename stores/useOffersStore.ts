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
    updateCountries: (type: string) => Promise<CountryInfo[]>;
    updateAreas: (type: string, countryId: number) => Promise<AreaInfo[]>;
    updateNumbers: (type: string, countryId: number, areaPrefix: number) => Promise<NumberInfo[]>;
    updateDiscounts: () => Promise<{ id: string, name: string }[]>;
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

            updateCountries: async (type): Promise<CountryInfo[]> => {
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

            updateAreas: async (type, countryId): Promise<AreaInfo[]> => {
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

            updateNumbers: async (type, countryId, areaPrefix): Promise<NumberInfo[]> => {
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

            updateDiscounts: async (): Promise<{ id: string, name: string }[]> => {
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
            version: 1,
            partialize: (state: OffersStore) => ({
                countriesMap: state.countriesMap,
                areasMap: state.areasMap,
                numbersMap: state.numbersMap,
                discounts: state.discounts,
            }),
            merge: (persistedState, currentState) => {
                const persisted = persistedState as Partial<OffersStore> || {}
                return {
                    ...currentState,
                    countriesMap:
                        persisted.countriesMap && Object.keys(persisted.countriesMap).length > 0
                            ? persisted.countriesMap
                            : currentState.countriesMap,
                    areasMap:
                        persisted.areasMap && Object.keys(persisted.areasMap).length > 0
                            ? persisted.areasMap
                            : currentState.areasMap,
                    numbersMap:
                        persisted.numbersMap && Object.keys(persisted.numbersMap).length > 0
                            ? persisted.numbersMap
                            : currentState.numbersMap,
                    discounts:
                        persisted.discounts && persisted.discounts.length > 0
                            ? persisted.discounts
                            : currentState.discounts,
                }
            },
        }
    )
)
