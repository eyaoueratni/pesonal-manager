import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { DayView } from './components/calendar-day-view'
import { CalendarHeader } from './components/calendar-header'
import { MonthView } from './components/calendar-month-view'
import { CalendarMutateDrawer } from './components/calendar-mutate-drawer'
import { CalendarProvider, useCalendar } from './components/calendar-provider'
import { WeekView } from './components/calendar-week-view'

function CalendarContent() {
  const {
    view,
    currentDate,
    tasks,
    isLoading,
    selectedTask,
    isDrawerOpen,
    setIsDrawerOpen,
    isCreating,
    setIsCreating,
    setSelectedTask,
    newTaskDate,
  } = useCalendar()

  return (
    <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <CalendarHeader />

      {isLoading ? (
        <div className='flex flex-1 items-center justify-center text-muted-foreground'>
          Loading tasks...
        </div>
      ) : (
        <>
          {view === 'month' && <MonthView currentDate={currentDate} tasks={tasks} />}
          {view === 'week' && <WeekView currentDate={currentDate} tasks={tasks} />}
          {view === 'day' && <DayView currentDate={currentDate} tasks={tasks} />}
        </>
      )}

      <CalendarMutateDrawer
        open={isDrawerOpen}
        onOpenChange={(v) => {
          setIsDrawerOpen(v)
          if (!v) {
            setSelectedTask(null)
            setIsCreating(false)
          }
        }}
        currentTask={isCreating ? null : selectedTask}
        defaultDate={isCreating ? newTaskDate : null}
      />
    </Main>
  )
}

export function Calendar() {
  return (
    <CalendarProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
         
          <ProfileDropdown />
        </div>
      </Header>

      <CalendarContent />
    </CalendarProvider>
  )
}