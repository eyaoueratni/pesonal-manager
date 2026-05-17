'use client'

import { PasswordInput } from '@/components/password-input'
import { SelectDropdown } from '@/components/select-dropdown'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { adminAPI } from '@/lib/api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { roles } from '../data/data'
import { type User } from '../data/schema'
import { useUsers } from './users-provider'

const formSchema = z
  .object({
    username: z.string().min(1, 'Username is required.'),
    email: z.string().email('Email is required.'),
    role: z.string().min(1, 'Role is required.'),
    password: z.string().transform((pwd) => pwd.trim()),
    confirmPassword: z.string().transform((pwd) => pwd.trim()),
    isEdit: z.boolean(),
  })
  .refine(({ isEdit, password }) => isEdit ? true : password.length > 0, {
    message: 'Password is required.',
    path: ['password'],
  })
  .refine(({ isEdit, password }) => isEdit && !password ? true : password.length >= 8, {
    message: 'Password must be at least 8 characters.',
    path: ['password'],
  })
  .refine(({ isEdit, password, confirmPassword }) => isEdit && !password ? true : password === confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })

type UserForm = z.infer<typeof formSchema>

type UserActionDialogProps = {
  currentRow?: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersActionDialog({
  currentRow,
  open,
  onOpenChange,
}: UserActionDialogProps) {
  const isEdit = !!currentRow
  const { refetch } = useUsers()

  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? { username: currentRow.username, email: currentRow.email, role: currentRow.role, password: '', confirmPassword: '', isEdit: true }
      : { username: '', email: '', role: '', password: '', confirmPassword: '', isEdit: false },
  })

  const onSubmit = async (values: UserForm) => {
    try {
      if (isEdit) {
        // ✅ Update user
        await adminAPI.updateUser(currentRow.id, {
          username: values.username,
          email: values.email,
          role: values.role,
          ...(values.password && { password: values.password }),
        })
        toast.success('User updated successfully')
      } else {
        // ✅ Create user
        await adminAPI.createUser({
          username: values.username,
          email: values.email,
          role: values.role,
          password: values.password,
        })
        toast.success('User created successfully')
      }
      refetch()
      form.reset()
      onOpenChange(false)
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Something went wrong'
      toast.error(msg)
    }
  }

  const isPasswordTouched = !!form.formState.dirtyFields.password

  return (
    <Dialog open={open} onOpenChange={(state) => { form.reset(); onOpenChange(state) }}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the user here. ' : 'Create new user here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id='user-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 py-2'>
            <FormField control={form.control} name='username' render={({ field }) => (
              <FormItem className='grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0'>
                <FormLabel className='col-span-2 text-end'>Username</FormLabel>
                <FormControl>
                  <Input placeholder='john_doe' className='col-span-4' {...field} />
                </FormControl>
                <FormMessage className='col-span-4 col-start-3' />
              </FormItem>
            )} />

            <FormField control={form.control} name='email' render={({ field }) => (
              <FormItem className='grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0'>
                <FormLabel className='col-span-2 text-end'>Email</FormLabel>
                <FormControl>
                  <Input placeholder='john@example.com' className='col-span-4' {...field} />
                </FormControl>
                <FormMessage className='col-span-4 col-start-3' />
              </FormItem>
            )} />

            <FormField control={form.control} name='role' render={({ field }) => (
              <FormItem className='grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0'>
                <FormLabel className='col-span-2 text-end'>Role</FormLabel>
                <SelectDropdown
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                  placeholder='Select a role'
                  className='col-span-4'
                  items={roles.map(({ label, value }) => ({ label, value }))}
                />
                <FormMessage className='col-span-4 col-start-3' />
              </FormItem>
            )} />

            <FormField control={form.control} name='password' render={({ field }) => (
              <FormItem className='grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0'>
                <FormLabel className='col-span-2 text-end'>Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder='e.g., S3cur3P@ssw0rd' className='col-span-4' {...field} />
                </FormControl>
                <FormMessage className='col-span-4 col-start-3' />
              </FormItem>
            )} />

            <FormField control={form.control} name='confirmPassword' render={({ field }) => (
              <FormItem className='grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0'>
                <FormLabel className='col-span-2 text-end'>Confirm Password</FormLabel>
                <FormControl>
                  <PasswordInput disabled={!isPasswordTouched} placeholder='e.g., S3cur3P@ssw0rd' className='col-span-4' {...field} />
                </FormControl>
                <FormMessage className='col-span-4 col-start-3' />
              </FormItem>
            )} />
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='user-form' disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}