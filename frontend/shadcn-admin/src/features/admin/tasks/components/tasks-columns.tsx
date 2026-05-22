import { Badge } from '@/components/ui/badge'
import { type AdminTask } from '@/features/admin/data/schema'
import { type ColumnDef } from '@tanstack/react-table'

export const tasksColumns: ColumnDef<AdminTask>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => (
      <span className='font-medium'>{row.getValue('title')}</span>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => (
      <Badge variant='outline'>{row.getValue('category')}</Badge>
    ),
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => {
      const priority = row.getValue('priority') as string
      return (
        <Badge
          className={
            priority === 'important'
              ? 'bg-red-100 text-red-700'
              : priority === 'normal'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
          }
        >
          {priority}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'completed',
    header: 'Status',
    cell: ({ row }) => {
      const completed = row.getValue('completed') as boolean
      return (
        <Badge
          className={
            completed
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
          }
        >
          {completed ? 'Done' : 'Pending'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'user_id',
    header: 'User ID',
  },
  {
    accessorKey: 'start_time',
    header: 'Start',
    cell: ({ row }) => new Date(row.getValue('start_time')).toLocaleDateString(),
  },
  {
    accessorKey: 'created_at',
    header: 'Created',
    cell: ({ row }) => new Date(row.getValue('created_at')).toLocaleDateString(),
  },
]