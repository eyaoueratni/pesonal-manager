import { type Task } from '@/features/tasks/data/schema'
import { cn } from '@/lib/utils'
import {
    addMinutes,
    differenceInMinutes,
    format,
    isSameDay,
    isToday,
    parseISO,
    startOfDay,
} from 'date-fns'
import { categoryColors } from '../data/calendar-data'
import { useCalendar } from './calendar-provider'

const HOUR_HEIGHT = 80
const TOTAL_HOURS = 24

type DayViewProps = {
  currentDate: Date
  tasks: Task[]
}

export function DayView({ currentDate, tasks }: DayViewProps) {
  const { setSelectedTask, setIsDrawerOpen, setIsCreating, setNewTaskDate } = useCalendar()

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => i)

  const getTaskStyle = (task: Task) => {
    try {
      const start = parseISO(task.start_time)
      const end = parseISO(task.end_time)
      const dayStart = startOfDay(start)
      const topMinutes = differenceInMinutes(start, dayStart)
      const durationMinutes = Math.max(differenceInMinutes(end, start), 30)
      return {
        top: (topMinutes / 60) * HOUR_HEIGHT,
        height: Math.max((durationMinutes / 60) * HOUR_HEIGHT, 28),
      }
    } catch { return { top: 0, height: 32 } }
  }

  const dayTasks = tasks.filter(t => {
    try { return isSameDay(parseISO(t.start_time), currentDate) && !t.all_day } catch { return false }
  })

  const allDayTasks = tasks.filter(t => {
    try { return isSameDay(parseISO(t.start_time), currentDate) && t.all_day } catch { return false }
  })

  const handleSlotClick = (hour: number) => {
    const d = new Date(currentDate)
    d.setHours(hour, 0, 0, 0)
    setNewTaskDate(d)
    setIsCreating(true)
    setIsDrawerOpen(true)
  }

  const handleTaskClick = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation()
    setSelectedTask(task)
    setIsCreating(false)
    setIsDrawerOpen(true)
  }

  return (
    <div className='flex flex-1 flex-col overflow-hidden rounded-lg border'>
      {/* Header */}
      <div className='flex items-center gap-3 border-b bg-muted/30 px-6 py-3'>
        <div className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold',
          isToday(currentDate) ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}>
          {format(currentDate, 'd')}
        </div>
        <div>
          <p className='font-semibold'>{format(currentDate, 'EEEE')}</p>
          <p className='text-xs text-muted-foreground'>{format(currentDate, 'MMMM yyyy')}</p>
        </div>
        <div className='ml-auto text-sm text-muted-foreground'>
          {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* All day */}
      {allDayTasks.length > 0 && (
        <div className='flex gap-2 border-b px-4 py-2'>
          <span className='text-xs text-muted-foreground pt-1 w-14 shrink-0'>All day</span>
          <div className='flex flex-wrap gap-1'>
            {allDayTasks.map(task => (
              <button
                key={task.id}
                onClick={(e) => handleTaskClick(e, task)}
                className={cn(
                  'rounded px-2 py-0.5 text-xs font-medium',
                  categoryColors[task.category] ?? 'bg-primary/20 text-primary',
                  task.completed && 'opacity-50 line-through'
                )}
              >
                {task.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Time grid */}
      <div className='flex-1 overflow-y-auto'>
        <div className='flex'>
          {/* Time labels */}
          <div className='w-16 shrink-0'>
            {hours.map(hour => (
              <div
                key={hour}
                style={{ height: HOUR_HEIGHT }}
                className='flex items-start justify-end pr-3 pt-1'
              >
                <span className='text-xs text-muted-foreground'>
                  {hour === 0 ? '' : format(addMinutes(startOfDay(new Date()), hour * 60), 'h a')}
                </span>
              </div>
            ))}
          </div>

          {/* Events column */}
          <div
            className='relative flex-1 border-l'
            style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}
          >
            {/* Hour slots */}
            {hours.map(hour => (
              <div
                key={hour}
                style={{ height: HOUR_HEIGHT, top: hour * HOUR_HEIGHT }}
                className='absolute w-full cursor-pointer border-b border-dashed border-border/50 hover:bg-muted/30 transition-colors'
                onClick={() => handleSlotClick(hour)}
              />
            ))}

            {/* Task blocks */}
            {dayTasks.map(task => {
              const { top, height } = getTaskStyle(task)
              return (
                <button
                  key={task.id}
                  onClick={(e) => handleTaskClick(e, task)}
                  style={{ top, height, left: 8, right: 8 }}
                  className={cn(
                    'absolute z-10 overflow-hidden rounded-lg px-3 py-1.5 text-left shadow-sm transition-opacity hover:opacity-80',
                    categoryColors[task.category] ?? 'bg-primary/20 text-primary',
                    task.completed && 'opacity-50'
                  )}
                >
                  <p className={cn('font-semibold text-sm', task.completed && 'line-through')}>
                    {task.title}
                  </p>
                  <p className='text-xs opacity-80'>
                    {format(parseISO(task.start_time), 'h:mm a')} – {format(parseISO(task.end_time), 'h:mm a')}
                  </p>
                  {task.description && (
                    <p className='mt-0.5 truncate text-xs opacity-70'>{task.description}</p>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}