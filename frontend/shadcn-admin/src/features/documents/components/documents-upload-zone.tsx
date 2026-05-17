import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { File, FileText, ImageIcon, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { useDocuments } from './documents-provider'

const ACCEPTED = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
}

const ACCEPTED_TYPES = Object.keys(ACCEPTED).join(',')

function FileTypeIcon({ type }: { type: string }) {
  if (type === 'pdf') return <FileText className='size-5 text-red-500' />
  if (type === 'docx') return <File className='size-5 text-blue-500' />
  return <ImageIcon className='size-5 text-green-500' />
}

export function DocumentsUploadZone() {
  const { handleUpload, isUploading } = useDocuments()
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = (file: File) => {
    if (!Object.keys(ACCEPTED).includes(file.type)) {
      return
    }
    handleUpload(file)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition-colors',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-muted/40',
        isUploading && 'pointer-events-none opacity-60'
      )}
    >
      <input
        ref={inputRef}
        type='file'
        accept={ACCEPTED_TYPES}
        className='hidden'
        onChange={onInputChange}
      />

      <div className='flex size-14 items-center justify-center rounded-full bg-muted'>
        <Upload className='size-6 text-muted-foreground' />
      </div>

      <div className='text-center'>
        <p className='font-medium'>
          {isUploading ? 'Uploading...' : 'Drop a file here or click to upload'}
        </p>
        <p className='mt-1 text-sm text-muted-foreground'>
          Supports PDF, Word (.docx), JPG, PNG — max 20MB
        </p>
      </div>

      <div className='flex gap-3 text-xs text-muted-foreground'>
        <span className='flex items-center gap-1'><FileText className='size-3.5 text-red-500' /> PDF</span>
        <span className='flex items-center gap-1'><File className='size-3.5 text-blue-500' /> DOCX</span>
        <span className='flex items-center gap-1'><ImageIcon className='size-3.5 text-green-500' /> Image</span>
      </div>

      <Button variant='outline' size='sm' disabled={isUploading} onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}>
        Browse files
      </Button>
    </div>
  )
}