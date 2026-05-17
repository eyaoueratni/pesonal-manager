import { ConfirmDialog } from '@/components/confirm-dialog'
import { SelectDropdown } from '@/components/select-dropdown'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { taskCreateSchema, WEEK_DAYS, type Task, type TaskCreate } from '@/features/tasks/data/schema'
import { updateFutureTasks } from '@/features/tasks/data/tasks'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { format, parseISO } from 'date-fns'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useCalendar } from './calendar-provider'

function isoToDatetimeLocal(iso?: string): string {
  if (!iso) return ''
  try { return format(parseISO(iso), "yyyy-MM-dd'T'HH:mm") } catch { return '' }
}

function datetimeLocalToIso(value: string): string {
  if (!value) return ''
  return new Date(value).toISOString()
}

function parseDays(str?: string | null): string[] {
  if (!str) return []
  return str.split(',').map(d => d.trim())
}

function formatDays(days: string[]): string {
  return days.join(',')
}

type CalendarMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTask?: Task | null
  defaultDate?: Date | null
}

export function CalendarMutateDrawer({
  open,
  onOpenChange,
  currentTask,
  defaultDate,
}: CalendarMutateDrawerProps) {
  const isUpdate = !!currentTask
  const isRecurringTask = !!(currentTask?.is_recurring || currentTask?.parent_task_id)
  const { handleCreateTask, handleUpdateTask, handleDeleteTask } = useCalendar()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const form = useForm<TaskCreate>({
    resolver: zodResolver(taskCreateSchema),
    defaultValues: {
      title: '',
      description: '',
      start_time: '',
      end_time: '',
      all_day: false,
      category: 'personal',
      priority: 'normal',
      completed: false,
      is_recurring: false,
      recurrence_days: '',
      recurrence_end_date: '',
    },
  })

  const isRecurring = form.watch('is_recurring')

  useEffect(() => {
    if (currentTask) {
      form.reset({
        title: currentTask.title,
        description: currentTask.description ?? '',
        start_time: isoToDatetimeLocal(currentTask.start_time),
        end_time: isoToDatetimeLocal(currentTask.end_time),
        all_day: currentTask.all_day,
        category: currentTask.category,
        priority: currentTask.priority,
        completed: currentTask.completed,
        is_recurring: currentTask.is_recurring ?? false,
        recurrence_days: currentTask.recurrence_days ?? '',
        recurrence_end_date: currentTask.recurrence_end_date
          ? format(parseISO(currentTask.recurrence_end_date), 'yyyy-MM-dd')
          : '',
      })
    } else {
      const defaultStart = defaultDate ? format(defaultDate, "yyyy-MM-dd'T'HH:mm") : ''
      form.reset({
        title: '',
        description: '',
        start_time: defaultStart,
        end_time: defaultStart,
        all_day: false,
        category: 'personal',
        priority: 'normal',
        completed: false,
        is_recurring: false,
        recurrence_days: '',
        recurrence_end_date: '',
      })
    }
  }, [currentTask, defaultDate, form])

  const onSubmit = async (data: TaskCreate) => {
    const payload: TaskCreate = {
      ...data,
      start_time: datetimeLocalToIso(data.start_time),
      end_time: datetimeLocalToIso(data.end_time),
      recurrence_end_date: data.recurrence_end_date
        ? new Date(data.recurrence_end_date).toISOString()
        : undefined,
      recurrence_days: data.is_recurring ? data.recurrence_days : undefined,
    }

    if (isUpdate && currentTask) {
      if (isRecurringTask) {
        await updateFutureTasks(currentTask.id, payload)
      } else {
        await handleUpdateTask(currentTask.id, payload)
      }
    } else {
      await handleCreateTask(payload)
    }
    form.reset()
  }

  const toggleDay = (dayValue: string, currentDays: string) => {
    const days = parseDays(currentDays)
    const newDays = days.includes(dayValue)
      ? days.filter(d => d !== dayValue)
      : [...days, dayValue].sort()
    return formatDays(newDays)
  }

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(v) => {
          onOpenChange(v)
          if (!v) form.reset()
        }}
      >
        <SheetContent className='flex flex-col'>
          <SheetHeader className='text-start'>
            <SheetTitle>{isUpdate ? 'Update' : 'Create'} Task</SheetTitle>
            <SheetDescription>
              {isUpdate
                ? 'Update the task by providing necessary info.'
                : 'Add a new task by providing necessary info.'}{' '}
              Click save when you&apos;re done.
            </SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form
              id='calendar-tasks-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='flex-1 space-y-5 overflow-y-auto px-4'
            >
              {isRecurringTask && (
                <div className='rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
                  🔁 Recurring task — saving will update this and all future occurrences.
                </div>
              )}

              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='e.g. Gym Session' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder='Optional details...' className='resize-none' rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='all_day'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between rounded-lg border p-3'>
                    <FormLabel className='mb-0'>All Day Event</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='start_time'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input {...field} type={form.watch('all_day') ? 'date' : 'datetime-local'} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='end_time'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input {...field} type={form.watch('all_day') ? 'date' : 'datetime-local'} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select a category'
                      items={[
                        { label: 'Work', value: 'work' },
                        { label: 'Personal', value: 'personal' },
                        { label: 'Health', value: 'health' },
                        { label: 'Fitness', value: 'fitness' },
                        { label: 'Shopping', value: 'shopping' },
                        { label: 'Education', value: 'education' },
                        { label: 'Other', value: 'other' },
                      ]}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='priority'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select priority'
                      items={[
                        { label: 'Important', value: 'important' },
                        { label: 'Normal', value: 'normal' },
                        { label: 'Low', value: 'low' },
                      ]}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Recurrence — create only */}
              {!isUpdate && (
                <FormField
                  control={form.control}
                  name='is_recurring'
                  render={({ field }) => (
                    <FormItem className='flex items-center justify-between rounded-lg border p-3'>
                      <div>
                        <FormLabel className='mb-0'>Repeat Weekly</FormLabel>
                        <p className='text-xs text-muted-foreground'>Set specific days to repeat</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {isRecurring && !isUpdate && (
                <>
                  <FormField
                    control={form.control}
                    name='recurrence_days'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Repeat on</FormLabel>
                        <FormControl>
                          <div className='flex flex-wrap gap-1.5'>
                            {WEEK_DAYS.map(day => {
                              const selected = parseDays(field.value).includes(day.value)
                              return (
                                <button
                                  key={day.value}
                                  type='button'
                                  onClick={() => field.onChange(toggleDay(day.value, field.value ?? ''))}
                                  className={cn(
                                    'h-9 w-10 rounded-md border text-xs font-medium transition-colors',
                                    selected
                                      ? 'bg-primary text-primary-foreground border-primary'
                                      : 'bg-background hover:bg-muted'
                                  )}
                                >
                                  {day.label}
                                </button>
                              )
                            })}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='recurrence_end_date'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Repeat Until</FormLabel>
                        <FormControl>
                          <Input {...field} type='date' />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {isUpdate && (
                <FormField
                  control={form.control}
                  name='completed'
                  render={({ field }) => (
                    <FormItem className='flex items-center justify-between rounded-lg border p-3'>
                      <FormLabel className='mb-0'>Mark as Completed</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </form>
          </Form>

          <SheetFooter className='gap-2'>
            {isUpdate && (
              <Button variant='destructive' type='button' onClick={() => setShowDeleteConfirm(true)}>
                Delete
              </Button>
            )}
            <SheetClose asChild>
              <Button variant='outline'>Close</Button>
            </SheetClose>
            <Button form='calendar-tasks-form' type='submit' disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : isUpdate ? 'Update Task' : 'Create Task'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        handleConfirm={() => currentTask && handleDeleteTask(currentTask.id)}
        title='Delete Task'
        desc={<>Are you sure you want to delete <strong>{currentTask?.title}</strong>? This cannot be undone.</>}
        confirmText='Delete'
        destructive
      />
    </>
  )
}