'use client'
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useTranslations} from 'next-intl'
import {useIvrStore} from '@/stores/useIvrStore'
import DropDownSelectAudio from '@/components/shared/DropDownSelectAudio'
import LanguageSelector from '@/components/shared/LanguageSelector'
import {Ivr, IvrEffect, IvrMusic} from '@/types/IvrTypes'
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/Tooltip'
import {Checkbox} from '@/components/ui/Checkbox'
import {Button} from '@/components/ui/Button'
import {useToast} from '@/hooks/use-toast'
import {redOrderIvr} from '@/app/api/redreport/ivr'
import MyIvrList from '@/components/pages/MyIvrList'
import {calculateSpeechTiming} from '@/utils/calculateSpeechTiming'

// Grammar checker types
interface GrammarMatch {
    message: string;
    replacements: { value: string }[];
    offset: number;
    length: number;
    rule: {
        id: string;
        description: string;
        issueType: string;
    };
}

interface GrammarResult {
    matches: GrammarMatch[];
}

export default function IvrPage() {
    const t = useTranslations('dashboard')
    const [localIvr, setLocalIvr] = useState<Ivr[] | null>([])
    const [localIvrMusic, setLocalIvrMusic] = useState<IvrMusic[] | null>([])
    const [localIvrEffects, setLocalIvrEffects] = useState<IvrEffect[] | null>([])
    const [selectedIvr, setSelectedIvr] = useState<string | null>(null)
    const [selectedIvrMusic, setSelectedIvrMusic] = useState<string | null>(null)
    const [selectedIvrEffect, setSelectedIvrEffect] = useState<string | null>(null)
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
    const [ivrText, setIvrText] = useState<string>('')
    const [commentText, setCommentText] = useState<string>('')
    const [grammarMatches, setGrammarMatches] = useState<GrammarMatch[]>([])
    const [isCheckingGrammar, setIsCheckingGrammar] = useState<boolean>(false)
    const [isGrammarCheckEnabled, setIsGrammarCheckEnabled] = useState<boolean>(false)
    const [isOrdering, setIsOrdering] = useState<boolean>(false)
    // IVR orders are now handled by the MyIvrList component
    const {ivr, ivrMusic, ivrEffects, fetchIvr} = useIvrStore()
    const ivrBackgroundFetchDone = useRef(false)
    const {toast} = useToast()
    const toastT = useTranslations('toast')

    // Constants for calculations
    const COMMON_LANGUAGE_PREFIXES = useMemo(() => ['en', 'de', 'pl', 'fr', 'cz', 'ru'], [])
    const MAX_DURATION_FOR_AUTO_PRICE = 35

    // IVR orders are now handled by the MyIvrList component

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

    // IVR orders are now handled by the MyIvrList component

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
        // If empty string is passed (from "None" option), set to null
        setSelectedIvrMusic(id === '' ? null : id)
    }

    const handleIvrEffectSelect = (id: string) => {
        // If empty string is passed (from "None" option), set to null
        setSelectedIvrEffect(id === '' ? null : id)
    }

    // Debounce timer reference for real-time grammar checking
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

    // Real-time grammar checking using LanguageTool API with debounce
    // This function is called automatically after the user stops typing
    const checkGrammar = useCallback(async (text: string) => {
        console.log('checkGrammar called with text:', text.substring(0, 50) + (text.length > 50 ? '...' : ''))

        if (!text.trim()) {
            setGrammarMatches([])
            return
        }

        setIsCheckingGrammar(true)

        try {
            // Use the free LanguageTool API
            const response = await fetch('https://api.languagetool.org/v2/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    'text': text,
                    'language': 'auto', // Auto-detect language
                    'enabledOnly': 'false',
                }),
            })

            // Check if response is ok before trying to parse JSON
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`)
            }

            // Get the response text first
            const responseText = await response.text()

            // Try to parse as JSON
            try {
                const data: GrammarResult = JSON.parse(responseText)
                console.log('Grammar check results:', data.matches)
                setGrammarMatches(data.matches || [])
            } catch (parseError) {
                console.error('Failed to parse JSON response:', parseError)
                console.error('Response text:', responseText)
                setGrammarMatches([])
            }
        } catch (error) {
            console.error('Grammar check failed:', error)
            // Clear matches in case of error
            setGrammarMatches([])
        } finally {
            setIsCheckingGrammar(false)
        }
    }, [])

    // Handle text input change with real-time debounced grammar check
    // This automatically triggers grammar checking after the user stops typing for 1 second
    const handleIvrTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = e.target.value
        setIvrText(newText)

        // Clear any existing timer to reset the debounce period
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
        }

        // Only check grammar if the feature is enabled
        if (isGrammarCheckEnabled) {
            // Set a new timer to check grammar after typing stops (3 seconds delay)
            debounceTimerRef.current = setTimeout(() => {
                checkGrammar(newText).then()
            }, 3000) // 3 seconds debounce to save API requests
        } else {
            // Clear grammar matches if grammar checking is disabled
            setGrammarMatches([])
        }
    }


    // Render text with underlined grammar issues and tooltips
    const renderTextWithGrammarIssues = (text: string, matches: GrammarMatch[]) => {
        console.log('renderTextWithGrammarIssues called with matches:', matches)

        const sortedMatches = [...matches].sort((a, b) => a.offset - b.offset)
        const segments: React.ReactNode[] = []
        let lastIndex = 0

        sortedMatches.forEach((match, index) => {
            // Add text before the match
            if (match.offset > lastIndex) {
                segments.push(
                    <span key={`text-${index}`}>
                    {text.substring(lastIndex, match.offset)}
                </span>
                )
            }

            // Add the match with underline and tooltip
            const matchText = text.substring(match.offset, match.offset + match.length)
            segments.push(
                <Tooltip key={`match-${index}`}>
                    <TooltipTrigger asChild>
                    <span
                        className="border-b-2 border-red-500 cursor-help relative inline-block hover:bg-red-100 dark:hover:bg-red-900/50"
                        style={{
                            textDecoration: 'underline wavy #ef4444',
                            position: 'relative',
                            zIndex: 1,
                            pointerEvents: 'auto',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            transition: 'background-color 0.2s',
                            padding: '1px 2px',
                            margin: '0 -1px',
                            borderRadius: '2px',
                            display: 'inline-block',
                            cursor: 'help'
                        }}
                        onMouseEnter={(e) => {
                            console.log('Tooltip trigger mouse enter:', matchText)
                            e.stopPropagation()
                            // Temporarily hide the textarea to allow tooltip interaction
                            const textarea = document.getElementById('ivr-text') as HTMLTextAreaElement
                            if (textarea) {
                                textarea.style.pointerEvents = 'none'
                            }
                        }}
                        onMouseLeave={(e) => {
                            console.log('Tooltip trigger mouse leave:', matchText)
                            e.stopPropagation()
                            // Restore textarea pointer events after a delay
                            setTimeout(() => {
                                const textarea = document.getElementById('ivr-text') as HTMLTextAreaElement
                                if (textarea) {
                                    textarea.style.pointerEvents = 'auto'
                                }
                            }, 200) // Small delay to allow tooltip interaction
                        }}
                        onClick={(e) => {
                            console.log('Tooltip trigger clicked:', matchText)
                            e.preventDefault()
                            e.stopPropagation()

                            if (match.replacements && match.replacements.length > 0) {
                                applySuggestion(match, match.replacements[0].value)
                            }
                        }}
                    >
                        {matchText}
                    </span>
                    </TooltipTrigger>
                    <TooltipContent
                        side="top"
                        align="start"
                        sideOffset={5}
                        className="max-w-sm p-0 overflow-hidden"
                        style={{
                            zIndex: 9999,
                            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
                            border: '2px solid rgba(239, 68, 68, 0.5)',
                            pointerEvents: 'auto'
                        }}
                        onPointerEnter={() => {
                            // Keep textarea disabled while tooltip is open
                            const textarea = document.getElementById('ivr-text') as HTMLTextAreaElement
                            if (textarea) {
                                textarea.style.pointerEvents = 'none'
                            }
                        }}
                        onPointerLeave={() => {
                            // Re-enable textarea when leaving tooltip
                            setTimeout(() => {
                                const textarea = document.getElementById('ivr-text') as HTMLTextAreaElement
                                if (textarea) {
                                    textarea.style.pointerEvents = 'auto'
                                }
                            }, 100)
                        }}
                    >
                        <div className="flex flex-col">
                            <div className="bg-red-50 dark:bg-red-900 p-2 border-b border-red-200 dark:border-red-700">
                                <p className="text-sm font-medium text-red-600 dark:text-red-200">{match.message}</p>
                            </div>
                            <div className="p-2 bg-white dark:bg-gray-800">
                                <p className="text-xs text-gray-500 dark:text-gray-300 mb-2">{t('grammar_suggestions')}</p>
                                <div className="flex flex-wrap gap-1">
                                    {match.replacements.slice(0, 3).map((replacement, idx) => (
                                        <button
                                            key={idx}
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                applySuggestion(match, replacement.value)
                                                // Re-enable textarea after applying suggestion
                                                setTimeout(() => {
                                                    const textarea = document.getElementById('ivr-text') as HTMLTextAreaElement
                                                    if (textarea) {
                                                        textarea.style.pointerEvents = 'auto'
                                                        textarea.focus()
                                                    }
                                                }, 100)
                                            }}
                                            className="px-2 py-1 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-md text-xs text-green-800 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
                                        >
                                            {replacement.value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </TooltipContent>
                </Tooltip>
            )

            lastIndex = match.offset + match.length
        })

        // Add any remaining text
        if (lastIndex < text.length) {
            segments.push(
                <span key="text-end">
                {text.substring(lastIndex)}
            </span>
            )
        }

        return segments
    }

    // Apply a grammar suggestion
    const applySuggestion = (match: GrammarMatch, replacement: string) => {
        if (!ivrText) return

        const before = ivrText.substring(0, match.offset)
        const after = ivrText.substring(match.offset + match.length)

        const newText = before + replacement + after
        setIvrText(newText)

        // Trigger a new grammar check after applying a suggestion
        // This ensures other grammar issues remain highlighted
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
        }

        // Set a timeout to allow the text update to complete
        // No need for a long debounce here as this is a deliberate user action
        debounceTimerRef.current = setTimeout(() => {
            checkGrammar(newText).then()
        }, 300)
    }

    // Run grammar check when grammar checking is enabled
    useEffect(() => {
        if (isGrammarCheckEnabled && ivrText.trim()) {
            // Clear any existing timer
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }

            // Check grammar immediately when enabled
            // Using a function reference to avoid dependency on checkGrammar
            const checkCurrentText = async () => {
                if (!ivrText.trim()) {
                    setGrammarMatches([])
                    return
                }

                setIsCheckingGrammar(true)

                try {
                    // Use the free LanguageTool API
                    const response = await fetch('https://api.languagetool.org/v2/check', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: new URLSearchParams({
                            'text': ivrText,
                            'language': 'auto', // Auto-detect language
                            'enabledOnly': 'false',
                        }),
                    })

                    // Check if response is ok before trying to parse JSON
                    if (!response.ok) {
                        throw new Error(`API error: ${response.status}`)
                    }

                    // Get the response text first
                    const responseText = await response.text()

                    // Try to parse as JSON
                    try {
                        const data: GrammarResult = JSON.parse(responseText)
                        setGrammarMatches(data.matches || [])
                    } catch (parseError) {
                        console.error('Failed to parse JSON response:', parseError)
                        console.error('Response text:', responseText)
                        setGrammarMatches([])
                    }
                } catch (error) {
                    console.error('Grammar check failed:', error)
                    // Clear matches in case of error
                    setGrammarMatches([])
                } finally {
                    setIsCheckingGrammar(false)
                }
            }

            checkCurrentText().then()
        } else if (!isGrammarCheckEnabled) {
            // Clear grammar matches when disabled
            setGrammarMatches([])
        }
    }, [isGrammarCheckEnabled, ivrText])

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }
        }
    }, [])

    // Calculate speech timing metrics
    const {wordCount, minDurationInSeconds, optDurationInSeconds} = useMemo(() => {
        if (!ivrText.trim()) return {wordCount: 0, minDurationInSeconds: 0, optDurationInSeconds: 0}
        return calculateSpeechTiming(ivrText)
    }, [ivrText])

    // Get the selected Ivr object
    const selectedIvrObject = useMemo(() => {
        if (!selectedIvr || !localIvr) return null
        return localIvr.find(item => item.id.toString() === selectedIvr)
    }, [selectedIvr, localIvr])

    // Calculate price based on conditions
    const {price, isManualCalculation} = useMemo(() => {
        // Default values
        let calculatedPrice = 0
        let needsManualCalculation = false

        // Check if we have all required data
        if (!selectedIvrObject || !ivrText.trim()) {
            return {price: calculatedPrice, isManualCalculation: needsManualCalculation}
        }

        // Condition 1: If optimal duration > MAX_DURATION_FOR_AUTO_PRICE
        if (optDurationInSeconds > MAX_DURATION_FOR_AUTO_PRICE) {
            needsManualCalculation = true
            return {price: 0, isManualCalculation: needsManualCalculation}
        }

        // Condition 2: If IVR language starts with common prefixes
        const ivrLang = selectedIvrObject.lang.split('_')[0].toLowerCase()
        if (!COMMON_LANGUAGE_PREFIXES.some(prefix => ivrLang === prefix)) {
            needsManualCalculation = true
            return {price: 0, isManualCalculation: needsManualCalculation}
        }

        // Condition 3: Calculate price using the formula
        const hasMusic = !!selectedIvrMusic
        const hasEffect = !!selectedIvrEffect
        const musicIncrement = hasMusic || hasEffect ? selectedIvrObject.music_inc : 0

        calculatedPrice = (selectedIvrObject.price + musicIncrement) * selectedIvrObject.multiplier

        return {price: calculatedPrice, isManualCalculation: needsManualCalculation}
    }, [selectedIvrObject, ivrText, optDurationInSeconds, selectedIvrMusic, selectedIvrEffect, MAX_DURATION_FOR_AUTO_PRICE, COMMON_LANGUAGE_PREFIXES])

    // Handle comment text change
    const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCommentText(e.target.value)
    }

    // Handle order button click
    const handleOrderClick = async () => {
        // Validate required fields
        if (!selectedIvr) {
            toast({
                variant: 'destructive',
                title: toastT('validation_error_title'),
                description: t('select_ivr_voice')
            })
            return
        }

        if (!ivrText.trim()) {
            toast({
                variant: 'destructive',
                title: toastT('validation_error_title'),
                description: t('enter_ivr_text')
            })
            return
        }

        setIsOrdering(true)

        try {
            // For manual calculation cases, we send price as 0
            const response = await redOrderIvr({
                ivr: selectedIvr,
                ivr_music: selectedIvrMusic || undefined,
                ivr_effect: selectedIvrEffect || undefined,
                amount: price.toFixed(2), // Already set to "0.00" for manual calculation cases
                duration: optDurationInSeconds.toString(),
                text: ivrText,
                comment: commentText.trim() || undefined
            })

            if (!response) {
                toast({
                    variant: 'destructive',
                    title: toastT('error_title'),
                    description: toastT('ivr_order_error')
                })
                return
            }

            // Handle response based on code
            switch (response.code) {
                case 0: // Success
                    toast({
                        variant: 'default',
                        title: toastT('success_title'),
                        description: toastT('ivr_order_success')
                    })
                    break
                case 3: // Low balance
                    toast({
                        variant: 'destructive',
                        title: toastT('error_title'),
                        description: toastT('ivr_order_low_balance')
                    })
                    break
                case 4: // Manual processing
                    toast({
                        variant: 'default',
                        title: toastT('success_title'),
                        description: toastT('ivr_order_manual')
                    })
                    break
                default:
                    toast({
                        variant: 'destructive',
                        title: toastT('error_title'),
                        description: toastT('ivr_order_error')
                    })
            }
        } catch (error) {
            console.error('Error ordering IVR:', error)
            toast({
                variant: 'destructive',
                title: toastT('error_title'),
                description: toastT('ivr_order_error')
            })
        } finally {
            setIsOrdering(false)
        }
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

            {/* Text editor with word counter, duration calculator, and price display */}
            <div className="mt-4">
                <div className="flex flex-col space-y-2">
                    <label htmlFor="ivr-text" className="text-sm font-medium">
                        {t('ivr_text')}
                    </label>
                    <div className="relative">
                        {/* Container for textarea and formatted text display */}
                        <div className="relative w-full min-h-[130px] border border-gray-300 rounded-md overflow-hidden" style={{resize: 'vertical', overflow: 'auto'}}>
                            {/* Actual textarea for input */}
                            <textarea
                                id="ivr-text"
                                className="absolute inset-0 w-full h-full p-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                                style={{
                                    caretColor: 'var(--cursor-color, #ff5500)',
                                    minHeight: '130px',
                                    color: 'transparent',
                                    textShadow: '0 0 0 transparent',
                                    opacity: 1,
                                    zIndex: 10,
                                    pointerEvents: 'auto'
                                }}
                                placeholder=""
                                value={ivrText}
                                onChange={handleIvrTextChange}
                                autoFocus
                                onFocus={(e) => {
                                    const target = e.target as HTMLTextAreaElement
                                    target.style.caretColor = 'var(--cursor-color, #ff5500)'
                                    setTimeout(() => {
                                        target.focus()
                                    }, 0)
                                }}
                                onClick={(e) => {
                                    const target = e.target as HTMLTextAreaElement
                                    target.focus()
                                }}
                                onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement
                                    if (target.parentElement) {
                                        target.parentElement.style.height = `${target.scrollHeight}px`
                                    }
                                }}
                            />

                            {/* Formatted text display with underlined grammar issues */}
                            <div
                                className="absolute inset-0 p-2 whitespace-pre-wrap break-words"
                                style={{
                                    pointerEvents: 'none',
                                    zIndex: 20,
                                    position: 'absolute'
                                }}
                            >
                                <TooltipProvider delayDuration={50}>
                                    {ivrText ? (
                                        <>
                                            {grammarMatches.length > 0 ? (
                                                <>
                                                    {renderTextWithGrammarIssues(ivrText, grammarMatches)}
                                                </>
                                            ) : (
                                                <span>{ivrText}</span>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-gray-400">{t('enter_ivr_text')}</span>
                                    )}
                                </TooltipProvider>
                            </div>
                        </div>

                        {isCheckingGrammar && (
                            <div className="absolute right-2 top-2 px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm z-20">
                                {t('checking_grammar')}
                            </div>
                        )}
                    </div>

                    {/* Counters and price display */}
                    <div className="flex flex-col sm:flex-row justify-between gap-4 mt-2 text-xs">
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center">
                                <span className="font-medium mr-1">{t('word_count')}:</span>
                                <span>{wordCount}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="font-medium mr-1">{t('min_duration')}:</span>
                                <span>{minDurationInSeconds} {t('seconds')}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="font-medium mr-1">{t('opt_duration')}:</span>
                                <span>{optDurationInSeconds} {t('seconds')}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="font-medium mr-1">{t('price')}:</span>
                                {isManualCalculation ? (
                                    <span className="text-amber-600 dark:text-amber-400">{t('price_manual')}</span>
                                ) : (
                                    <span>${price}</span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center">
                            <label className="flex items-center cursor-pointer">
                                <Checkbox
                                    checked={isGrammarCheckEnabled}
                                    onCheckedChange={setIsGrammarCheckEnabled}
                                    className="mr-2"
                                />
                                <span className="ml-2">{t('grammar_check')}</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comment text area */}
            <div className="mt-4">
                <div className="flex flex-col space-y-2">
                    <label htmlFor="comment-text" className="text-sm font-medium">
                        {t('comment')}
                    </label>
                    <textarea
                        id="comment-text"
                        className="w-full min-h-[80px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical text-xs"
                        placeholder={t('enter_comment')}
                        value={commentText}
                        onChange={handleCommentChange}
                    />
                </div>
            </div>

            {/* Order button */}
            <div className="mt-2 flex justify-end">
                <Button
                    onClick={handleOrderClick}
                    disabled={isOrdering || !selectedIvr || !ivrText.trim()}
                    className="px-6 py-2"
                >
                    {isOrdering ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t('order')}...
                        </span>
                    ) : (
                        t('order')
                    )}
                </Button>
            </div>

            {/* IVR Orders Table */}
            <div className="mt-8">
                <MyIvrList 
                    localIvr={localIvr}
                    localIvrMusic={localIvrMusic}
                    localIvrEffects={localIvrEffects}
                />
            </div>
        </div>
    )
}
