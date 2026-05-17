import { type Task } from '@/features/tasks/data/schema'
import { cn } from '@/lib/utils'
import {
    addMinutes,
    differenceInMinutes,
    eachDayOfInterval,
    endOfWeek,
    format,
    isSameDay,
    isToday,
    parseISO,
    startOfDay,
    startOfWeek,
} from 'date-fns'
import { categoryColors } from '../data/calendar-data'
import { useCalendar } from './calendar-provider'

const HOUR_HEIGHT = 64 // px per hour
const START_HOUR = 0
const END_HOUR = 24
const TOTAL_HOURS = END_HOUR - START_HOUR

type WeekViewProps = {
  currentDate: Date
  tasks: Task[]
}

export function WeekView({ currentDate, tasks }: WeekViewProps) {
  const { setSelectedTask, setIsDrawerOpen, setIsCreating, setNewTaskDate } = useCalendar()

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => i + START_HOUR)

  const getTaskStyle = (task: Task) => {
    try {
      const start = parseISO(task.start_time)
      const end = parseISO(task.end_time)
      const dayStart = startOfDay(start)
      const topMinutes = differenceInMinutes(start, dayStart)
      const durationMinutes = Math.max(differenceInMinutes(end, start), 30)
      const top = (topMinutes / 60) * HOUR_HEIGHT
      const height = (durationMinutes / 60) * HOUR_HEIGHT
      return { top, height: Math.max(height, 24) }
    } catch { return { top: 0, height: 32 } }
  }

  const getTasksForDay = (day: Date) =>
    tasks.filter(t => {
      try { return isSameDay(parseISO(t.start_time), day) && !t.all_day } catch { return false }
    })

  const getAllDayTasksForDay = (day: Date) =>
    tasks.filter(t => {
      try { return isSameDay(parseISO(t.start_time), day) && t.all_day } catch { return false }
    })

  const handleSlotClick = (day: Date, hour: number) => {
    const d = new Date(day)
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
      {/* Header row */}
      <div className='grid border-b bg-muted/30' style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
        <div className='border-r' />
        {days.map(day => (
          <div key={day.toISOString()} className={cn('border-r py-2 text-center last:border-r-0')}>
            <p className='text-xs text-muted-foreground'>{format(day, 'EEE')}</p>
            <p className={cn(
              'mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold',
              isToday(day) && 'bg-primary text-primary-foreground'
            )}>
              {format(day, 'd')}
            </p>
          </div>
        ))}
      </div>

      {/* All-day row */}
      <div className='grid border-b' style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
        <div className='flex items-center justify-end border-r pr-2'>
          <span className='text-xs text-muted-foreground'>All day</span>
        </div>
        {days.map(day => {
          const allDayTasks = getAllDayTasksForDay(day)
          return (
            <div key={day.toISOString()} className='min-h-8 border-r p-0.5 last:border-r-0'>
              {allDayTasks.map(task => (
                <button
                  key={task.id}
                  onClick={(e) => handleTaskClick(e, task)}
                  className={cn(
                    'mb-0.5 w-full truncate rounded px-1.5 py-0.5 text-left text-xs font-medium',
                    categoryColors[task.category] ?? 'bg-primary/20 text-primary',
                    task.completed && 'opacity-50 line-through'
                  )}
                >
                  {task.title}
                </button>
              ))}
            </div>
          )
        })}
      </div>

      {/* Time grid */}
      <div className='flex-1 overflow-y-auto'>
        <div className='grid' style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
          {/* Time labels */}
          <div>
            {hours.map(hour => (
              <div
                key={hour}
                style={{ height: HOUR_HEIGHT }}
                className='flex items-start justify-end border-r pr-2 pt-1'
              >
                <span className='text-xs text-muted-foreground'>
                  {hour === 0 ? '' : format(addMinutes(startOfDay(new Date()), hour * 60), 'h a')}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map(day => {
            const dayTasks = getTasksForDay(day)
            return (
              <div
                key={day.toISOString()}
                className='relative border-r last:border-r-0'
                style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}
              >
                {/* Hour slots */}
                {hours.map(hour => (
                  <div
                    key={hour}
                    style={{ height: HOUR_HEIGHT, top: hour * HOUR_HEIGHT }}
                    className='absolute w-full cursor-pointer border-b border-dashed border-border/50 hover:bg-muted/30 transition-colors'
                    onClick={() => handleSlotClick(day, hour)}
                  />
                ))}

                {/* Task blocks */}
                {dayTasks.map(task => {
                  const { top, height } = getTaskStyle(task)
                  return (
                    <button
                      key={task.id}
                      onClick={(e) => handleTaskClick(e, task)}
                      style={{ top, height, left: 2, right: 2 }}
                      className={cn(
                        'absolute z-10 overflow-hidden rounded px-1.5 py-1 text-left text-xs font-medium shadow-sm transition-opacity hover:opacity-80',
                        categoryColors[task.category] ?? 'bg-primary/20 text-primary',
                        task.completed && 'opacity-50'
                      )}
                    >
                      <p className='truncate font-semibold'>{task.title}</p>
                      <p className='truncate opacity-80'>
                        {format(parseISO(task.start_time), 'h:mm a')} – {format(parseISO(task.end_time), 'h:mm a')}
                      </p>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}