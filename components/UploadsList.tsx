'use client'
import React, {useState} from 'react'
import Show from '@/components/service/Show'
import {UploadInfo} from '@/types/UploadInfo'
import Loader from '@/components/service/Loader'
import {Checkbox} from '@/components/ui/Checkbox'
import {Button} from '@/components/ui/Button'
import {CircleNotchIcon, DownloadIcon, FileIcon, MagnifyingGlassIcon, PenNibIcon, XIcon} from '@phosphor-icons/react'
import FileUploader from '@/components/FileUploader'
import {useTranslations} from 'next-intl'
import {Table, TableBody, TableCell, TableRow} from '@/components/ui/Table'
import {FormattedDate} from '@/components/ui/FormattedDate'
import {cn} from '@/lib/utils'
import {Input} from '@/components/ui/Input'
import {useClientStore} from '@/stores/useClientStore'
import {formatFileSize} from '@/utils/formatFileSize'
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,} from '@/components/ui/Tooltip'
import LineInput from '@/components/shared/LineInput'

// Function to get content type from filename extension
const getContentTypeFromFilename = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase() || ''

    // Map common extensions to content types
    const contentTypeMap: Record<string, string> = {
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'txt': 'text/plain',
        'csv': 'text/csv',
        'html': 'text/html',
        'htm': 'text/html',
        'zip': 'application/zip',
        'rar': 'application/x-rar-compressed',
        'mp3': 'audio/mpeg',
        'mp4': 'video/mp4',
    }

    return contentTypeMap[extension] || 'application/octet-stream'
}

// Function to check if a file is an image based on content type
const isImageFile = (filename: string): boolean => {
    const contentType = getContentTypeFromFilename(filename)
    return contentType.startsWith('image/')
}

// Function to generate a preview URL with size constraints
const getImagePreviewUrl = (url: string): string => {
    // Return the original URL as the server might not support query parameters
    return url
}

export default function UploadsList({
                                        options,
                                    }: {
    options: UploadInfo[] | null
}) {
    const t = useTranslations('dashboard')
    const [selectedUploads, setSelectedUploads] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [isUploading, setIsUploading] = useState<boolean>(false)
    const [editingFile, setEditingFile] = useState<string | null>(null)
    const [editingName, setEditingName] = useState<string>('')
    const [savingFile, setSavingFile] = useState<string | null>(null)
    const [deletingFile, setDeletingFile] = useState<string | null>(null)
    const {uploadFile, deleteUpload, renameFile} = useClientStore()

    // Filter uploads based on a search query
    const filteredOptions = options?.filter(option => {
        const contentType = getContentTypeFromFilename(option.filename)
        return searchQuery === '' ||
            option.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (option.name && option.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }) || null

    // Calculate totals
    const totalUploads = options?.length || 0
    const totalSize = options?.reduce((sum, option) => sum + option.size, 0) || 0

    // Handle checkbox selection
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedUploads(filteredOptions?.map(option => option.filename) || [])
        } else {
            setSelectedUploads([])
        }
    }

    const handleSelectUpload = (filename: string, checked: boolean) => {
        if (checked) {
            setSelectedUploads(prev => [...prev, filename])
        } else {
            setSelectedUploads(prev => prev.filter(uploadFilename => uploadFilename !== filename))
        }
    }

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    // Handle file upload
    const handleFileUpload = async (files: File[]) => {
        if (files.length > 0) {
            setIsUploading(true)
            try {
                // Upload only the first file as the current implementation only supports single file upload
                await uploadFile(files[0])
            } finally {
                setIsUploading(false)
            }
        }
    }

    // Handle download button click
    const handleDownload = (upload: UploadInfo) => {
        if (upload.url) {
            window.open(upload.url, '_blank')
        }
    }

    // Handle delete button click
    const handleDelete = async (upload: UploadInfo) => {
        setDeletingFile(upload.filename)
        try {
            await deleteUpload(upload.filename)
        } finally {
            setDeletingFile(null)
        }
    }

    // Handle deletes the selected button click
    const handleDeleteSelected = async () => {
        // Delete all selected uploads one by one
        for (const filename of selectedUploads) {
            setDeletingFile(filename)
            try {
                await deleteUpload(filename)
            } finally {
                setDeletingFile(null)
            }
        }
        // Clear selection
        setSelectedUploads([])
    }

    // Handle edit button click
    const handleEditStart = (upload: UploadInfo) => {
        setEditingFile(upload.filename)
        setEditingName(upload.name || upload.filename)
    }

    // Handle edit cancel
    const handleEditCancel = () => {
        setEditingFile(null)
        setEditingName('')
    }

    // Handle edit save
    const handleEditSave = async (filename: string) => {
        if (editingName.trim()) {
            setSavingFile(filename)
            const success = await renameFile(filename, editingName.trim())
            setSavingFile(null)
            if (success) {
                setEditingFile(null)
                setEditingName('')
            }
        }
    }

    // Handle edit input change
    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditingName(e.target.value)
    }

    // Handle edit input key press
    const handleEditKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, filename: string) => {
        if (e.key === 'Enter') {
            handleEditSave(filename).then()
        } else if (e.key === 'Escape') {
            handleEditCancel()
        }
    }

    return (
        <Show when={options !== null}
              fallback={options?.length === 0 ?
                  <div className="text-center py-8">{t('no_uploads')}</div> :
                  <Loader height={32}/>}>
            <div className="flex flex-col w-full">
                {/* Total section */}
                <div className="flex flex-col sm:flex-row justify-between py-2 px-3 bg-muted/30 border-b border-border mb-2">
                    <div className="text-xs sm:text-sm">{t('total_uploads')}: {totalUploads}</div>
                    <div className="text-xs sm:text-sm">{t('total_size')}: {formatFileSize(totalSize)}</div>
                </div>

                {/* Header with search and upload */}
                <div className="flex flex-col sm:flex-row items-center p-2 border-b border-border mb-1 gap-2">
                    {/* File uploader - first on mobile, second on desktop */}
                    <div className="flex items-center gap-2 w-full sm:w-1/2 order-1 sm:order-2">
                        <FileUploader
                            onUploadAction={handleFileUpload}
                            isUploading={isUploading}
                        />
                    </div>
                    {/* Search input - second on mobile, first on desktop */}
                    <div className="flex items-center flex-1 w-full sm:1/2 order-2 sm:order-1 mt-2 sm:mt-0">
                        <div className="relative w-full sm:max-w-xs">
                            <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16}/>
                            <Input
                                placeholder={t('search_uploads')}
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="pl-8 h-8 text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table striped className="[&_td]:py-0.5 [&_td]:px-2 [&_td]:text-xs [&_td]:sm:text-sm">
                        <TableBody>
                            {/* Header row */}
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableCell className="w-10 p-2"></TableCell>
                                <TableCell className="font-medium text-xs p-2">{t('filename')}</TableCell>
                                <TableCell className="font-medium text-xs p-2 hidden sm:table-cell">{t('type')}</TableCell>
                                <TableCell className="font-medium text-xs p-2 hidden sm:table-cell">{t('size')}</TableCell>
                                <TableCell className="font-medium text-xs p-2 hidden sm:table-cell">{t('upload_date')}</TableCell>
                                <TableCell className="font-medium text-xs p-2 text-right">{t('actions')}</TableCell>
                            </TableRow>

                            {/* No results row */}
                            {filteredOptions?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center sm:hidden">
                                        {t('no_results')}
                                    </TableCell>
                                    <TableCell colSpan={6} className="h-24 text-center hidden sm:table-cell">
                                        {t('no_results')}
                                    </TableCell>
                                </TableRow>
                            )}

                            {/* Upload rows */}
                            {filteredOptions?.map((upload, index) => (
                                <TableRow
                                    key={`${upload.filename}-${index}`}
                                    className={cn(
                                        selectedUploads.includes(upload.filename) && 'bg-muted/30'
                                    )}
                                >
                                    <TableCell className="p-2">
                                        <Checkbox
                                            checked={selectedUploads.includes(upload.filename)}
                                            onCheckedChange={(checked) => handleSelectUpload(upload.filename, checked)}
                                            aria-label={`Select ${upload.filename}`}
                                            variant="sm"
                                        />
                                    </TableCell>
                                    <TableCell className="p-2">
                                        <div className="flex items-center">
                                            {/* File icon with preview - hidden on mobile */}
                                            <div className="hidden sm:block">
                                                {isImageFile(upload.filename) && upload.url ? (
                                                    <TooltipProvider delayDuration={300}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="inline-block cursor-pointer">
                                                                    <FileIcon className="mr-2 text-muted-foreground" size={16}/>
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="right" className="p-0 overflow-hidden">
                                                                <img
                                                                    src={getImagePreviewUrl(upload.url)}
                                                                    alt={upload.filename}
                                                                    className="max-w-[600px] max-h-[600px] object-contain"
                                                                />
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                ) : (
                                                    <FileIcon className="mr-2 text-muted-foreground" size={16}/>
                                                )}
                                            </div>
                                            {editingFile === upload.filename ? (
                                                <LineInput
                                                    value={editingName}
                                                    handleAction={handleEditInputChange}
                                                    onKeyDown={(e) => handleEditKeyPress(e, upload.filename)}
                                                    onBlur={() => handleEditSave(upload.filename)}
                                                    size="xs"
                                                    autoFocus
                                                    id={upload.filename}
                                                    name={upload.filename}
                                                    type="text"/>
                                            ) : (
                                                <span
                                                    className="cursor-pointer hover:text-primary transition-colors"
                                                    onClick={() => handleEditStart(upload)}
                                                >
                                                    {upload.name && upload.name.trim() ? upload.name : upload.filename}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-2 text-xs hidden sm:table-cell">{getContentTypeFromFilename(upload.filename)}</TableCell>
                                    <TableCell className="p-2 text-xs hidden sm:table-cell">{formatFileSize(upload.size)}</TableCell>
                                    <TableCell className="p-2 text-xs hidden sm:table-cell">
                                        {upload.created_at ? <FormattedDate date={upload.created_at}/> : t('not_available')}
                                    </TableCell>
                                    <TableCell className="p-2 text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEditStart(upload)}
                                                className="h-7 w-7 hidden sm:inline-flex"
                                                title={t('edit')}
                                                disabled={savingFile === upload.filename}
                                            >
                                                {savingFile === upload.filename ? (
                                                    <CircleNotchIcon size={16} className="animate-spin"/>
                                                ) : (
                                                    <PenNibIcon size={16}/>
                                                )}
                                            </Button>
                                            {upload.url && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDownload(upload)}
                                                    className="h-7 w-7"
                                                    title={t('download')}
                                                >
                                                    <DownloadIcon size={16}/>
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(upload)}
                                                className="h-7 w-7 text-destructive"
                                                title={t('delete')}
                                                disabled={deletingFile === upload.filename}
                                            >
                                                {deletingFile === upload.filename ? (
                                                    <CircleNotchIcon size={16} className="animate-spin"/>
                                                ) : (
                                                    <XIcon size={16}/>
                                                )}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Footer with select all and delete selected */}
                <div className="flex flex-col sm:flex-row items-center justify-between p-2 border-t border-border mt-2 gap-2">
                    <div className="flex items-center">
                        <Checkbox
                            id="select-all"
                            checked={selectedUploads.length === (filteredOptions?.length || 0) && (filteredOptions?.length || 0) > 0}
                            onCheckedChange={(checked) => handleSelectAll(checked)}
                            variant="sm"
                        />
                        <label htmlFor="select-all" className="ml-2 text-xs text-muted-foreground">
                            {t('select_all')}
                        </label>
                    </div>

                    {selectedUploads.length > 0 && (
                        <Button
                            variant="link"
                            size="sm"
                            onClick={handleDeleteSelected}
                            className="text-xs text-muted-foreground p-0 h-auto"
                            disabled={deletingFile !== null}
                        >
                            {deletingFile !== null ? (
                                <span className="flex items-center">
                                    <CircleNotchIcon size={14} className="animate-spin mr-1"/>
                                    {t('deleting')}...
                                </span>
                            ) : (
                                t('delete_selected')
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </Show>
    )
}
