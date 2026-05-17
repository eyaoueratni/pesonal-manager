import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useLayout } from '@/context/layout-provider'
import { useAuthStore } from '@/stores/auth-store'
import { sidebarDataAdmin } from './data/sidebar-admin-data'
import { sidebarData } from './data/sidebar-data'
import { sidebarDataUser } from './data/sidebar-user-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const user = useAuthStore((state) => state.user)
  
  const role = user?.role?.toLowerCase()

  const currentSidebarData = role === 'admin'
    ? sidebarDataAdmin 
    : role === 'user'
    ? sidebarDataUser
    : sidebarData

  const sidebarWithUserInfo = {
    ...currentSidebarData,
    user: {
      ...currentSidebarData.user,
      name: user?.username || currentSidebarData.user.name,
      email: user?.email || currentSidebarData.user.email,
    }
  }
  
  return (
    <Sidebar
      collapsible={collapsible}
      variant={variant}
      className={role === 'admin' ? 'bg-gray-100 dark:bg-gray-900' : ''}  // ✅ gray for admin
    >
      <SidebarHeader>
        <TeamSwitcher teams={sidebarWithUserInfo.teams} />
      </SidebarHeader>
      <SidebarContent>
        {sidebarWithUserInfo.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarWithUserInfo.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}