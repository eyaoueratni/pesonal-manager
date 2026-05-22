import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { FinanceAddDialog } from './components/finance-add-dialog'
import {
  deleteFinanceEntry,
  getFinanceEntries,
  getFinanceSummary,
  type FinanceEntry,
  type FinanceSummary,
} from './data/finance-api'

export function Finance() {
  const [entries, setEntries] = useState<FinanceEntry[]>([])
  const [summary, setSummary] = useState<FinanceSummary>({
    total_income: 0,
    total_expenses: 0,
    balance: 0,
    currency: 'TND',
  })
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [e, s] = await Promise.all([getFinanceEntries(), getFinanceSummary()])
      setEntries(e)
      setSummary(s)
    } catch {
      toast.error('Failed to load finance data')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteFinanceEntry(id)
      setEntries((prev) => prev.filter((e) => e.id !== id))
      const updated = entries.filter((e) => e.id !== id)
      const total_income = updated.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0)
      const total_expenses = updated.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
      setSummary({ total_income, total_expenses, balance: total_income - total_expenses, currency: 'TND' })
      toast.success('Entry deleted')
    } catch {
      toast.error('Failed to delete entry')
    }
  }

  return (
    <>
      <PageHeader />
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        {/* ── Header ── */}
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Finance</h2>
            <p className='text-muted-foreground'>
              Track your income and expenses.
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className='mr-2 h-4 w-4' />
            Add Entry
          </Button>
        </div>

        {/* ── Summary Cards ── */}
        <div className='grid gap-4 sm:grid-cols-3'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>Total Income</CardTitle>
              <TrendingUp className='h-4 w-4 text-green-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                +{summary.total_income.toFixed(2)} {summary.currency}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>Total Expenses</CardTitle>
              <TrendingDown className='h-4 w-4 text-red-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-red-600'>
                -{summary.total_expenses.toFixed(2)} {summary.currency}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>Balance</CardTitle>
              <Wallet className='h-4 w-4 text-blue-500' />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {summary.balance >= 0 ? '+' : ''}{summary.balance.toFixed(2)} {summary.currency}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Entries List ── */}
        {loading ? (
          <p className='text-muted-foreground text-sm'>Loading...</p>
        ) : entries.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16 text-center'>
            <Wallet className='h-12 w-12 text-muted-foreground mb-4' />
            <p className='text-sm font-medium'>No entries yet</p>
            <p className='text-xs text-muted-foreground mt-1'>
              Add your income and expenses to track your finances.
            </p>
          </div>
        ) : (
          <div className='rounded-md border overflow-hidden'>
            <table className='w-full text-sm'>
              <thead className='bg-muted'>
                <tr>
                  <th className='p-3 text-left font-medium'>Title</th>
                  <th className='p-3 text-left font-medium'>Type</th>
                  <th className='p-3 text-left font-medium'>Amount</th>
                  <th className='p-3 text-left font-medium'>Recurring</th>
                  <th className='p-3 text-left font-medium'>Date</th>
                  <th className='p-3 text-left font-medium'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className='border-t hover:bg-muted/50'>
                    <td className='p-3 font-medium'>{entry.title}</td>
                    <td className='p-3'>
                      <Badge
                        className={
                          entry.type === 'income'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }
                      >
                        {entry.type === 'income' ? '💰 Income' : '💸 Expense'}
                      </Badge>
                    </td>
                    <td className={`p-3 font-semibold ${entry.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {entry.type === 'income' ? '+' : '-'}{entry.amount.toFixed(2)} {entry.currency}
                    </td>
                    <td className='p-3'>
                      {entry.is_recurring ? (
                        <Badge variant='outline'>{entry.recurrence}</Badge>
                      ) : (
                        <span className='text-muted-foreground'>—</span>
                      )}
                    </td>
                    <td className='p-3 text-muted-foreground'>
                      {new Date(entry.date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className='p-3'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleDelete(entry.id)}
                        className='h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Dialog ── */}
        <FinanceAddDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={fetchAll}
        />
      </Main>
    </>
  )
}