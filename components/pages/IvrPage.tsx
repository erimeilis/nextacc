'use client'
import {useEffect, useMemo, useRef, useState} from 'react'
import {useTranslations} from 'next-intl'
import {useIvrStore} from '@/stores/useIvrStore'
import DropDownSelectAudio from '@/components/shared/DropDownSelectAudio'
import LanguageSelector from '@/components/shared/LanguageSelector'
import {Ivr, IvrEffect, IvrMusic} from '@/types/IvrTypes'

export default function IvrPage() {
    const t = useTranslations('dashboard')
    const [localIvr, setLocalIvr] = useState<Ivr[] | null>([])
    const [localIvrMusic, setLocalIvrMusic] = useState<IvrMusic[] | null>([])
    const [localIvrEffects, setLocalIvrEffects] = useState<IvrEffect[] | null>([])
    const [selectedIvr, setSelectedIvr] = useState<string | null>(null)
    const [selectedIvrMusic, setSelectedIvrMusic] = useState<string | null>(null)
    const [selectedIvrEffect, setSelectedIvrEffect] = useState<string | null>(null)
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
    const {ivr, ivrMusic, ivrEffects, fetchIvr} = useIvrStore()
    const ivrBackgroundFetchDone = useRef(false)

    // Set data from the store immediately if available and fetch in the background if needed
    useEffect(() => {
        if (ivr) {
            setLocalIvr(ivr)
        }
        if (ivrMusic) {
            setLocalIvrMusic(ivrMusic)
        }
        if (ivrEffects) {
            setLocalIvrEffects(ivrEffects)
        }

        if (!ivr || !ivrMusic || !ivrEffects || !ivrBackgroundFetchDone.current) {
            ivrBackgroundFetchDone.current = true
            console.log('Fetching IVR data in background')
            fetchIvr()
                .then((result) => {
                    if (result) {
                        setLocalIvr(result.ivr)
                        setLocalIvrMusic(result.ivrMusic)
                        setLocalIvrEffects(result.ivrEffects)
                    }
                })
        }
    }, [ivr, ivrMusic, ivrEffects, fetchIvr])

    // Extract unique languages from ivr data
    const availableLanguages = useMemo(() => {
        if (!localIvr) return []

        // Extract unique language values
        return Array.from(new Set(localIvr.map(item => item.lang)))
    }, [localIvr])

    // Initialize selected languages with all available languages only once
    const initializedLanguagesRef = useRef(false)
    useEffect(() => {
        if (availableLanguages.length > 0 && !initializedLanguagesRef.current) {
            setSelectedLanguages(availableLanguages)
            initializedLanguagesRef.current = true
        }
    }, [availableLanguages])

    // Handle language selection change
    const handleLanguageChange = (languages: string[]) => {
        setSelectedLanguages(languages)
    }

    // Filter ivr data based on selected languages
    const filteredIvrData = useMemo(() => {
        if (!localIvr) return localIvr

        // If no languages are selected, return an empty array
        if (selectedLanguages.length === 0) return []

        return localIvr.filter(item => selectedLanguages.includes(item.lang))
    }, [localIvr, selectedLanguages])

    // Format data for dropdown selects with audio URLs
    const formatIvrDataWithAudio = (data: Ivr[] | null) => {
        if (!data) return []
        return data.map(item => ({
            id: item.id.toString(),
            name: item.name,
            fileUrl: item.filelink?.url,
            geo: item.lang.split('_')[1]?.toLowerCase() // Extract country code from lang field (e.g., 'en_US' -> 'us')
        }))
    }

    const formatIvrMusicWithAudio = (data: IvrMusic[] | null) => {
        if (!data) return []
        return data.map(item => ({
            id: item.id.toString(),
            name: item.name,
            fileUrl: item.filelink?.url
        }))
    }

    const formatIvrEffectsWithAudio = (data: IvrEffect[] | null) => {
        if (!data) return []
        return data.map(item => ({
            id: item.id.toString(),
            name: item.name,
            fileUrl: item.filelink?.url
        }))
    }

    // Handle selection changes
    const handleIvrSelect = (id: string) => {
        setSelectedIvr(id)
    }

    const handleIvrMusicSelect = (id: string) => {
        setSelectedIvrMusic(id)
    }

    const handleIvrEffectSelect = (id: string) => {
        setSelectedIvrEffect(id)
    }

    return (
        <div className="flex flex-col space-y-6">
            {/* Language selector for filtering ivr voices */}
            {availableLanguages.length > 0 && (
                <LanguageSelector
                    languages={availableLanguages}
                    onChangeAction={handleLanguageChange}
                    className="mb-2"
                />
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex flex-col space-y-2">
                    <DropDownSelectAudio
                        selectId="ivr-voice"
                        selectTitle={t('select_ivr_voice')}
                        data={formatIvrDataWithAudio(filteredIvrData)}
                        onSelectAction={handleIvrSelect}
                        selectedOption={selectedIvr}
                        loading={!localIvr}
                        required={true}
                        showFlags={true}
                    />
                </div>

                <div className="flex flex-col space-y-2">
                    <DropDownSelectAudio
                        selectId="ivr-music"
                        selectTitle={t('select_ivr_music')}
                        data={formatIvrMusicWithAudio(localIvrMusic)}
                        onSelectAction={handleIvrMusicSelect}
                        selectedOption={selectedIvrMusic}
                        loading={!localIvrMusic}
                    />
                </div>

                <div className="flex flex-col space-y-2">
                    <DropDownSelectAudio
                        selectId="ivr-effects"
                        selectTitle={t('select_ivr_effect')}
                        data={formatIvrEffectsWithAudio(localIvrEffects)}
                        onSelectAction={handleIvrEffectSelect}
                        selectedOption={selectedIvrEffect}
                        loading={!localIvrEffects}
                    />
                </div>
            </div>
        </div>
    )
}
