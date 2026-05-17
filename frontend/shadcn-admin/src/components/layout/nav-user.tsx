import { SignOutDialog } from '@/components/sign-out-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import useDialogState from '@/hooks/use-dialog-state'
import { Link } from '@tanstack/react-router'
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  LogOut,
} from 'lucide-react'

type NavUserProps = {
  user: {
    name: string
    email: string
    avatar: string
  }
}

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar()
  const [open, setOpen] = useDialogState()

  const initials = user.name
    ? user.name.slice(0, 2).toUpperCase()
    : 'HB'

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size='lg'
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                style={{ borderRadius: 12 }}
              >
                {/* Avatar with gradient ring */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div
                    style={{
                      position: 'absolute',
                      inset: -2,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #FF6B6B, #A855F7)',
                      zIndex: 0,
                    }}
                  />
                  <Avatar
                    className='h-8 w-8'
                    style={{
                      borderRadius: '50%',
                      position: 'relative',
                      zIndex: 1,
                      border: '2px solid white',
                    }}
                  >
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback
                      style={{
                        background: 'linear-gradient(135deg, #FF6B6B, #A855F7)',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 12,
                        fontFamily: "'Nunito', sans-serif",
                      }}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className='grid flex-1 text-start text-sm leading-tight ms-1'>
                  <span className='truncate font-semibold' style={{ fontFamily: "'Nunito', sans-serif" }}>
                    {user.name}
                  </span>
                  <span className='truncate text-xs text-muted-foreground'>
                    {user.email}
                  </span>
                </div>
                <ChevronsUpDown className='ms-auto size-4 text-muted-foreground' />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl'
              side={isMobile ? 'bottom' : 'right'}
              align='end'
              sideOffset={4}
            >
              {/* User info header */}
              <DropdownMenuLabel className='p-0 font-normal'>
                <div className='flex items-center gap-2 px-2 py-2'>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div
                      style={{
                        position: 'absolute',
                        inset: -2,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #FF6B6B, #A855F7)',
                      }}
                    />
                    <Avatar
                      className='h-8 w-8'
                      style={{ position: 'relative', border: '2px solid white', borderRadius: '50%' }}
                    >
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback
                        style={{
                          background: 'linear-gradient(135deg, #FF6B6B, #A855F7)',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: 12,
                        }}
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className='grid flex-1 text-start text-sm leading-tight'>
                    <span className='truncate font-semibold'>{user.name}</span>
                    <span className='truncate text-xs text-muted-foreground'>{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link to='/settings/account'>
                    <BadgeCheck className='size-4' style={{ color: '#A855F7' }} />
                    Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to='/settings/notifications'>
                    <Bell className='size-4' style={{ color: '#FF6B6B' }} />
                    Notifications
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant='destructive'
                onClick={() => setOpen(true)}
              >
                <LogOut className='size-4' />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}