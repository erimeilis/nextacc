'use client'
import Loader from '@/components/service/Loader'
import {useEffect, useRef, useState} from 'react'
import getSlug from '@/utils/getSlug'
import {CaretDownIcon, CheckIcon, PauseIcon, PlayIcon} from '@phosphor-icons/react'
import {createPortal} from 'react-dom'
import {useTranslations} from 'next-intl'

type AudioItem = {
    id: string
    name: string
    fileUrl?: string
    geo?: string
}

export default function DropDownSelectAudio({
                                                selectId,
                                                selectTitle = '',
                                                data = [],
                                                onSelectAction,
                                                selectedOption,
                                                loading = false,
                                                customClass = '',
                                                disabled = false,
                                                required = false,
                                                showFlags = false
                                            }: {
    selectId: string
    selectTitle: string
    data: AudioItem[]
    onSelectAction: (value: string) => void
    selectedOption?: string | null
    loading?: boolean
    customClass?: string
    disabled?: boolean
    required?: boolean
    showFlags?: boolean
}) {
    const t = useTranslations('ivr')
    const [localSelectedOption, setLocalSelectedOption] = useState<string | null>(selectedOption || null)
    const [isOpen, setIsOpen] = useState(false)
    const [dropdownPosition, setDropdownPosition] = useState({top: 0, left: 0, width: 0, isMobile: false})
    const [isPlaying, setIsPlaying] = useState(false)
    const [playingItemId, setPlayingItemId] = useState<string | null>(null)
    const [currentAudioSrc, setCurrentAudioSrc] = useState<string | undefined>(undefined)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLDivElement>(null)
    const listRef = useRef<HTMLDivElement>(null)
    const selectedItemRef = useRef<HTMLDivElement>(null)
    const audioRef = useRef<HTMLAudioElement>(null)

    // Update local state when prop changes
    useEffect(() => {
        setLocalSelectedOption(selectedOption || null)
    }, [selectedOption])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Check if the click is on an option in the dropdown
            const target = event.target as HTMLElement
            const isClickOnOption = target.closest('.dropdown-option') !== null

            // Only close if not clicking on an option and not within the dropdown container
            if (!isClickOnOption && dropdownRef.current && !dropdownRef.current.contains(target)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    // Calculate the dropdown position
    useEffect(() => {
        const updatePosition = () => {
            if (buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect()

                setDropdownPosition({
                    top: rect.bottom + window.scrollY - 5, // Position closer to the button
                    left: rect.left + window.scrollX, // Align with the left edge of the button
                    width: rect.width,
                    isMobile: window.innerWidth < 768 // Track if we're on mobile
                })
            }
        }

        if (isOpen) {
            // Initial position update
            updatePosition()

            // Update position immediately after opening
            setTimeout(updatePosition, 0)

            // Update position on scroll and resize
            window.addEventListener('scroll', updatePosition, true)
            window.addEventListener('resize', updatePosition)
            // Also listen for touchmove events for mobile scrolling
            window.addEventListener('touchmove', updatePosition, {passive: true})

            return () => {
                window.removeEventListener('scroll', updatePosition, true)
                window.removeEventListener('resize', updatePosition)
                window.removeEventListener('touchmove', updatePosition)
            }
        }
    }, [isOpen])

    // Scroll selected item into view
    useEffect(() => {
        if (isOpen && selectedItemRef.current && listRef.current) {
            // Small delay to ensure the list is rendered
            setTimeout(() => {
                selectedItemRef.current?.scrollIntoView({block: 'nearest'})
            }, 100)
        }
    }, [isOpen])

    // Handle audio playback
    useEffect(() => {
        const audioElement = audioRef.current
        if (audioElement) {
            const handleEnded = () => {
                setIsPlaying(false)
                setPlayingItemId(null)
            }

            const handlePlay = () => {
                setIsPlaying(true)
            }

            const handlePause = () => {
                setIsPlaying(false)
            }

            audioElement.addEventListener('ended', handleEnded)
            audioElement.addEventListener('play', handlePlay)
            audioElement.addEventListener('pause', handlePause)

            return () => {
                audioElement.removeEventListener('ended', handleEnded)
                audioElement.removeEventListener('play', handlePlay)
                audioElement.removeEventListener('pause', handlePause)
            }
        }
    }, [])

    // Update audio source when currentAudioSrc changes
    useEffect(() => {
        if (audioRef.current && currentAudioSrc) {
            audioRef.current.src = currentAudioSrc
            audioRef.current.play().catch(error => {
                console.error('Error playing audio:', error)
                setIsPlaying(false)
                setPlayingItemId(null)
            })
        }
    }, [currentAudioSrc])

    const toggleDropdown = () => {
        if (!disabled) {
            const newIsOpen = !isOpen
            setIsOpen(newIsOpen)

            // If opening the dropdown, update position immediately
            if (newIsOpen && buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect()

                setDropdownPosition({
                    top: rect.bottom + window.scrollY - 5,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                    isMobile: window.innerWidth < 768 // Track if we're on mobile
                })
            }
        }
    }

    const handleOptionSelect = (id: string) => {
        if (!disabled) {
            // Update local state immediately
            setLocalSelectedOption(id)
            setIsOpen(false)

            // Delay calling the parent's handler to allow the UI to update first
            setTimeout(() => {
                onSelectAction(id)
            }, 0)
        }
    }

    const togglePlayPause = (e: React.MouseEvent, itemId: string, fileUrl?: string) => {
        e.stopPropagation() // Prevent dropdown from toggling

        if (!fileUrl) return

        if (audioRef.current) {
            // If already playing this item, pause it
            if (isPlaying && playingItemId === itemId) {
                audioRef.current.pause()
                setIsPlaying(false)
                setPlayingItemId(null)
            } else {
                // If playing a different item, stop it and play the new one
                if (isPlaying) {
                    audioRef.current.pause()
                }

                // Set the new audio source and play it
                setPlayingItemId(itemId)
                setCurrentAudioSrc(fileUrl)
            }
        }
    }

    // Get country code for an item
    const getCountryCode = (item: AudioItem): string | undefined => {
        if (!showFlags || !item.geo) return undefined
        return item.geo.toLowerCase()
    }

    // Find the selected item
    const selectedItem = data.find(item =>
        item.id === localSelectedOption ||
        (typeof localSelectedOption === 'string' && item.id.toLowerCase() === localSelectedOption.toLowerCase()) ||
        (typeof localSelectedOption === 'string' && getSlug(item.name) === localSelectedOption)
    )

    return (
        <div className={'flex flex-col w-full ' + customClass + (disabled ? ' bg-transparent' : '')} ref={dropdownRef}>
            <div className="relative flex-grow flex items-end">
                {/* Hidden audio element for playback */}
                <audio
                    ref={audioRef}
                    className="hidden"
                />

                {/* Custom select button - using div instead of button to avoid nesting issues */}
                <div
                    ref={buttonRef}
                    id={selectId}
                    onClick={disabled || loading ? undefined : toggleDropdown}
                    className={`flex items-center justify-between rounded-md px-3 py-2 transition-all duration-300 ease-in-out
                    focus:outline-none hover:drop-shadow-md focus:drop-shadow-md cursor-pointer text-sm h-full w-full min-w-max border-none
                    text-foreground disabled:text-muted-foreground disabled:bg-muted border-muted border-b
                    dark:text-foreground dark:disabled:text-muted-foreground dark:disabled:bg-muted animate-in fade-in zoom-in-95 
                    hover:scale-[1.01] active:scale-[0.99] ${disabled ? 'bg-transparent opacity-50 cursor-not-allowed pointer-events-none' : ''}
                    ${required && !selectedItem ? 'border-red-500' : ''}`}
                    role="button"
                    tabIndex={loading || disabled ? -1 : 0}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            if (!disabled && !loading) toggleDropdown()
                        }
                    }}
                >
                    <span className="whitespace-nowrap flex items-center">
                        {selectedItem && showFlags && selectedItem.geo && (
                            <img
                                src={`https://flagcdn.com/w20/${getCountryCode(selectedItem)}.png`}
                                alt={`${selectedItem.name} flag`}
                                className="mr-2 h-3 w-5 inline-block"
                            />
                        )}
                        {selectedItem ? selectedItem.name : selectTitle}
                    </span>
                    <div className="flex items-center">
                        {selectedItem && selectedItem.fileUrl && (
                            <div
                                onClick={(e) => {
                                    e.stopPropagation()
                                    togglePlayPause(e, selectedItem.id, selectedItem.fileUrl)
                                }}
                                className="mr-2 p-1 rounded-full hover:bg-accent transition-colors cursor-pointer"
                                role="button"
                                tabIndex={0}
                                aria-label={isPlaying && playingItemId === selectedItem.id ? 'Pause' : 'Play'}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        togglePlayPause(e as unknown as React.MouseEvent, selectedItem.id, selectedItem.fileUrl)
                                    }
                                }}
                            >
                                {isPlaying && playingItemId === selectedItem.id ? (
                                    <PauseIcon className="h-4 w-4" weight="bold"/>
                                ) : (
                                    <PlayIcon className="h-4 w-4" weight="bold"/>
                                )}
                            </div>
                        )}
                        {loading ? (
                            <Loader height={4}/>
                        ) : (
                            <CaretDownIcon
                                className={`pl-1 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                weight="bold"
                            />
                        )}
                    </div>
                </div>

                {/* Dropdown */}
                {isOpen && createPortal(
                    <div
                        className="absolute z-[99999] rounded-md bg-background dark:bg-background shadow-lg border border-border min-w-[60px] max-h-[60vh] flex flex-col"
                        style={{
                            maxHeight: 'min(60vh, 300px)',
                            top: dropdownPosition.top + 'px',
                            left: dropdownPosition.isMobile ? '50%' : dropdownPosition.left + 'px', // Center on mobile
                            transform: dropdownPosition.isMobile ? 'translateX(-50%)' : 'none', // Center on mobile
                            width: dropdownPosition.isMobile ? 'calc(100vw - 2rem)' : 'auto', // Full width on mobile with padding
                            minWidth: dropdownPosition.isMobile ? 'auto' : dropdownPosition.width + 'px', // Don't enforce min width on mobile
                            maxWidth: '100vw', // Prevent overflow on small screens
                            pointerEvents: 'auto' // Ensure clicks are captured
                        }}
                    >
                        {/* Options list */}
                        <div
                            ref={listRef}
                            className="overflow-y-auto flex-1 py-1"
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: 'hsl(var(--primary)) hsl(var(--muted))'
                            }}
                        >
                            {data && data.length > 0 ? (
                                <>
                                    {/* Add "None" option if not required */}
                                    {!required && (
                                        <div
                                            key="none-option"
                                            ref={!localSelectedOption ? selectedItemRef : null}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setLocalSelectedOption(null)
                                                setIsOpen(false)
                                                setTimeout(() => {
                                                    onSelectAction('')
                                                }, 0)
                                            }}
                                            className={`dropdown-option px-3 py-2 cursor-pointer flex items-center justify-between hover:bg-accent dark:hover:bg-accent ${
                                                !localSelectedOption ? 'bg-accent/50 dark:bg-accent/50' : ''
                                            }`}
                                        >
                                            <span className={`text-sm whitespace-nowrap ${!localSelectedOption ? 'font-bold' : ''} flex items-center`}>
                                                <span>{t('none')}</span>
                                            </span>
                                            <div className="flex items-center">
                                                {!localSelectedOption && <CheckIcon className="pl-1 h-4 w-4 text-foreground"/>}
                                            </div>
                                        </div>
                                    )}

                                    {/* Regular options */}
                                    {data.map(item => {
                                        // Use the same matching logic as for the selectedItem
                                        const isSelected =
                                            item.id === localSelectedOption ||
                                            (typeof localSelectedOption === 'string' && item.id.toLowerCase() === localSelectedOption.toLowerCase()) ||
                                            (typeof localSelectedOption === 'string' && getSlug(item.name) === localSelectedOption)

                                        return (
                                            <div
                                                key={item.id}
                                                ref={isSelected ? selectedItemRef : null}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleOptionSelect(item.id)
                                                }}
                                                className={`dropdown-option px-3 py-2 cursor-pointer flex items-center justify-between hover:bg-accent dark:hover:bg-accent ${
                                                    isSelected ? 'bg-accent/50 dark:bg-accent/50' : ''
                                                }`}
                                            >
                                                <span className={`text-sm whitespace-nowrap ${isSelected ? 'font-bold' : ''} flex items-center`}>
                                                    {showFlags && item.geo && (
                                                        <img
                                                            src={`https://flagcdn.com/w20/${getCountryCode(item)}.png`}
                                                            alt={`${item.name} flag`}
                                                            className="mr-2 h-3 w-5 inline-block"
                                                        />
                                                    )}
                                                    <span>{item.name}</span>
                                                </span>
                                                <div className="flex items-center">
                                                    {item.fileUrl && (
                                                        <div
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                togglePlayPause(e, item.id, item.fileUrl)
                                                            }}
                                                            className="mr-2 p-1 rounded-full hover:bg-accent transition-colors cursor-pointer"
                                                            role="button"
                                                            tabIndex={0}
                                                            aria-label={isPlaying && playingItemId === item.id ? 'Pause' : 'Play'}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' || e.key === ' ') {
                                                                    e.preventDefault()
                                                                    e.stopPropagation()
                                                                    togglePlayPause(e as unknown as React.MouseEvent, item.id, item.fileUrl)
                                                                }
                                                            }}
                                                        >
                                                            {isPlaying && playingItemId === item.id ? (
                                                                <PauseIcon className="h-4 w-4" weight="bold"/>
                                                            ) : (
                                                                <PlayIcon className="h-4 w-4" weight="bold"/>
                                                            )}
                                                        </div>
                                                    )}
                                                    {isSelected && <CheckIcon className="pl-1 h-4 w-4 text-foreground"/>}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </>
                            ) : (
                                <div className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                                    {data.length === 0 ? t('no_options_available') : t('no_results')}
                                </div>
                            )}
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        </div>
    )
}
