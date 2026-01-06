'use client'
import Loader from '@/components/ui/loading/Loader'
import {Label} from '@/components/ui/primitives/Label'
import {useEffect, useRef, useState} from 'react'
import getSlug from '@/utils/getSlug'
import {CaretDownIcon, CheckIcon, CloudArrowUpIcon} from '@phosphor-icons/react'
import {createPortal} from 'react-dom'
import {useTranslations} from 'next-intl'

export default function DropdownSelect({
                                           selectId,
                                           selectTitle = '',
                                           data = [],
                                           onSelectAction,
                                           selectedOption,
                                           loading = false,
                                           customClass = '',
                                           disabled = false,
                                           showFlags = true,
                                           showLabel = false,
                                           success = false,
                                           allowUpload = false,
                                           onFileUpload,
                                           isUploading = false
                                       }: {
    selectId: string
    selectTitle: string
    data: { id: string, name: string, alpha2?: string }[]
    onSelectAction: (value: string) => void
    selectedOption?: string | null
    loading?: boolean
    customClass?: string
    disabled?: boolean
    showFlags?: boolean
    showLabel?: boolean
    success?: boolean
    allowUpload?: boolean
    onFileUpload?: (file: File) => Promise<void>
    isUploading?: boolean
}) {
    const t = useTranslations('dashboard')
    console.log(`DropdownSelect ${selectId}:`, {data, selectedOption, loading, disabled})

    // Track previous prop value for render-time sync (React 19 pattern)
    const [prevSelectedOption, setPrevSelectedOption] = useState(selectedOption)
    const [localSelectedOption, setLocalSelectedOption] = useState<string | null>(selectedOption || null)
    const [isOpen, setIsOpen] = useState(false)
    const [dropdownPosition, setDropdownPosition] = useState({top: 0, left: 0, width: 0, isMobile: false})
    const dropdownRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const listRef = useRef<HTMLDivElement>(null)
    const selectedItemRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Sync local state with prop during render (React 19 approved pattern - no useEffect)
    if (selectedOption !== prevSelectedOption) {
        setPrevSelectedOption(selectedOption)
        setLocalSelectedOption(selectedOption || null)
    }

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
                const isMobile = window.innerWidth < 768 // Check if a device is mobile
                const isQtyDropdown = selectId.toLowerCase().includes('qty') || selectId.toLowerCase().includes('quantity')

                // For portal positioning with fixed position, we need viewport-relative coordinates
                // Use a more aggressive offset for quantity dropdowns on mobile
                const offset = isQtyDropdown && isMobile ? -20 : -5

                setDropdownPosition({
                    top: rect.bottom + window.scrollY + offset, // Position closer to the button with adjusted offset
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
    }, [isOpen, selectId])

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
        if (!disabled) {

            const newIsOpen = !isOpen
            setIsOpen(newIsOpen)

            // If opening the dropdown, update position immediately
            if (newIsOpen && buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect()
                const isMobile = window.innerWidth < 768 // Check if device is mobile
                const isQtyDropdown = selectId.toLowerCase().includes('qty') || selectId.toLowerCase().includes('quantity')

                // Use a more aggressive offset for quantity dropdowns on mobile
                const offset = isQtyDropdown && isMobile ? -20 : -5

                setDropdownPosition({
                    top: rect.bottom + window.scrollY + offset,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                    isMobile: window.innerWidth < 768 // Track if we're on mobile
                })
            }
        }
    }

    const handleOptionSelect = (id: string) => {
        if (!disabled) {
            // Check if this is the upload option
            if (id === 'upload_file' && allowUpload && onFileUpload) {
                // Trigger file input click
                fileInputRef.current?.click()
                setIsOpen(false)
                return
            }

            // Update local state immediately
            setLocalSelectedOption(id)
            setIsOpen(false)

            // Delay calling the parent's handler to allow the UI to update first
            setTimeout(() => {
                onSelectAction(id)
            }, 0)
        }
    }

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0 && onFileUpload) {
            onFileUpload(e.target.files[0]).then()
            // Reset the input value so the same file can be selected again
            e.target.value = ''
        }
    }

    // Special case for UKR (Ukraine)
    let selectedItem
    if (localSelectedOption === 'UKR' || localSelectedOption === 'ukr') {
        // Try to find Ukraine directly
        const ukraine = data.find(item =>
            item.id === 'UKR' ||
            item.id.toLowerCase() === 'ukr' ||
            item.name.toLowerCase().includes('ukraine')
        )
        if (ukraine) {
            selectedItem = ukraine
        }
    }

    // If not Ukraine or Ukraine not found, try to find an exact match
    if (!selectedItem) {
        selectedItem = data.find(item =>
            item.id === localSelectedOption ||
            (typeof localSelectedOption === 'string' && item.id.toLowerCase() === localSelectedOption.toLowerCase()) ||
            (typeof localSelectedOption === 'string' && getSlug(item.name) === localSelectedOption)
        )
    }

    // If still no match found and localSelectedOption is a string, try a more flexible approach
    if (!selectedItem && typeof localSelectedOption === 'string') {
        // Try to match by ID (case-insensitive)
        selectedItem = data.find(item =>
            item.id.toLowerCase() === localSelectedOption.toLowerCase()
        )
    }

    // Prepare data with upload option if needed
    const displayData = allowUpload ? [
        ...data,
        {id: 'upload_file', name: t('upload_file')}
    ] : data

    return (
        <div className={'flex flex-row w-full ' + customClass + (disabled ? ' bg-transparent' : '')} ref={dropdownRef}>
            {showLabel && (
                <Label
                    htmlFor={selectId}
                    className="flex text-xs sm:text-sm p-2 items-center font-light min-w-32 w-48 sm:min-w-48 sm:w-64 text-muted-foreground"
                >
                    {selectTitle}:
                </Label>
            )}

            <div className="relative flex-grow flex items-end">
                {/* Hidden file input for upload option */}
                {allowUpload && onFileUpload && (
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        accept="application/pdf,image/jpeg,image/jpg,image/gif,image/png"
                    />
                )}

                {/* Custom select button */}
                <button
                    ref={buttonRef}
                    type="button"
                    id={selectId}
                    onClick={toggleDropdown}
                    className={`flex items-center justify-between rounded-md pl-1 pr-3 py-2 transition-all duration-300 ease-in-out
                    focus:outline-none hover:drop-shadow-md focus:drop-shadow-md cursor-pointer text-sm h-full w-full min-w-max border-none
                    text-foreground disabled:text-muted-foreground disabled:bg-muted border-muted border-b
                    dark:text-foreground dark:disabled:text-muted-foreground dark:disabled:bg-muted animate-in fade-in zoom-in-95 
                    hover:scale-[1.01] active:scale-[0.99] ${disabled ? 'bg-transparent opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                    disabled={loading || disabled}
                >
                    <span className="whitespace-nowrap flex items-center">
                        {selectedItem && showFlags && selectedItem.alpha2 && (
                            <img
                                src={`https://flagcdn.com/w20/${selectedItem.alpha2.toLowerCase()}.png`}
                                alt={`${selectedItem.name} flag`}
                                className="mr-2 h-3 w-5 inline-block"
                            />
                        )}
                        {selectedItem ? selectedItem.name : selectTitle}
                    </span>
                    {isUploading ? (
                        <div className="flex items-center">
                            <Loader height={4}/>
                        </div>
                    ) : success && selectedItem ? (
                        <CheckIcon
                            className="pl-1 h-4 w-4 text-green-500"
                            weight="bold"
                        />
                    ) : (
                        <CaretDownIcon
                            className={`pl-1 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            weight="bold"
                        />
                    )}
                </button>

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
                            {displayData && displayData.length > 0 ? (
                                displayData.map(item => {
                                    // Use the same matching logic as for selectedItem
                                    const isSelected =
                                        item.id === localSelectedOption ||
                                        (typeof localSelectedOption === 'string' && item.id.toLowerCase() === localSelectedOption.toLowerCase()) ||
                                        (typeof localSelectedOption === 'string' && getSlug(item.name) === localSelectedOption)

                                    // Check if this is the upload option
                                    const isUploadOption = item.id === 'upload_file'

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
                                                {showFlags && item.alpha2 && (
                                                    <img
                                                        src={`https://flagcdn.com/w20/${item.alpha2.toLowerCase()}.png`}
                                                        alt={`${item.name} flag`}
                                                        className="mr-2 h-3 w-5 inline-block"
                                                    />
                                                )}
                                                {isUploadOption && (
                                                    <CloudArrowUpIcon className="mr-2 h-4 w-4 text-primary"/>
                                                )}
                                                <span className={isUploadOption ? 'text-primary' : ''}>{item.name}</span>
                                            </span>
                                            {isSelected && <CheckIcon className="pl-1 h-4 w-4 text-foreground"/>}
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                                    {data.length === 0 ? t('no_uploads_available') : t('no_results')}
                                </div>
                            )}
                        </div>
                    </div>,
                    document.body
                )}
            </div>

            {loading && <div className="hidden"><Loader height={8}/></div>}
        </div>
    )
}
