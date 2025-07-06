'use client'
import {useEffect, useRef, useState} from 'react'
import {useTranslations} from 'next-intl'
import {useIvrStore} from '@/stores/useIvrStore'
import DropdownSelect from '@/components/shared/DropdownSelect'
import {Ivr, IvrEffect, IvrMusic} from '@/types/IvrTypes'

export default function IvrPage() {
    const t = useTranslations('dashboard')
    const [localIvr, setLocalIvr] = useState<Ivr[] | null>([])
    const [localIvrMusic, setLocalIvrMusic] = useState<IvrMusic[] | null>([])
    const [localIvrEffects, setLocalIvrEffects] = useState<IvrEffect[] | null>([])
    const [selectedIvr, setSelectedIvr] = useState<string | null>(null)
    const [selectedIvrMusic, setSelectedIvrMusic] = useState<string | null>(null)
    const [selectedIvrEffect, setSelectedIvrEffect] = useState<string | null>(null)
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

    // Format data for dropdown selects
    const formatIvrData = (data: Ivr[] | null) => {
        if (!data) return []
        return data.map(item => ({
            id: item.id.toString(),
            name: item.name
        }))
    }

    const formatIvrMusicData = (data: IvrMusic[] | null) => {
        if (!data) return []
        return data.map(item => ({
            id: item.id.toString(),
            name: item.name
        }))
    }

    const formatIvrEffectsData = (data: IvrEffect[] | null) => {
        if (!data) return []
        return data.map(item => ({
            id: item.id.toString(),
            name: item.name
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
            <h1 className="text-2xl font-bold">{t('ivr')}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col space-y-2">
                    <h2 className="text-lg font-semibold">{t('ivr_voice')}</h2>
                    <DropdownSelect
                        selectId="ivr-voice"
                        selectTitle={t('select_ivr_voice')}
                        data={formatIvrData(localIvr)}
                        onSelectAction={handleIvrSelect}
                        selectedOption={selectedIvr}
                        loading={!localIvr}
                        showFlags={false}
                        showLabel={true}
                    />
                    {selectedIvr && localIvr && (
                        <div className="mt-4">
                            {localIvr.find(item => item.id.toString() === selectedIvr)?.filelink && (
                                <audio 
                                    controls 
                                    src={localIvr.find(item => item.id.toString() === selectedIvr)?.filelink.url}
                                    className="w-full"
                                >
                                    Your browser does not support the audio element.
                                </audio>
                            )}
                        </div>
                    )}
                </div>
                
                <div className="flex flex-col space-y-2">
                    <h2 className="text-lg font-semibold">{t('ivr_music')}</h2>
                    <DropdownSelect
                        selectId="ivr-music"
                        selectTitle={t('select_ivr_music')}
                        data={formatIvrMusicData(localIvrMusic)}
                        onSelectAction={handleIvrMusicSelect}
                        selectedOption={selectedIvrMusic}
                        loading={!localIvrMusic}
                        showFlags={false}
                        showLabel={true}
                    />
                    {selectedIvrMusic && localIvrMusic && (
                        <div className="mt-4">
                            {localIvrMusic.find(item => item.id.toString() === selectedIvrMusic)?.filelink && (
                                <audio 
                                    controls 
                                    src={localIvrMusic.find(item => item.id.toString() === selectedIvrMusic)?.filelink.url}
                                    className="w-full"
                                >
                                    Your browser does not support the audio element.
                                </audio>
                            )}
                        </div>
                    )}
                </div>
                
                <div className="flex flex-col space-y-2">
                    <h2 className="text-lg font-semibold">{t('ivr_effects')}</h2>
                    <DropdownSelect
                        selectId="ivr-effects"
                        selectTitle={t('select_ivr_effect')}
                        data={formatIvrEffectsData(localIvrEffects)}
                        onSelectAction={handleIvrEffectSelect}
                        selectedOption={selectedIvrEffect}
                        loading={!localIvrEffects}
                        showFlags={false}
                        showLabel={true}
                    />
                    {selectedIvrEffect && localIvrEffects && (
                        <div className="mt-4">
                            {localIvrEffects.find(item => item.id.toString() === selectedIvrEffect)?.filelink && (
                                <audio 
                                    controls 
                                    src={localIvrEffects.find(item => item.id.toString() === selectedIvrEffect)?.filelink.url}
                                    className="w-full"
                                >
                                    Your browser does not support the audio element.
                                </audio>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
