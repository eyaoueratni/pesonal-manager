import {
  Command,
  FileText,
  LayoutDashboard,
  ListTodo,
  Users,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarDataAdmin: SidebarData = {
  user: {
    name: 'Admin User',
    email: 'admin@homebase.com',
    avatar: '/avatars/admin.jpg',
  },
  teams: [
    {
      name: 'Personal Manager',
      logo: Command,
      plan: 'Administrator Panel',
    },
  ],
  navGroups: [
    {
      title: 'Admin Dashboard',
      items: [
        {
          title: 'Overview',
          url: '/admin',
          icon: LayoutDashboard,
        },
        {
          title: 'User Management',
          url: '/users',
          icon: Users,
        },
        {
          title: 'All Tasks',
          url: '/admin?tab=tasks',
          icon: ListTodo,
        },
        {
          title: 'All Documents',
          url: '/admin?tab=documents',
          icon: FileText,
        },
      ],
    },
  ],
}