'use client'
import DropdownSelectGeo from '@/components/forms/DropdownSelectGeo'
import NumberTypeSelector from '@/components/offers/NumberTypeSelector'
import {Card} from '@/components/ui/layout/Card'
import {useTranslations} from 'next-intl'
import {usePathname, useRouter, useSearchParams} from 'next/navigation'
import React, {useCallback, useEffect, useRef, useState} from 'react'
import {NumberInfo} from '@/types/NumberInfo'
import CreateQueryString from '@/utils/CreateQueryString'
import getSlug from '@/utils/getSlug'
import Show from '@/components/ui/display/Show'
import dynamic from 'next/dynamic'
import {numberTypes} from '@/constants/numberTypes'
import {useCart} from '@/hooks/queries/use-cart'
import {useWaitingDids} from '@/hooks/queries/use-waiting-dids'
import {useAuthSession} from '@/hooks/use-auth-session'
import {getPersistState} from '@/utils/usePersistState'
import {useOffersStore} from '@/stores/useOffersStore'
import {CountryInfo} from '@/types/CountryInfo'
import {AreaInfo} from '@/types/AreaInfo'
import Loader from '@/components/ui/loading/Loader'

// Dynamically import components that are only needed conditionally
const NumberOffersList = dynamic(() => import('@/components/offers/NumberOffersList'), {
    ssr: true,
    loading: () => <div className="animate-pulse h-40 bg-muted rounded-md"></div>
})

const BuyNumberForm = dynamic(() => import('@/components/offers/BuyNumberForm'), {
    ssr: true,
    loading: () => <div className="animate-pulse h-60 bg-muted rounded-md"></div>
})

export default function OffersPage() {
    const router = useRouter()
    const pathName = usePathname()
    const searchParams = useSearchParams()

    const t = useTranslations('offers')
    const [localCountriesMap, setLocalCountriesMap] = useState<CountryInfo[] | null>([])
    const [localAreasMap, setLocalAreasMap] = useState<AreaInfo[] | null>([])
    const [localNumbersMap, setLocalNumbersMap] = useState<NumberInfo[] | null>([])
    const {countriesMap, areasMap, numbersMap, fetchCountries, fetchAreas, fetchNumbers} = useOffersStore()

    // Get URL params
    const type = searchParams ? searchParams.get('type') : null
    const countryParam = searchParams?.get('country') ?? null
    const areaParam = searchParams?.get('area') ?? null

    // Compute derived values
    const countryFromUrl = countryParam && type && localCountriesMap
        ? localCountriesMap.find(c => getSlug(c.countryname) === countryParam || c.id.toString() === countryParam)?.id
        : null
    const areaFromUrl = areaParam && localAreasMap
        ? localAreasMap.find(a => getSlug(a.areaname) === areaParam || a.areaprefix.toString() === areaParam)?.areaprefix
        : null

    // Cache keys
    const cachedCountries = type ? countriesMap[type] : null
    const areasKey = type && countryFromUrl ? `${type}_${countryFromUrl}` : null
    const cachedAreas = areasKey ? areasMap[areasKey] : null
    const numbersKey = type && countryFromUrl && areaFromUrl ? `${type}_${countryFromUrl}_${areaFromUrl}` : null
    const cachedNumbers = numbersKey ? numbersMap[numbersKey] : null

    // Sync from store cache to local state (useEffect is required here due to SSR/hydration)
    // Intentionally excluding local*Map from deps - we only want to sync when cache changes, not when local changes
    useEffect(() => {
        if (cachedCountries && localCountriesMap !== cachedCountries) {
            setLocalCountriesMap(cachedCountries)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cachedCountries])

    useEffect(() => {
        if (cachedAreas && localAreasMap !== cachedAreas) {
            setLocalAreasMap(cachedAreas)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cachedAreas])

    useEffect(() => {
        if (cachedNumbers && localNumbersMap !== cachedNumbers) {
            setLocalNumbersMap(cachedNumbers)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cachedNumbers])

    // Clear dependent state when URL params change
    useEffect(() => {
        if (!type) {
            setLocalCountriesMap(null)
            setLocalAreasMap(null)
            setLocalNumbersMap(null)
        }
    }, [type])

    useEffect(() => {
        if (!countryParam) {
            setLocalAreasMap(null)
            setLocalNumbersMap(null)
        }
    }, [countryParam])

    useEffect(() => {
        if (!areaParam) {
            setLocalNumbersMap(null)
        }
    }, [areaParam])

    const persistentId = getPersistState<string>('persistentId', 'no-id')
    const {data: cart = []} = useCart(persistentId)
    const {data: waitingNumbers = []} = useWaitingDids()
    const {status: authStatus} = useAuthSession()
    const isUserLoggedIn = useCallback(() => authStatus === 'authenticated', [authStatus])
    const buyForm = useRef<HTMLDivElement>(null)
    const latestTypeRequestRef = useRef<string | null>(null)
    const latestCountryRequestRef = useRef<number | null>(null)

    useEffect(() => {
        if (searchParams && !searchParams.has('type')) {
            // If no type is in the URL and this is an initial render, set voice as default
            router.push(pathName + '?' + CreateQueryString('type', 'voice', searchParams, ['country', 'area', 'number']))
        }
        // Note: localNumbersMap clearing is now handled by render-time sync above
        if (searchParams &&
            searchParams.has('number') &&
            localNumbersMap &&
            (
                !localNumbersMap.some(numberInfo => numberInfo.did === searchParams.get('number')) ||
                cart.some(cartItem => {
                    // Check if cartItem.did is numeric
                    const isNumeric = /^\d+$/.test(cartItem.did)
                    // If it's numeric and matches the current number's did, return true (this item is in the cart)
                    return isNumeric && cartItem.did === searchParams.get('number')
                }) ||
                (isUserLoggedIn() &&
                    Array.isArray(waitingNumbers) &&
                    waitingNumbers.some(myWaitingNumber => {
                        // Check if cartItem.did is numeric
                        const isNumeric = /^\d+$/.test(myWaitingNumber.did)
                        // If it's numeric and matches the current number's did, return true (this item is in the cart)
                        return isNumeric && myWaitingNumber.did === searchParams.get('number')
                    })))
        ) {
            // If the number is not in the localNumbersMap (not available), redirect to a path without a number
            router.push(pathName + '?' + CreateQueryString(null, null, searchParams, ['number']))
        }
    }, [searchParams, pathName, router, localNumbersMap, cart, waitingNumbers, isUserLoggedIn])

    // Note: type is defined earlier for render-time sync
    const countryBySlug = (searchParams && searchParams.has('country')) ?
        (localCountriesMap?.find(e =>
            getSlug(e.countryname) == searchParams.get('country'))) :
        null
    const country = (searchParams && searchParams.has('country')) ?
        (!isNaN(+(searchParams.get('country') || '')) ?
            Number(searchParams.get('country')) :
            (countryBySlug ?
                Number(countryBySlug.id) :
                null)) :
        null
    const areaBySlug = (searchParams && searchParams.has('area')) ?
        (localAreasMap?.find(e =>
            getSlug(e.areaname) == searchParams.get('area'))) :
        null
    const area = (searchParams && searchParams.has('area')) ?
        (!isNaN(+(searchParams.get('area') || '')) ?
            Number(searchParams.get('area')) :
            (areaBySlug ?
                Number(areaBySlug.areaprefix) :
                null)) :
        null
    const number = (searchParams && searchParams.has('number')) ?
        searchParams.get('number') :
        null

    const handleNumber = useCallback((number: NumberInfo) => {
        router.push(pathName + '?' + CreateQueryString('number', number.did, searchParams), {
            scroll: false  // This prevents the automatic scroll behavior
        })
    }, [pathName, router, searchParams])

    const handleArea = useCallback((area: number | string) => {
        if (type && country) {
            const newArea = (searchParams && searchParams.has('area')) ?
                (!isNaN(+(searchParams.get('area') || '')) ?
                    Number(searchParams.get('area')) :
                    (areaBySlug ?
                        Number(areaBySlug.areaprefix) :
                        null)) :
                null
            if (newArea) {
                fetchNumbers(type!, country, newArea)
                    .then((fetchedNumbers) => {
                        setLocalNumbersMap(fetchedNumbers)
                        // Auto-select the only number if there's just one
                        if (fetchedNumbers.length === 1 &&
                            !searchParams?.has('number') &&
                            fetchedNumbers.at(0) !== undefined) {
                            handleNumber(fetchedNumbers.at(0)!)
                        }
                    })
            }
        }
        router.push(pathName + '?' + CreateQueryString('area', area, searchParams, ['number']))
    }, [areaBySlug, country, handleNumber, pathName, router, searchParams, type, fetchNumbers])

    useEffect(() => {
        if (type) {
            // Note: cache sync from countriesMap is handled by render-time sync above
            // Only fetch if not in cache
            if (!countriesMap[type!]) {
                fetchCountries(type!)
                    .then((fetchedCountries) => {
                        setLocalCountriesMap(fetchedCountries)
                    })
            }

            if (country) {
                // Handle non-existable country selected
                if (!countriesMap[type!]?.some(c => c.id === country)) {
                    router.push(pathName + '?' + CreateQueryString('type', type!, searchParams, ['country', 'area', 'number']))
                    return
                }

                const cKey: string = `${type}_${country}`
                // Note: cache sync from areasMap is handled by render-time sync above
                if (areasMap[cKey]) {
                    // Handle auto-selection of area when there's only one option
                    if (areasMap[cKey]?.length === 1 &&
                        !searchParams?.has('area') &&
                        areasMap[cKey].at(0) !== undefined
                    ) {
                        handleArea(areasMap[cKey].at(0)!.areaprefix)
                    }
                } else {
                    // Only fetch if not available in cache
                    fetchAreas(type!, country)
                        .then((fetchedAreas) => {
                            setLocalAreasMap(fetchedAreas)
                            // Handle auto-selection of area when there's only one option
                            if (fetchedAreas.length === 1 &&
                                !searchParams?.has('area') &&
                                fetchedAreas.at(0) !== undefined
                            ) {
                                handleArea(fetchedAreas.at(0)!.areaprefix)
                            }
                        })
                }

                if (area) {
                    const aKey: string = `${type}_${country}_${area}`
                    // Note: cache sync from numbersMap is handled by render-time sync above
                    if (numbersMap[aKey]) {
                        // Auto-select the only number if there's just one
                        if (numbersMap[aKey].length === 1 &&
                            !searchParams?.has('number') &&
                            numbersMap[aKey].at(0) !== undefined) {
                            handleNumber(numbersMap[aKey].at(0)!)
                        }
                    } else {
                        // Only fetch if not available in cache
                        fetchNumbers(type!, country, area)
                            .then((fetchedNumbers) => {
                                setLocalNumbersMap(fetchedNumbers)
                                // Auto-select the only number if there's just one
                                if (fetchedNumbers.length === 1 &&
                                    !searchParams?.has('number') &&
                                    fetchedNumbers.at(0) !== undefined) {
                                    handleNumber(fetchedNumbers.at(0)!)
                                }
                            })
                    }
                }
                // Note: Clearing is handled by render-time sync when params become null
            }
        }
    }, [area, areasMap, countriesMap, country, handleArea, handleNumber, numbersMap, pathName, router, searchParams, type, fetchAreas, fetchCountries, fetchNumbers])

    const countries = localCountriesMap ?
        localCountriesMap.map(country => ({
            id: country.id,
            name: country.countryname + ' +' + country.countryprefix.toString(),
        })) :
        null
    const handleCountry = useCallback((country: number | string) => {
        const slug = countries?.find(e => e.id == country)
        const countryParam = slug ? getSlug(slug.name) : country

        // Get the actual country ID being selected (not from searchParams!)
        const selectedCountryId = typeof country === 'number'
            ? country
            : (localCountriesMap?.find(c => getSlug(c.countryname) === country || c.id.toString() === country)?.id ?? null)

        // Clear areas immediately to prevent showing stale data
        setLocalAreasMap(null)
        setLocalNumbersMap(null)

        if (type && selectedCountryId) {
            // Track this request to handle race conditions
            latestCountryRequestRef.current = selectedCountryId

            fetchAreas(type, selectedCountryId)
                .then((fetchedAreas) => {
                    // Ignore stale response if user switched to another country
                    if (latestCountryRequestRef.current !== selectedCountryId) return

                    setLocalAreasMap(fetchedAreas)
                    // Handle auto-selection of area when there's only one option
                    if (fetchedAreas.length === 1 &&
                        !searchParams?.has('area') &&
                        fetchedAreas.at(0) !== undefined
                    ) {
                        handleArea(fetchedAreas.at(0)!.areaprefix)
                    }
                })
        }
        router.push(pathName + '?' + CreateQueryString('country', countryParam, searchParams, ['area', 'number']))
    }, [countries, localCountriesMap, handleArea, pathName, router, searchParams, type, fetchAreas])

    const handleType = useCallback(async (t: string) => {
        // Track this request to handle race conditions
        const requestId = t
        latestTypeRequestRef.current = requestId

        const fetchedCountries = await fetchCountries(t)

        // Ignore stale response if user switched to another type
        if (latestTypeRequestRef.current !== requestId) return

        setLocalCountriesMap(fetchedCountries)

        // Get current country and area from URL
        const currentCountrySlug = searchParams?.get('country')
        const currentAreaParam = searchParams?.get('area')

        // Check if current country exists in the new type's countries
        const countryMatch = currentCountrySlug ? fetchedCountries.find(c =>
            getSlug(c.countryname) === currentCountrySlug ||
            c.id.toString() === currentCountrySlug
        ) : null

        if (countryMatch && currentAreaParam) {
            // Country exists, now check if area exists for this country in new type
            const fetchedAreas = await fetchAreas(t, countryMatch.id)

            // Ignore stale response if user switched to another type
            if (latestTypeRequestRef.current !== requestId) return

            setLocalAreasMap(fetchedAreas)

            const areaMatch = fetchedAreas.find(a =>
                getSlug(a.areaname) === currentAreaParam ||
                a.areaprefix.toString() === currentAreaParam
            )

            if (areaMatch) {
                // Both country and area exist - keep both, just clear number
                router.push(pathName + '?' + CreateQueryString('type', t, searchParams, ['number']))
            } else {
                // Country exists but area doesn't - keep country, clear area and number
                router.push(pathName + '?' + CreateQueryString('type', t, searchParams, ['area', 'number']))
            }
        } else {
            // Country doesn't exist or no area selected - clear area and number
            router.push(pathName + '?' + CreateQueryString('type', t, searchParams, ['area', 'number']))
        }
    }, [pathName, router, searchParams, fetchCountries, fetchAreas])

    const areas = localAreasMap ?
        localAreasMap.map(area => ({
            id: area.areaprefix,
            name: '(' + area.areaprefix.toString() + ') ' + area.areaname,
        })) :
        null
    const numbers = localNumbersMap ?
        localNumbersMap.filter(number => {
            // Only filter if a user is logged in
            if (!isUserLoggedIn()) {
                return true // Keep all numbers if a user is not logged in
            }

            // Check if this number exists in the cart and has a numeric DID
            const existsInCart = cart && cart.some(cartItem => {
                // Check if cartItem.did is numeric
                const isNumeric = /^\d+$/.test(cartItem.did)
                // If it's numeric and matches the current number's did, return true (this item is in the cart)
                return isNumeric && cartItem.did === number.did
            })

            // Check if this number exists in the waiting numbers and has a numeric DID
            const existsInWaitingNumbers = Array.isArray(waitingNumbers) &&
                waitingNumbers?.some(myWaitingNumber => {
                    // Check if myWaitingNumber.did is numeric
                    const isNumeric = /^\d+$/.test(myWaitingNumber.did)
                    // If it's numeric and matches the current number's did, return true (this item is in the waiting numbers)
                    return isNumeric && myWaitingNumber.did === number.did
                })

            // Return true only for numbers NOT in the cart or waiting numbers (filter those out)
            return !existsInCart && !existsInWaitingNumbers
        }) :
        null
    const getNumber: NumberInfo | null = number ?
        (numbers?.find(e => e.did == number) ?? null) :
        null

    useEffect(() => {
        if (getNumber && buyForm.current) {
            // Small delay to ensure the form is fully rendered
            setTimeout(() => {
                buyForm.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                })
            }, 100)
        }
    }, [getNumber])

    return (
        <Card id="offers"
              className="rounded-none sm:rounded-lg bg-gradient-to-br from-secondary to-background dark:bg-gradient-to-br dark:from-secondary dark:to-background
              border-none sm:border border-border p-0 pb-6 sm:pb-8 overflow-hidden w-full">
            <NumberTypeSelector options={numberTypes} onSelectAction={handleType} selectedOption={type}/>
            <div className="flex flex-col md:flex-row items-center gap-4 justify-between my-4 px-4 sm:px-6">
                <DropdownSelectGeo
                    selectId="country"
                    selectTitle={t('select_country')}
                    data={countries}
                    onSelectAction={handleCountry}
                    selectedOption={country}
                    customClass="w-full"
                    showFlags={true}
                    geoData={localCountriesMap}
                />
                <DropdownSelectGeo
                    selectId="area"
                    selectTitle={t('select_area')}
                    data={areas}
                    onSelectAction={handleArea}
                    selectedOption={area}
                    customClass="w-full"
                />
            </div>
            <div
                className="flex items-center transition-all duration-300 px-4 sm:px-6 overflow-hidden"
                style={{
                    display: (searchParams &&
                        searchParams.has('type') &&
                        searchParams.has('country') &&
                        searchParams.has('area')) ? 'block' : 'none'
                }}
            >
                <NumberOffersList
                    options={numbers}
                    onSelectAction={handleNumber}
                    selectedOption={number ?? null}
                />
            </div>
            <section ref={buyForm} id="buyForm" className="pt-1">
                <div
                    className="flex flex-col px-4 sm:px-6 transition-all duration-500 ease-in-out text-foreground dark:text-foreground"
                    style={{
                        display: (searchParams &&
                            searchParams.has('type') &&
                            searchParams.has('country') &&
                            searchParams.has('area') &&
                            searchParams.has('number')) ? 'block' : 'none'
                    }}
                >
                    <Show when={typeof getNumber !== 'undefined' && getNumber !== null}
                          fallback={<Loader height={32}/>}>
                        <div className="animate-in fade-in duration-700 ease-in-out">
                            <BuyNumberForm
                                numberInfo={getNumber!}
                                countryId={country}
                                areaCode={area}
                                countriesMap={localCountriesMap}
                                areasMap={localAreasMap}
                            />
                        </div>
                    </Show>
                </div>
            </section>
        </Card>
    )
}
