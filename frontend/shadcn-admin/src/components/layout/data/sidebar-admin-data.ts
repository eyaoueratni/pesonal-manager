import {
  Activity,
  Command,
  Database,
  DollarSign,
  FileText,
  LayoutDashboard,
  ListTodo,
  Settings,
  Shield,
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
      name: 'HomeBase Admin',
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
          url: '/tasks',
          icon: ListTodo,
        },
        {
          title: 'All Documents',
          url: '/documents',
          icon: FileText,
        },
        {
          title: 'Financial Overview',
          url: '/finance',
          icon: DollarSign,
        },
      ],
    },
    {
      title: 'System Management',
      items: [
        {
          title: 'Analytics',
          url: '/admin/analytics',
          icon: Activity,
        },
        {
          title: 'System Logs',
          url: '/admin/logs',
          icon: Database,
        },
        {
          title: 'Security',
          url: '/admin/security',
          icon: Shield,
        },
        {
          title: 'Settings',
          url: '/admin/settings',
          icon: Settings,
        },
      ],
    },
  ],
}