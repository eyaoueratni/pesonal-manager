import { Header } from '@/components/layout/header'
import { NotificationsBell } from '@/components/notifications-bell'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

export function PageHeader() {
  return (
    <Header fixed>
      <Search />
      <div className='ms-auto flex items-center space-x-4'>
        <ThemeSwitch />
        
        <NotificationsBell />
        <ProfileDropdown />
      </div>
    </Header>
  )
}