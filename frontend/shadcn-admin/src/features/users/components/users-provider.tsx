import useDialogState from '@/hooks/use-dialog-state';
import { adminAPI } from '@/lib/api'; // ← Changed from 'api' to 'adminAPI'
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { User } from '../data/schema';

type UsersDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface UsersContextType {
  // Dialog state
  open: UsersDialogType | null
  setOpen: (str: UsersDialogType | null) => void
  currentRow: User | null
  setCurrentRow: React.Dispatch<React.SetStateAction<User | null>>
  
  // Backend data state
  users: User[]
  loading: boolean
  error: string | null
  refetch: () => void
}

const UsersContext = React.createContext<UsersContextType | null>(null)

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<User | null>(null)
  
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  
  // Fetch users from backend
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await adminAPI.getAllUsers()  // ← Changed
      
      // Map backend data to frontend schema
      const mappedUsers = response.data.map((user: any) => ({
      
        
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.is_active ? 'active' : 'inactive',  // Map boolean to status
        createdAt: new Date(user.created_at),
      }))
      
      setUsers(mappedUsers)
    } catch (err: any) {
      console.error('Failed to fetch users:', err)
      setError('Failed to load users')
      toast.error('Failed to load users')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const value: UsersContextType = {
    open, setOpen, currentRow, setCurrentRow,
    users, loading, error, refetch: fetchUsers
  }

  return (
    <UsersContext.Provider value={value}>
      {children}
    </UsersContext.Provider>
  )
}

export const useUsers = () => {
  const usersContext = React.useContext(UsersContext)
  if (!usersContext) {
    throw new Error('useUsers has to be used within <UsersContext>')
  }
  return usersContext
}