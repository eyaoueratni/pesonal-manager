import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { format, parseISO } from 'date-fns'
import {
  AlertCircle,
  Bot,
  Calendar,
  DollarSign,
  File,
  FileText,
  ImageIcon,
  Info,
  Loader2,
  Send,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { chatWithDocument, extractDocument } from '../data/documents'
import { type Document } from '../data/schema'
import { useDocuments } from './documents-provider'

function FileIcon({ type }: { type: string }) {
  if (type === 'pdf') return <FileText className='size-5 text-red-500' />
  if (type === 'docx') return <File className='size-5 text-blue-500' />
  return <ImageIcon className='size-5 text-green-500' />
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    high: 'bg-red-50 text-red-600 border-red-200',
    medium: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    low: 'bg-gray-50 text-gray-500 border-gray-200',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${colors[priority] || colors.low}`}>
      {priority}
    </span>
  )
}

function ExtractedInfo({ doc }: { doc: Document }) {
  const data = doc.extracted_data

  if (!data || data.error) {
    return (
      <div className='rounded-lg bg-destructive/10 p-4 text-sm text-destructive flex items-start gap-2'>
        <AlertCircle className='size-4 mt-0.5 shrink-0' />
        <div>
          <p className='font-medium'>Extraction failed</p>
          <p className='text-xs mt-1 opacity-80'>{data?.error || 'Could not extract information from this document.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Document type + language */}
      <div className='flex items-center gap-2 flex-wrap'>
        {data.document_type && (
          <Badge variant='outline' className='text-violet-600 border-violet-200 bg-violet-50'>
            {data.document_type}
          </Badge>
        )}
        {data.language && (
          <Badge variant='outline' className='text-gray-500'>
            {data.language}
          </Badge>
        )}
      </div>

      {/* Summary */}
      {data.summary && (
        <div className='rounded-lg bg-muted/50 p-3 text-sm leading-relaxed text-muted-foreground'>
          {data.summary}
        </div>
      )}

      {/* Key highlights */}
      <div className='grid grid-cols-1 gap-2'>
        {data.deadline && (
          <div className='flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-3'>
            <Calendar className='size-4 text-orange-500 shrink-0' />
            <div>
              <p className='text-xs font-700 text-orange-600 uppercase tracking-wide'>Deadline</p>
              <p className='text-sm font-semibold text-orange-700'>{data.deadline}</p>
            </div>
          </div>
        )}
        {data.amount && (
          <div className='flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3'>
            <DollarSign className='size-4 text-green-600 shrink-0' />
            <div>
              <p className='text-xs font-700 text-green-600 uppercase tracking-wide'>Amount</p>
              <p className='text-sm font-semibold text-green-700'>{data.amount}</p>
            </div>
          </div>
        )}
        {data.action_required && data.action_required !== 'null' && (
          <div className='flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3'>
            <Info className='size-4 text-blue-500 shrink-0 mt-0.5' />
            <div>
              <p className='text-xs font-700 text-blue-600 uppercase tracking-wide'>Action required</p>
              <p className='text-sm text-blue-700'>{data.action_required}</p>
            </div>
          </div>
        )}
      </div>

      {/* Important items */}
      {data.important_items && data.important_items.length > 0 && (
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2'>
            Important information
          </p>
          <div className='space-y-2'>
            {data.important_items.map((item, i) => (
              <div key={i} className='flex items-start justify-between gap-2 rounded-md border p-2.5 text-sm'>
                <div className='flex-1'>
                  <p className='text-xs text-muted-foreground'>{item.label}</p>
                  <p className='font-medium'>{item.value}</p>
                </div>
                <PriorityBadge priority={item.priority} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ChatSection({ doc }: { doc: Document }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [isAsking, setIsAsking] = useState(false)

  const docId = `${doc.user_id}_${doc.original_filename.replace(/\s/g, '_')}`

  async function askQuestion() {
    if (!question.trim()) return
    setIsAsking(true)
    setAnswer('')
    try {
      const res = await chatWithDocument(docId, question)
      setAnswer(res.answer)
    } catch {
      setAnswer('Could not get an answer. Make sure the document was processed correctly.')
    } finally {
      setIsAsking(false)
    }
  }

  return (
    <div className='space-y-3'>
      <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5'>
        <Bot className='size-3.5' />
        Ask about this document
      </p>
      <div className='flex gap-2'>
        <Input
          placeholder='e.g. What is the payment deadline?'
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && askQuestion()}
          className='text-sm'
        />
        <Button
          size='icon'
          disabled={isAsking || !question.trim()}
          onClick={askQuestion}
          style={{ background: 'linear-gradient(135deg, #FF6B6B, #A855F7)', border: 'none' }}
        >
          {isAsking ? (
            <Loader2 className='size-4 animate-spin text-white' />
          ) : (
            <Send className='size-4 text-white' />
          )}
        </Button>
      </div>
      {answer && (
        <div className='rounded-lg bg-violet-50 border border-violet-200 p-3 text-sm text-violet-800 leading-relaxed'>
          <p className='text-xs font-semibold text-violet-500 mb-1 flex items-center gap-1'>
            <Bot className='size-3' /> AI Answer
          </p>
          {answer}
        </div>
      )}
    </div>
  )
}

export function DocumentSummaryPanel() {
  const { selectedDoc, setSelectedDoc, setDocuments } = useDocuments()
  const [isExtracting, setIsExtracting] = useState(false)

  async function handleExtract(id: number) {
    setIsExtracting(true)
    try {
      const updated = await extractDocument(id)
      setDocuments((prev: Document[]) => prev.map((d: Document) => d.id === id ? updated : d))
      setSelectedDoc(updated)
    } catch {
      // keep panel open
    } finally {
      setIsExtracting(false)
    }
  }

  return (
    <Sheet
      open={!!selectedDoc}
      onOpenChange={(v) => { if (!v) setSelectedDoc(null) }}
    >
      <SheetContent className='flex flex-col gap-4 overflow-y-auto'>
        <SheetHeader>
          <SheetTitle className='flex items-center gap-2'>
            {selectedDoc && <FileIcon type={selectedDoc.file_type} />}
            <span className='truncate'>{selectedDoc?.title}</span>
          </SheetTitle>
        </SheetHeader>

        {selectedDoc && (
          <>
            {/* Meta */}
            <div className='flex flex-wrap gap-2 text-sm text-muted-foreground'>
              <Badge variant='outline' className='uppercase'>{selectedDoc.file_type}</Badge>
              <span>Uploaded {format(parseISO(selectedDoc.created_at), 'MMM d, yyyy')}</span>
            </div>

            {/* AI Extraction section */}
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5'>
                  <Sparkles className='size-3.5 text-violet-500' />
                  AI Extraction
                </p>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={isExtracting}
                  onClick={() => handleExtract(selectedDoc.id)}
                  className='h-7 text-xs'
                >
                  {isExtracting ? (
                    <Loader2 className='mr-1.5 size-3 animate-spin' />
                  ) : (
                    <Zap className='mr-1.5 size-3 text-violet-500' />
                  )}
                  {isExtracting ? 'Extracting...' : 'Re-extract'}
                </Button>
              </div>

              <ExtractedInfo doc={selectedDoc} />
            </div>

            {/* Chat section — only if extraction was successful */}
            {selectedDoc.extracted_data && !selectedDoc.extracted_data.error && (
              <ChatSection doc={selectedDoc} />
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}