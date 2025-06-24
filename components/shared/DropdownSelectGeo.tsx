'use client'
import Loader from '@/components/service/Loader'
import {Label} from '@/components/ui/Label'
import {useEffect, useRef, useState} from 'react'
import getSlug from '@/utils/getSlug'
import {useTranslations} from 'next-intl'
import {CaretDownIcon, CheckIcon, MagnifyingGlassIcon} from '@phosphor-icons/react'

export default function DropdownSelectGeo({
                                              selectId,
                                              selectTitle = '',
                                              data,
                                              onSelectAction,
                                              selectedOption,
                                              //loading = false,
                                              customClass = '',
                                              showFlags = false,
                                              geoData
                                          }: {
    selectId: string
    selectTitle: string
    data: { id: number | string, name: string }[] | null | undefined
    onSelectAction: (value: number | string) => void
    selectedOption?: number | string | null
    //loading?: boolean
    customClass?: string
    showFlags?: boolean
    geoData?: { id: number, geo: string }[] | null
}) {
    const t = useTranslations('common')
    const [localSelectedOption, setLocalSelectedOption] = useState<number | string | null>(selectedOption || null)
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [dropdownPosition, setDropdownPosition] = useState({top: 0, left: 0, width: 0})
    const dropdownRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLDivElement>(null)
    const selectedItemRef = useRef<HTMLDivElement>(null)

    // Update local state when prop changes
    useEffect(() => {
        setLocalSelectedOption(selectedOption || null)
    }, [selectedOption])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    // Calculate the dropdown position and focus search input when the dropdown opens
    useEffect(() => {
        const updatePosition = () => {
            if (buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect()
                const windowHeight = window.innerHeight

                // Check if there's enough space below the button
                const spaceBelow = windowHeight - rect.bottom
                const dropdownHeight = 300 // Approximate max height of dropdown
                const showAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight

                // For fixed positioning, we need viewport coordinates
                setDropdownPosition({
                    top: showAbove ? rect.top - dropdownHeight : rect.bottom, // Position above or below based on available space
                    left: rect.left, // Align with the left edge of the button
                    width: rect.width
                })
            }
        }

        if (isOpen) {
            if (searchInputRef.current) {
                searchInputRef.current.focus()
            }

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

    const toggleDropdown = () => {
        setIsOpen(!isOpen)
        setSearchTerm('') // Clear search when toggling
    }

    const handleOptionSelect = (id: number | string) => {
        // Update local state immediately
        setLocalSelectedOption(id)
        setIsOpen(false)
        setSearchTerm('')

        // Delay calling the parent's handler to allow the UI to update first
        setTimeout(() => {
            onSelectAction(id)
        }, 0)
    }

    const filteredItems = data?.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const selectedItem = data?.find(item =>
        item.id === localSelectedOption ||
        (typeof localSelectedOption === 'string' && getSlug(item.name) === localSelectedOption)
    )

    // Function to get country code for an item
    const getCountryCode = (itemId: number | string): string | undefined => {
        if (!showFlags || !geoData) return undefined

        // Find the matching country in geoData
        const country = geoData.find(c => c.id === Number(itemId))
        return country?.geo
    }

    return (
        <div className={'min-w-[200px] relative ' + customClass} ref={dropdownRef} style={{position: 'relative'}}>
            <Label
                htmlFor={selectId}
                className="pl-1 mb-1 text-xs sm:text-sm tracking-wide text-muted-foreground dark:text-muted-foreground hidden">
                {selectTitle}
            </Label>

            {/* Custom select button */}
            <button
                ref={buttonRef}
                type="button"
                id={selectId}
                onClick={toggleDropdown}
                className="flex items-center justify-between rounded-md pl-3 pr-3 py-2 transition-all duration-300 ease-in-out focus:outline-none drop-shadow hover:drop-shadow-lg focus:drop-shadow-md
                cursor-pointer text-sm h-full w-full border-none
                bg-accent text-foreground focus:ring-1 focus:ring-ring disabled:text-muted-foreground disabled:bg-muted
                dark:bg-accent dark:text-foreground dark:focus:ring-ring dark:disabled:text-muted-foreground dark:disabled:bg-muted
                animate-in fade-in zoom-in-95 hover:scale-[1.01] active:scale-[0.99]"
                disabled={!data || data.length === 0}
            >
                <span className="truncate flex items-center">
                    {selectedItem && showFlags && getCountryCode(selectedItem.id) && (
                        <img 
                            src={`https://flagcdn.com/w20/${getCountryCode(selectedItem.id)?.toLowerCase()}.png`}
                            alt={`${selectedItem.name} flag`}
                            className="mr-2 h-3 w-5 inline-block"
                        />
                    )}
                    {selectedItem ? selectedItem.name : selectTitle}
                </span>
                <CaretDownIcon
                    className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    weight="bold"
                />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div
                    className="fixed z-[9999] rounded-md bg-background dark:bg-background shadow-lg border border-border max-h-[60vh] flex flex-col"
                    style={{
                        maxHeight: 'min(60vh, 300px)',
                        top: dropdownPosition.top + 'px',
                        left: dropdownPosition.left + 'px',
                        width: dropdownPosition.width + 'px',
                        maxWidth: '100vw', // Prevent overflow on small screens
                        overflowX: 'hidden', // Prevent horizontal scrolling
                        overflowY: 'auto' // Enable vertical scrolling
                    }}
                >
                    {/* Search input - only show if there are 5 or more items */}
                    {data && data.length >= 5 && (
                        <div className="p-2 border-b border-border sticky top-0 bg-background dark:bg-background z-10">
                            <div className="relative w-full">
                                <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16}/>
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder={t('search', {fallback: 'Search...'})}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-8 p-2 h-8 text-xs rounded-md border border-border bg-accent dark:bg-accent focus:outline-none focus:ring-1 focus:ring-ring"
                                />
                            </div>
                        </div>
                    )}

                    {/* Options list */}
                    <div
                        ref={listRef}
                        className="overflow-y-auto flex-1 py-1"
                        style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'hsl(var(--primary)) hsl(var(--muted))'
                        }}
                    >
                        {filteredItems && filteredItems.length > 0 ? (
                            filteredItems.map(item => {
                                const isSelected = item.id === localSelectedOption ||
                                    (typeof localSelectedOption === 'string' && getSlug(item.name) === localSelectedOption)

                                return (
                                    <div
                                        key={item.id}
                                        ref={isSelected ? selectedItemRef : null}
                                        onClick={() => handleOptionSelect(item.id)}
                                        className={`px-3 py-2 cursor-pointer flex items-center justify-between hover:bg-accent dark:hover:bg-accent ${
                                            isSelected ? 'bg-accent/50 dark:bg-accent/50' : ''
                                        }`}
                                    >
                                        <span className={`text-sm ${isSelected ? 'font-bold' : ''} flex items-center`}>
                                            {showFlags && getCountryCode(item.id) && (
                                                <img 
                                                    src={`https://flagcdn.com/w20/${getCountryCode(item.id)?.toLowerCase()}.png`}
                                                    alt={`${item.name} flag`}
                                                    className="mr-2 h-3 w-5 inline-block"
                                                />
                                            )}
                                            {item.name}
                                        </span>
                                        {isSelected && <CheckIcon className="h-4 w-4 text-foreground"/>}
                                    </div>
                                )
                            })
                        ) : (
                            <div className="px-3 py-2 text-muted-foreground">No results found</div>
                        )}
                    </div>
                </div>
            )}

            {!data && <div className="hidden"><Loader height={8}/></div>}
        </div>
    )
}
