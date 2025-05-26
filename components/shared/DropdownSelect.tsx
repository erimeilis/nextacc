'use client'
import Loader from '@/components/service/Loader'
import {Label} from '@/components/ui/label'
import {useEffect, useRef, useState} from 'react'
import getSlug from '@/utils/getSlug'
import {CaretDownIcon, CheckIcon} from '@phosphor-icons/react'
import {createPortal} from 'react-dom'

export default function DropdownSelect({
                                           selectId,
                                           selectTitle = '',
                                           data = [],
                                           onSelectAction,
                                           selectedOption,
                                           loading = false,
                                           customClass = ''
                                       }: {
    selectId: string
    selectTitle: string
    data: { id: string, name: string }[]
    onSelectAction: (value: string) => void
    selectedOption?: string | null
    loading?: boolean
    customClass?: string
}) {
    const [localSelectedOption, setLocalSelectedOption] = useState<string | null>(selectedOption || null)
    const [isOpen, setIsOpen] = useState(false)
    const [dropdownPosition, setDropdownPosition] = useState({top: 0, left: 0, width: 0})
    const dropdownRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const listRef = useRef<HTMLDivElement>(null)
    const selectedItemRef = useRef<HTMLDivElement>(null)

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
                const isMobile = window.innerWidth < 768 // Check if device is mobile
                const isQtyDropdown = selectId.toLowerCase().includes('qty') || selectId.toLowerCase().includes('quantity')

                // For portal positioning with fixed position, we need viewport-relative coordinates
                // Use a more aggressive offset for quantity dropdowns on mobile
                const offset = isQtyDropdown && isMobile ? -20 : -5

                setDropdownPosition({
                    top: rect.bottom + window.scrollY + offset, // Position closer to the button with adjusted offset
                    left: rect.left + window.scrollX, // Align with the left edge of the button
                    width: rect.width
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
                width: rect.width
            })
        }
    }

    const handleOptionSelect = (id: string) => {
        console.log('handleOptionSelect called with id:', id)
        // Update local state immediately
        setLocalSelectedOption(id)
        setIsOpen(false)

        // Delay calling the parent's handler to allow the UI to update first
        setTimeout(() => {
            console.log('Calling onSelectAction with id:', id)
            onSelectAction(id)
        }, 0)
    }

    const selectedItem = data.find(item =>
        item.id === localSelectedOption ||
        (typeof localSelectedOption === 'string' && getSlug(item.name) === localSelectedOption)
    )

    return (
        <div className={'min-w-[200px] relative ' + customClass} ref={dropdownRef} style={{position: 'relative'}}>
            <Label
                htmlFor={selectId}
                className="pl-1 text-xs sm:text-sm tracking-wide text-muted-foreground dark:text-muted-foreground hidden">
                {selectTitle}
            </Label>

            {/* Custom select button */}
            <button
                ref={buttonRef}
                type="button"
                id={selectId}
                onClick={toggleDropdown}
                className="flex items-center justify-between rounded-md pl-1 pr-3 py-2 transition-all duration-300 ease-in-out
                focus:outline-none hover:drop-shadow-md focus:drop-shadow-md cursor-pointer text-sm h-full w-full border-none
                text-foreground disabled:text-muted-foreground disabled:bg-muted border-muted border-b
                dark:text-foreground dark:disabled:text-muted-foreground dark:disabled:bg-muted
                animate-in fade-in zoom-in-95 hover:scale-[1.01] active:scale-[0.99]"
                disabled={data.length === 0 || loading}
            >
                <span className="truncate">
                    {selectedItem ? selectedItem.name : selectTitle}
                </span>
                <CaretDownIcon
                    className={`pl-1 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    weight="bold"
                />
            </button>

            {/* Dropdown */}
            {isOpen && createPortal(
                <div
                    className="absolute z-[99999] rounded-md bg-background dark:bg-background shadow-lg border border-border min-w-[60px] max-h-[60vh] flex flex-col"
                    style={{
                        maxHeight: 'min(60vh, 300px)',
                        top: dropdownPosition.top + 'px',
                        left: dropdownPosition.left + 'px',
                        width: dropdownPosition.width + 'px',
                        maxWidth: '100vw', // Prevent overflow on small screens
                        overflowX: 'hidden', // Prevent horizontal scrolling
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
                            data.map(item => {
                                const isSelected = item.id === localSelectedOption ||
                                    (typeof localSelectedOption === 'string' && getSlug(item.name) === localSelectedOption)

                                return (
                                    <div
                                        key={item.id}
                                        ref={isSelected ? selectedItemRef : null}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            console.log('Option clicked:', item.id)
                                            handleOptionSelect(item.id)
                                        }}
                                        className={`dropdown-option px-3 py-2 cursor-pointer flex items-center justify-between hover:bg-accent dark:hover:bg-accent ${
                                            isSelected ? 'bg-accent/50 dark:bg-accent/50' : ''
                                        }`}
                                    >
                                        <span className={`text-sm ${isSelected ? 'font-bold' : ''}`}>{item.name}</span>
                                        {isSelected && <CheckIcon className="pl-1 h-4 w-4 text-foreground"/>}
                                    </div>
                                )
                            })
                        ) : (
                            <div className="px-3 py-2 text-muted-foreground">No results found</div>
                        )}
                    </div>
                </div>,
                document.body
            )}

            {loading && <div className="hidden"><Loader height={8}/></div>}
        </div>
    )
}
