// Tailwind color classes for each category
// Using bg + text combinations that work in both light and dark mode
export const categoryColors: Record<string, string> = {
  work:       'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  personal:   'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
  health:     'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  fitness:    'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  shopping:   'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  education:  'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  other:      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

export const priorityDot: Record<string, string> = {
  important: 'bg-red-500',
  normal:    'bg-yellow-400',
  low:       'bg-green-400',
}