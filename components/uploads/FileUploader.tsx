'use client'
import React, {useCallback, useRef, useState} from 'react'
import ActionButton from '@/components/forms/ActionButton'
import {CloudArrowUpIcon} from '@phosphor-icons/react'
import {useTranslations} from 'next-intl'
import {cn} from '@/lib/utils'

// Define allowed file types and max size
const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/png'
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_TOTAL_SIZE = 50 * 1024 * 1024 // 50MB

interface FileUploaderProps {
    onUploadAction: (files: File[]) => Promise<void>
    isUploading: boolean
}

export default function FileUploader({onUploadAction, isUploading}: FileUploaderProps) {
    const t = useTranslations('dashboard')
    const [isDragging, setIsDragging] = useState(false)
    const [fileErrors, setFileErrors] = useState<string[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Validate files - wrapped in useCallback to prevent re-creation on every render
    const validateFiles = useCallback((files: File[]): { valid: File[], errors: string[] } => {
        const errors: string[] = []
        const validFiles: File[] = []
        let totalSize = 0

        Array.from(files).forEach(file => {
            // Check a file type
            if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                errors.push(`${file.name}: ${t('file_type_not_allowed')}`)
                return
            }

            // Check file size
            if (file.size > MAX_FILE_SIZE) {
                errors.push(`${file.name}: ${t('file_too_large')}`)
                return
            }

            totalSize += file.size
            validFiles.push(file)
        })

        // Check total size
        if (totalSize > MAX_TOTAL_SIZE) {
            errors.push(t('total_size_exceeded'))
            return {valid: [], errors}
        }

        return {valid: validFiles, errors}
    }, [t])

    // Handle file selection from input
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files)
            // Reset the input value so the same files can be selected again
            e.target.value = ''
        }
    }

    // Process files (React Compiler handles memoization automatically)
    const handleFiles = (fileList: FileList) => {
        const {valid, errors} = validateFiles(Array.from(fileList))
        setFileErrors(errors)

        if (valid.length > 0) {
            onUploadAction(valid).then()
        }
    }

    // Handle file drop (React Compiler handles memoization automatically)
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files)
        }
    }

    // Handle drag events
    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    // Handle button click
    const handleButtonClick = () => {
        fileInputRef.current?.click()
    }

    return (
        <div className="w-full">
            {/* Main container - horizontal layout */}
            <div className="flex items-center gap-2">
                {/* Drop zone - left side */}
                <div
                    className={cn(
                        'flex-1 border-2 border-dotted rounded-md p-3 cursor-pointer transition-colors relative overflow-hidden min-h-[70px]',
                        isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/40 hover:border-muted-foreground/60',
                        isUploading && 'opacity-50 cursor-not-allowed'
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleButtonClick}
                >
                    <div className="absolute inset-0 -mt-14 flex justify-end pointer-events-none"
                         style={{transform: 'rotate(30deg)'}}>
                        <CloudArrowUpIcon weight="fill" className="text-muted-foreground/40 opacity-30" size={160}/>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={isUploading}
                    />

                    <div className="flex flex-col items-center justify-center py-3 w-full">
                        <p className="text-sm font-medium text-foreground">
                            {isDragging ? t('drop_files_here') : t('drag_drop_files')}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {t('max_file_size')}: 10MB
                        </p>
                    </div>
                </div>

                {/* Button - right side */}
                <ActionButton
                    disabled={isUploading}
                    className="text-xs sm:text-sm whitespace-nowrap"
                    type="button"
                    style="pillow"
                    onClick={handleButtonClick}
                    loading={isUploading}
                >
                    {t('select_files')}
                </ActionButton>
            </div>

            {/* Error messages */}
            {fileErrors.length > 0 && (
                <div className="mt-2 text-destructive text-xs">
                    <p className="font-medium">{t('upload_errors')}:</p>
                    <ul className="list-disc pl-4 mt-1">
                        {fileErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
