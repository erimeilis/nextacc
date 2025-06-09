'use client'
import React, {useState} from 'react'
import Show from '@/components/service/Show'
import {UploadInfo} from '@/types/UploadInfo'
import Loader from '@/components/service/Loader'
import {Checkbox} from '@/components/ui/checkbox'
import {Button} from '@/components/ui/button'
import {CloudArrowUpIcon, DownloadIcon, FileIcon, MagnifyingGlassIcon, TrashIcon} from '@phosphor-icons/react'
import {useTranslations} from 'next-intl'
import {Table, TableBody, TableCell, TableRow} from '@/components/ui/table'
import {FormattedDate} from '@/components/ui/formatted-date'
import {cn} from '@/lib/utils'
import {Input} from '@/components/ui/input'
import {useClientStore} from '@/stores/useClientStore'
import {formatFileSize} from '@/utils/formatFileSize'

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

export default function UploadsList({
                                        options,
                                    }: {
    options: UploadInfo[] | null
}) {
    const t = useTranslations('dashboard')
    const [selectedUploads, setSelectedUploads] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [isUploading, setIsUploading] = useState<boolean>(false)
    const {uploadFile, deleteUpload} = useClientStore()

    // Filter uploads based on a search query
    const filteredOptions = options?.filter(option => {
        const contentType = getContentTypeFromFilename(option.filename)
        return searchQuery === '' ||
            option.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contentType.toLowerCase().includes(searchQuery.toLowerCase())
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
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setIsUploading(true)
            try {
                await uploadFile(e.target.files[0])
            } finally {
                setIsUploading(false)
                // Reset the input value so the same file can be uploaded again
                e.target.value = ''
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
        await deleteUpload(upload.filename)
    }

    // Handle deletes selected button click
    const handleDeleteSelected = async () => {
        // Delete all selected uploads one by one
        for (const filename of selectedUploads) {
            await deleteUpload(filename)
        }
        // Clear selection
        setSelectedUploads([])
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
                    <div className="flex items-center flex-1">
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
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <input
                                type="file"
                                id="file-upload"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={isUploading}
                            />
                            <Button
                                variant="default"
                                size="sm"
                                disabled={isUploading}
                                className="h-8 text-xs sm:text-sm"
                            >
                                <CloudArrowUpIcon className="mr-1" size={14}/>
                                {isUploading ? t('uploading') : t('upload_file')}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableBody>
                            {/* Header row */}
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableCell className="w-10 p-2"></TableCell>
                                <TableCell className="font-medium text-xs p-2">{t('filename')}</TableCell>
                                <TableCell className="font-medium text-xs p-2">{t('type')}</TableCell>
                                <TableCell className="font-medium text-xs p-2">{t('size')}</TableCell>
                                <TableCell className="font-medium text-xs p-2">{t('upload_date')}</TableCell>
                                <TableCell className="font-medium text-xs p-2 text-right">{t('actions')}</TableCell>
                            </TableRow>

                            {/* No results row */}
                            {filteredOptions?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        {t('no_results')}
                                    </TableCell>
                                </TableRow>
                            )}

                            {/* Upload rows */}
                            {filteredOptions?.map((upload, index) => (
                                <TableRow
                                    key={`${upload.filename}-${index}`}
                                    className={cn(
                                        'hover:bg-muted/50 transition-colors',
                                        selectedUploads.includes(upload.filename) && 'bg-muted/30'
                                    )}
                                >
                                    <TableCell className="w-10 p-2">
                                        <Checkbox
                                            checked={selectedUploads.includes(upload.filename)}
                                            onCheckedChange={(checked) => handleSelectUpload(upload.filename, checked)}
                                            aria-label={`Select ${upload.filename}`}
                                        />
                                    </TableCell>
                                    <TableCell className="p-2">
                                        <div className="flex items-center">
                                            <FileIcon className="mr-2 text-muted-foreground" size={16}/>
                                            <span className="text-sm font-medium">{upload.filename}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-2 text-xs">{getContentTypeFromFilename(upload.filename)}</TableCell>
                                    <TableCell className="p-2 text-xs">{formatFileSize(upload.size)}</TableCell>
                                    <TableCell className="p-2 text-xs">
                                        {upload.created_at ? <FormattedDate date={upload.created_at}/> : 'N/A'}
                                    </TableCell>
                                    <TableCell className="p-2 text-right">
                                        <div className="flex justify-end gap-1">
                                            {upload.url && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDownload(upload)}
                                                    className="h-7 w-7"
                                                    title={t('download')}
                                                >
                                                    <DownloadIcon size={14}/>
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(upload)}
                                                className="h-7 w-7 text-destructive"
                                                title={t('delete')}
                                            >
                                                <TrashIcon size={14}/>
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
                        >
                            {t('delete_selected')}
                        </Button>
                    )}
                </div>
            </div>
        </Show>
    )
}
