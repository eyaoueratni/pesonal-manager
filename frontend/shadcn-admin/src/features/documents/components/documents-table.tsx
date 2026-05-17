import { ConfirmDialog } from '@/components/confirm-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { format, parseISO } from 'date-fns'
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    Download,
    File,
    FileText,
    ImageIcon,
    Loader2,
    Pencil,
    Sparkles,
    Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { getDownloadUrl } from '../data/documents'
import { type Document } from '../data/schema'
import { useDocuments } from './documents-provider'

function FileIcon({ type }: { type: string }) {
  if (type === 'pdf') return <FileText className='size-4 text-red-500' />
  if (type === 'docx') return <File className='size-4 text-blue-500' />
  return <ImageIcon className='size-4 text-green-500' />
}

function SummaryBadge({ status }: { status: string }) {
  if (status === 'done') return <Badge variant='outline' className='gap-1 text-green-600 border-green-300'><CheckCircle2 className='size-3' />Summarized</Badge>
  if (status === 'processing') return <Badge variant='outline' className='gap-1 text-yellow-600 border-yellow-300'><Loader2 className='size-3 animate-spin' />Processing</Badge>
  if (status === 'failed') return <Badge variant='outline' className='gap-1 text-red-500 border-red-300'><AlertCircle className='size-3' />Failed</Badge>
  return <Badge variant='outline' className='gap-1 text-muted-foreground'><Clock className='size-3' />Pending</Badge>
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

type DocumentRowProps = {
  doc: Document
}

function DocumentRow({ doc }: DocumentRowProps) {
  const { handleDelete, handleRename, handleSummarize, setSelectedDoc } = useDocuments()
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(doc.title)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const saveRename = async () => {
    if (editTitle.trim() && editTitle !== doc.title) {
      await handleRename(doc.id, editTitle.trim())
    }
    setIsEditing(false)
  }

  return (
    <>
      <TableRow
        className='cursor-pointer hover:bg-muted/40'
        onClick={() => doc.summary_status === 'done' && setSelectedDoc(doc)}
      >
        <TableCell>
          <div className='flex items-center gap-2'>
            <FileIcon type={doc.file_type} />
            {isEditing ? (
              <Input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                onBlur={saveRename}
                onKeyDown={e => { if (e.key === 'Enter') saveRename(); if (e.key === 'Escape') setIsEditing(false) }}
                className='h-7 w-48 text-sm'
                autoFocus
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span className='font-medium'>{doc.title}</span>
            )}
          </div>
        </TableCell>
        <TableCell className='text-muted-foreground text-sm uppercase'>{doc.file_type}</TableCell>
        <TableCell className='text-muted-foreground text-sm'>{formatFileSize(doc.file_size)}</TableCell>
        <TableCell>
          <SummaryBadge status={doc.summary_status} />
        </TableCell>
        <TableCell className='text-muted-foreground text-sm'>
          {format(parseISO(doc.created_at), 'MMM d, yyyy')}
        </TableCell>
        <TableCell onClick={e => e.stopPropagation()}>
          <div className='flex items-center justify-end gap-1'>
            {/* Rename */}
            <Button variant='ghost' size='icon' className='size-7' onClick={() => setIsEditing(true)}>
              <Pencil className='size-3.5' />
            </Button>
            {/* Summarize */}
            <Button
              variant='ghost'
              size='icon'
              className='size-7'
              disabled={doc.summary_status === 'processing'}
              onClick={() => handleSummarize(doc.id)}
              title='Generate AI summary'
            >
              <Sparkles className='size-3.5 text-violet-500' />
            </Button>
            {/* Download */}
            <Button
              variant='ghost'
              size='icon'
              className='size-7'
              asChild
            >
              <a href={getDownloadUrl(doc.id)} download={doc.original_filename} onClick={e => e.stopPropagation()}>
                <Download className='size-3.5' />
              </a>
            </Button>
            {/* Delete */}
            <Button
              variant='ghost'
              size='icon'
              className='size-7 text-destructive hover:text-destructive'
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className='size-3.5' />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        handleConfirm={() => handleDelete(doc.id)}
        title='Delete Document'
        desc={<>Are you sure you want to delete <strong>{doc.title}</strong>? This cannot be undone.</>}
        confirmText='Delete'
        destructive
      />
    </>
  )
}

export function DocumentsTable() {
  const { documents, isLoading } = useDocuments()

  return (
    <div className='overflow-hidden rounded-lg border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Summary</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className='h-24 text-center text-muted-foreground'>
                Loading documents...
              </TableCell>
            </TableRow>
          ) : documents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className='h-24 text-center text-muted-foreground'>
                No documents yet. Upload your first one above.
              </TableCell>
            </TableRow>
          ) : (
            documents.map(doc => <DocumentRow key={doc.id} doc={doc} />)
          )}
        </TableBody>
      </Table>
    </div>
  )
}