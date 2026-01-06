'use client'
import {useEffect, useState} from 'react'
import {useTranslations} from 'next-intl'

type LanguageSelectorProps = {
    languages: string[]
    onChangeAction: (selectedLanguages: string[]) => void
    className?: string
}

export default function LanguageSelector({
                                             languages,
                                             onChangeAction,
                                             className = '',
                                         }: LanguageSelectorProps) {
    const t = useTranslations('ivr')
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>(languages)
    const [allSelected, setAllSelected] = useState(true)

    // Track previous languages for render-time sync (React 19 pattern)
    const [prevLanguages, setPrevLanguages] = useState(languages)

    // Reset selection when languages prop changes (React 19 approved pattern - no useEffect)
    if (languages !== prevLanguages) {
        setPrevLanguages(languages)
        if (languages.length > 0) {
            setSelectedLanguages([...languages])
            setAllSelected(true)
        }
    }

    // Notify parent component when selection changes
    useEffect(() => {
        onChangeAction(selectedLanguages)
    }, [selectedLanguages, onChangeAction])


    const toggleLanguage = (lang: string) => {
        setSelectedLanguages(prev => {
            let newSelectedLanguages
            // If language is already selected, remove it
            if (prev.includes(lang)) {
                newSelectedLanguages = prev.filter(l => l !== lang)
                // When unselecting a language, the "All" button should also be unselected
                setAllSelected(false)
                return newSelectedLanguages
            }
            // Otherwise add it
            newSelectedLanguages = [...prev, lang]
            // If all languages are now selected, set allSelected to true
            if (newSelectedLanguages.length === languages.length) {
                setAllSelected(true)
            }
            return newSelectedLanguages
        })
    }

    const toggleAll = () => {
        // Toggle the allSelected state
        const newAllSelected = !allSelected

        // Update the selectedLanguages based on the new allSelected state
        if (newAllSelected) {
            // If all should be selected, select all languages
            setSelectedLanguages([...languages])
        } else {
            // If all should be unselected, unselect all languages
            setSelectedLanguages([])
        }

        // Update the allSelected state
        setAllSelected(newAllSelected)
    }

    // Get ISO2 code from language string (assuming format like 'en_EN', 'de_DE', etc.)
    const getISO2Code = (lang: string): string => {
        // Special case for Serbian
        if (lang === 'sr_SP') {
            return 'rs'
        }
        // If the language code contains an underscore, take the second part
        if (lang.includes('_')) {
            return lang.split('_')[1].toLowerCase()
        }
        // If the language code contains a hyphen, take the second part
        if (lang.includes('-')) {
            return lang.split('-')[1].toLowerCase()
        }
        // Otherwise just return the language code
        return lang.toLowerCase()
    }

    // Get a language display name using Intl.DisplayNames API for all world languages
    const getLanguageDisplayName = (lang: string): string => {
        // Extract the language code part (first part before underscore or hyphen)
        let langCode = lang
        if (lang.includes('_')) {
            langCode = lang.split('_')[0]
        } else if (lang.includes('-')) {
            langCode = lang.split('-')[0]
        }

        // Get the current locale from the translations
        const currentLocale = t('locale') || 'en';

        // Check if we're in a browser environment and Intl.DisplayNames is available
        if (typeof window !== 'undefined' && 'Intl' in window && 'DisplayNames' in Intl) {
            try {
                // Use Intl.DisplayNames to get the localized language name in the current locale
                // This will automatically provide names for all world languages
                const displayNames = new Intl.DisplayNames(currentLocale, { type: 'language' });
                return displayNames.of(langCode) || langCode;
            } catch (error) {
                console.error('Error getting language display name:', error);
            }
        }

        // Fallback to using the language code itself
        return langCode;
    }

    if (languages.length === 0) return null

    return (
        <div className={`flex flex-wrap gap-2 mb-4 ${className}`}>
            {/* All checkbox */}
            <button
                type="button"
                onClick={toggleAll}
                className={`flex items-center px-3 py-1.5 rounded-md border transition-colors
          ${allSelected
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-background border-muted text-muted-foreground'
                }
          hover:bg-primary/5 hover:border-primary/20`}
                title={t('select_deselect_all')}
            >
                <span className="text-xs font-medium">{t('all')}</span>
            </button>

            {languages.map(lang => {
                const iso2Code = getISO2Code(lang)
                const isSelected = selectedLanguages.includes(lang)

                // Get the last 2 characters of the language code for display
                const displayCode = lang.includes('_')
                    ? lang.split('_')[1].slice(-2)
                    : lang.includes('-')
                        ? lang.split('-')[1].slice(-2)
                        : lang.slice(-2)

                return (
                    <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={`flex items-center px-3 py-1.5 rounded-md border transition-colors
              ${isSelected
                            ? 'bg-primary/10 border-primary/30 text-primary'
                            : 'bg-background border-muted text-muted-foreground'
                        }
              hover:bg-primary/5 hover:border-primary/20`}
                        title={getLanguageDisplayName(lang)}
                    >
                        <img
                            src={`https://flagcdn.com/w20/${iso2Code}.png`}
                            alt={`${getLanguageDisplayName(lang)} flag`}
                            className={`mr-2 h-3 w-5 inline-block ${!isSelected ? 'filter grayscale opacity-70' : ''}`}
                        />
                        <span className="text-xs font-medium">{displayCode.toUpperCase()}</span>
                    </button>
                )
            })}
        </div>
    )
}
