const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const getHeaders = () => {
  const authStorage = localStorage.getItem('auth-storage')
  const token = authStorage ? JSON.parse(authStorage).state?.token : null
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

export interface FinanceEntry {
  id: number
  type: 'income' | 'expense'
  title: string
  amount: number
  currency: string
  date: string
  is_recurring: boolean
  recurrence: string | null
  document_id: number | null
  user_id: number
  created_at: string
}

export interface FinanceSummary {
  total_income: number
  total_expenses: number
  balance: number
  currency: string
}

export interface FinanceCreate {
  type: 'income' | 'expense'
  title: string
  amount: number
  currency: string
  is_recurring: boolean
  recurrence?: string
}

export async function getFinanceEntries(): Promise<FinanceEntry[]> {
  const res = await fetch(`${API_URL}/finance/`, { headers: getHeaders() })
  if (!res.ok) throw new Error('Failed to fetch finance entries')
  return res.json()
}

export async function getFinanceSummary(): Promise<FinanceSummary> {
  const res = await fetch(`${API_URL}/finance/summary`, { headers: getHeaders() })
  if (!res.ok) throw new Error('Failed to fetch summary')
  return res.json()
}

export async function createFinanceEntry(data: FinanceCreate): Promise<FinanceEntry> {
  const res = await fetch(`${API_URL}/finance/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create entry')
  return res.json()
}

export async function deleteFinanceEntry(id: number): Promise<void> {
  await fetch(`${API_URL}/finance/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  })
}