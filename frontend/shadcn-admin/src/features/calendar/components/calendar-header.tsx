
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCalendar, type CalendarView } from './calendar-provider'

export function CalendarHeader() {
  const {
    view, setView,
    currentDate,
    goNext, goPrev, goToday,
    setIsCreating, setIsDrawerOpen, setNewTaskDate,
  } = useCalendar()

  const getTitle = () => {
    if (view === 'month') return format(currentDate, 'MMMM yyyy')
    if (view === 'week') return `Week of ${format(currentDate, 'MMM d, yyyy')}`
    return format(currentDate, 'EEEE, MMMM d, yyyy')
  }


  return (
    <div className='flex flex-wrap items-center justify-between gap-3'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>Calendar</h2>
        <p className='text-muted-foreground'>Manage and view your tasks on a calendar.</p>
      </div>

      <div className='flex items-center gap-2'>
        {/* Navigation */}
        <div className='flex items-center gap-1 rounded-lg border p-1'>
          <Button variant='ghost' size='icon' className='h-7 w-7' onClick={goPrev}>
            <ChevronLeft className='size-4' />
          </Button>
          <Button variant='ghost' size='sm' className='h-7 px-3 text-sm font-medium' onClick={goToday}>
            Today
          </Button>
          <Button variant='ghost' size='icon' className='h-7 w-7' onClick={goNext}>
            <ChevronRight className='size-4' />
          </Button>
        </div>

        {/* Current period title */}
        <span className='hidden min-w-[180px] text-center text-sm font-semibold sm:block'>
          {getTitle()}
        </span>

        {/* View switcher */}
        <Tabs value={view} onValueChange={(v) => setView(v as CalendarView)}>
          <TabsList className='h-9'>
            <TabsTrigger value='month' className='text-xs'>Month</TabsTrigger>
            <TabsTrigger value='week' className='text-xs'>Week</TabsTrigger>
            <TabsTrigger value='day' className='text-xs'>Day</TabsTrigger>
          </TabsList>
        </Tabs>


      </div>
    </div>
  )
}