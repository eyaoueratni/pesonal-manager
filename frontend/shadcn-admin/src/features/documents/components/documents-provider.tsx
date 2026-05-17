import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  deleteDocument,
  extractDocument,
  getDocuments,
  updateDocument,
  uploadDocument,
} from '../data/documents'
import { type Document } from '../data/schema'

type DocumentsContextType = {
  documents: Document[]
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>
  isLoading: boolean
  isUploading: boolean
  refetch: () => Promise<void>
  handleUpload: (file: File) => Promise<void>
  handleDelete: (id: number) => Promise<void>
  handleRename: (id: number, title: string) => Promise<void>
  handleSummarize: (id: number) => Promise<void>
  selectedDoc: Document | null
  setSelectedDoc: (doc: Document | null) => void
}

const DocumentsContext = createContext<DocumentsContextType | null>(null)

export function DocumentsProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getDocuments()
      setDocuments(data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load documents')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true)
      const doc = await uploadDocument(file)
      setDocuments(prev => [doc, ...prev])
      toast.success(`"${doc.title}" uploaded and processed!`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteDocument(id)
      setDocuments(prev => prev.filter(d => d.id !== id))
      if (selectedDoc?.id === id) setSelectedDoc(null)
      toast.success('Document deleted.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  const handleRename = async (id: number, title: string) => {
    try {
      const updated = await updateDocument(id, title)
      setDocuments(prev => prev.map(d => d.id === id ? updated : d))
      if (selectedDoc?.id === id) setSelectedDoc(updated)
      toast.success('Document renamed.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to rename')
    }
  }

  const handleSummarize = async (id: number) => {
    setDocuments(prev =>
      prev.map(d => d.id === id ? { ...d, summary_status: 'processing' } : d)
    )
    toast.info('Running AI extraction...')
    try {
      const updated = await extractDocument(id)
      setDocuments(prev => prev.map(d => d.id === id ? updated : d))
      if (selectedDoc?.id === id) setSelectedDoc(updated)
      toast.success('Extraction complete!')
    } catch (err) {
      setDocuments(prev =>
        prev.map(d => d.id === id ? { ...d, summary_status: 'failed' } : d)
      )
      toast.error(err instanceof Error ? err.message : 'Extraction failed')
    }
  }

  return (
    <DocumentsContext
      value={{
        documents, setDocuments,
        isLoading, isUploading,
        refetch,
        handleUpload, handleDelete, handleRename, handleSummarize,
        selectedDoc, setSelectedDoc,
      }}
    >
      {children}
    </DocumentsContext>
  )
}

export const useDocuments = () => {
  const ctx = useContext(DocumentsContext)
  if (!ctx) throw new Error('useDocuments must be used within <DocumentsProvider>')
  return ctx
}