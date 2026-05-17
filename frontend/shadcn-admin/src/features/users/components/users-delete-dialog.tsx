'use client'

import { ConfirmDialog } from '@/components/confirm-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { adminAPI } from '@/lib/api'
import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { type User } from '../data/schema'
import { useUsers } from './users-provider'

type UserDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function UsersDeleteDialog({ open, onOpenChange, currentRow }: UserDeleteDialogProps) {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const { refetch } = useUsers()

  const handleDelete = async () => {
    if (value.trim() !== currentRow.username) return
    try {
      setLoading(true)
      await adminAPI.deleteUser(currentRow.id)  // ✅ real API call
      toast.success(`User "${currentRow.username}" deleted`)
      refetch()
      onOpenChange(false)
      setValue('')
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to delete user'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.username || loading}
      title={
        <span className='text-destructive'>
          <AlertTriangle className='me-1 inline-block stroke-destructive' size={18} />
          Delete User
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p>
            Are you sure you want to delete{' '}
            <span className='font-bold'>{currentRow.username}</span>?
            <br />
            This will permanently remove the{' '}
            <span className='font-bold'>{currentRow.role.toUpperCase()}</span> account.
            This cannot be undone.
          </p>
          <Label>
            Type username to confirm:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter username to confirm deletion.'
            />
          </Label>
          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>This operation cannot be rolled back.</AlertDescription>
          </Alert>
        </div>
      }
      confirmText={loading ? 'Deleting...' : 'Delete'}
      destructive
    />
  )
}