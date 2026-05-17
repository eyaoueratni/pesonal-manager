import { ConfirmDialog } from '@/components/confirm-dialog'
import { toast } from 'sonner'
import { deleteTask } from '../data/tasks'
import { TasksMutateDrawer } from './tasks-mutate-drawer'
import { useTasks } from './tasks-provider'

export function TasksDialogs() {
  const { open, setOpen, currentRow, setCurrentRow, refetch } = useTasks()

  const handleDelete = async () => {
    if (!currentRow) return
    try {
      await deleteTask(currentRow.id)
      await refetch()
      toast.success('Task deleted successfully.')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete task'
      toast.error(message)
    } finally {
      setOpen(null)
      setCurrentRow(null)
    }
  }

  return (
    <>
      {/* Create drawer */}
      <TasksMutateDrawer
        open={open === 'create'}
        onOpenChange={(v) => {
          if (!v) setOpen(null)
        }}
      />

      {/* Update drawer */}
      {currentRow && (
        <TasksMutateDrawer
          open={open === 'update'}
          onOpenChange={(v) => {
            if (!v) {
              setOpen(null)
              setCurrentRow(null)
            }
          }}
          currentRow={currentRow}
        />
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={open === 'delete'}
        onOpenChange={(v) => {
          if (!v) {
            setOpen(null)
            setCurrentRow(null)
          }
        }}
        handleConfirm={handleDelete}
        title='Delete Task'
        desc={
          <>
            Are you sure you want to delete{' '}
            <strong>{currentRow?.title ?? 'this task'}</strong>? This action
            cannot be undone.
          </>
        }
        confirmText='Delete'
        destructive
      />
    </>
  )
}