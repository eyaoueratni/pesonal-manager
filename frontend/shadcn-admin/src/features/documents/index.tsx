import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import { DocumentsProvider } from '../documents/components/documents-provider'
import { DocumentSummaryPanel } from '../documents/components/documents-summary-panel'
import { DocumentsTable } from '../documents/components/documents-table'
import { DocumentsUploadZone } from '../documents/components/documents-upload-zone'

function DocumentsContent() {
  return (
    <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>Documents</h2>
        <p className='text-muted-foreground'>
          Upload your documents and let AI extract the important information automatically.
        </p>
      </div>

      <DocumentsUploadZone />
      <DocumentsTable />
      <DocumentSummaryPanel />
    </Main>
  )
}

export function Documents() {
  return (
    <DocumentsProvider>
      <PageHeader/>

      <DocumentsContent />
    </DocumentsProvider>
  )
}