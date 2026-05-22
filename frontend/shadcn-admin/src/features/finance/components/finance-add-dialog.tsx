import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useState } from 'react'
import { toast } from 'sonner'
import { createFinanceEntry, type FinanceCreate } from '../data/finance-api'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function FinanceAddDialog({ open, onOpenChange, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState<FinanceCreate>({
    type: 'expense',
    title: '',
    amount: 0,
    currency: 'TND',
    is_recurring: false,
    recurrence: undefined,
  })

  const handleSubmit = async () => {
    if (!form.title || form.amount <= 0) {
      toast.error('Please fill in all fields')
      return
    }
    setIsLoading(true)
    try {
      await createFinanceEntry(form)
      toast.success('Entry added successfully!')
      onSuccess()
      onOpenChange(false)
      setForm({
        type: 'expense',
        title: '',
        amount: 0,
        currency: 'TND',
        is_recurring: false,
      })
    } catch {
      toast.error('Failed to add entry')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Finance Entry</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          {/* Type */}
          <div className='space-y-1'>
            <Label>Type</Label>
            <Select
              value={form.type}
              onValueChange={(v) => setForm({ ...form, type: v as 'income' | 'expense' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='income'>💰 Income</SelectItem>
                <SelectItem value='expense'>💸 Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className='space-y-1'>
            <Label>Title</Label>
            <Input
              placeholder='e.g. Monthly Salary, STEG Bill'
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          {/* Amount + Currency */}
          <div className='flex gap-2'>
            <div className='flex-1 space-y-1'>
              <Label>Amount</Label>
              <Input
                type='number'
                placeholder='0.00'
                value={form.amount || ''}
                onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className='w-28 space-y-1'>
              <Label>Currency</Label>
              <Select
                value={form.currency}
                onValueChange={(v) => setForm({ ...form, currency: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='TND'>TND</SelectItem>
                  <SelectItem value='EUR'>EUR</SelectItem>
                  <SelectItem value='USD'>USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Recurring */}
          <div className='flex items-center justify-between rounded-lg border p-3'>
            <Label>Recurring</Label>
            <Switch
              checked={form.is_recurring}
              onCheckedChange={(v) => setForm({ ...form, is_recurring: v })}
            />
          </div>

          {form.is_recurring && (
            <div className='space-y-1'>
              <Label>Recurrence</Label>
              <Select
                value={form.recurrence || ''}
                onValueChange={(v) => setForm({ ...form, recurrence: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select frequency' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='monthly'>Monthly</SelectItem>
                  <SelectItem value='weekly'>Weekly</SelectItem>
                  <SelectItem value='yearly'>Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Entry'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}