import { type Task } from '@/features/tasks/data/schema'
import { cn } from '@/lib/utils'
import {
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    isSameDay,
    isSameMonth,
    isToday,
    parseISO,
    startOfMonth,
    startOfWeek,
} from 'date-fns'
import { Plus } from 'lucide-react'
import { categoryColors } from '../data/calendar-data'
import { useCalendar } from './calendar-provider'

type MonthViewProps = {
  currentDate: Date
  tasks: Task[]
}

export function MonthView({ currentDate, tasks }: MonthViewProps) {
  const { setSelectedTask, setIsDrawerOpen, setIsCreating, setNewTaskDate } = useCalendar()

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const getTasksForDay = (day: Date) =>
    tasks.filter(t => {
      try { return isSameDay(parseISO(t.start_time), day) } catch { return false }
    })

  const handleDayClick = (day: Date) => {
    setNewTaskDate(day)
    setIsCreating(true)
    setIsDrawerOpen(true)
  }

  const handleTaskClick = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation()
    setSelectedTask(task)
    setIsCreating(false)
    setIsDrawerOpen(true)
  }

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className='flex flex-1 flex-col overflow-hidden rounded-lg border'>
      {/* Week day headers */}
      <div className='grid grid-cols-7 border-b bg-muted/30'>
        {weekDays.map(d => (
          <div key={d} className='py-2 text-center text-xs font-medium text-muted-foreground'>
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className='grid flex-1 grid-cols-7 grid-rows-6 overflow-hidden'>
        {days.map(day => {
          const dayTasks = getTasksForDay(day)
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isDayToday = isToday(day)

          return (
            <div
              key={day.toISOString()}
              onClick={() => handleDayClick(day)}
              className={cn(
                'group relative flex flex-col gap-1 border-b border-r p-1 cursor-pointer transition-colors',
                'hover:bg-muted/40',
                !isCurrentMonth && 'opacity-40'
              )}
            >
              {/* Day number */}
              <div className='flex items-center justify-between px-1'>
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                    isDayToday && 'bg-primary text-primary-foreground',
                    !isDayToday && 'text-foreground'
                  )}
                >
                  {format(day, 'd')}
                </span>
                <Plus className='size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity' />
              </div>

              {/* Tasks */}
              <div className='flex flex-col gap-0.5 overflow-hidden'>
                {dayTasks.slice(0, 3).map(task => (
                  <button
                    key={task.id}
                    onClick={(e) => handleTaskClick(e, task)}
                    className={cn(
                      'truncate rounded px-1.5 py-0.5 text-left text-xs font-medium transition-opacity hover:opacity-80',
                      categoryColors[task.category] ?? 'bg-primary/20 text-primary',
                      task.completed && 'opacity-50 line-through'
                    )}
                  >
                    {task.title}
                  </button>
                ))}
                {dayTasks.length > 3 && (
                  <span className='px-1.5 text-xs text-muted-foreground'>
                    +{dayTasks.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}