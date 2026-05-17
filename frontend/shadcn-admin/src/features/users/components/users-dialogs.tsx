import { UsersActionDialog } from './users-action-dialog'
import { UsersDeleteDialog } from './users-delete-dialog'
import { useUsers } from './users-provider'

export function UsersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useUsers()

  return (
    <>
      {/* ✅ Add User */}
      <UsersActionDialog
        key='user-add'
        open={open === 'add'}
        onOpenChange={(state) => {
          if (!state) setOpen(null)  // ✅ close when state is false
        }}
      />

      {currentRow && (
        <>
          {/* ✅ Edit User */}
          <UsersActionDialog
            key={`user-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={(state) => {
              if (!state) {
                setOpen(null)        // ✅ close dialog
                setTimeout(() => setCurrentRow(null), 500)
              }
            }}
            currentRow={currentRow}
          />

          {/* ✅ Delete User */}
          <UsersDeleteDialog
            key={`user-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={(state) => {
              if (!state) {
                setOpen(null)        // ✅ close dialog
                setTimeout(() => setCurrentRow(null), 500)
              }
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}