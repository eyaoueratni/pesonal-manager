import {
  Bot,
  Calendar,
  Command,
  DollarSign,
  FileText,
  LayoutDashboard,
  ListTodo,
  Settings,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarDataUser: SidebarData = {
  user: {
    name: 'User',
    email: 'user@homebase.com',
    avatar: '/avatars/user.jpg',
  },
  teams: [
    {
      name: 'Personal manager',
      logo: Command,
      plan: ' Organizer',
    },
  ],
  navGroups: [
    {
      title: 'My Workspace',
      items: [
        {
          title: 'Dashboard',
          url: '/dashboard',
          icon: LayoutDashboard,
        },
        {
          title: 'My Tasks',
          url: '/tasks',
          icon: ListTodo,
        },
        {
          title: 'Calendar',
          url: '/calendar',
          icon: Calendar,
        },
        {
          title: 'Documents',
          url: '/documents',
          icon: FileText,
        },
        {
          title: 'Finance Tracker',
          url: '/finance',
          icon: DollarSign,
        },
      ],
    },
    {
      title: 'Tools',
      items: [
        {
          title: 'AI Assistant',
          url: '/dashboard/ai',
          icon: Bot,
        },
        {
          title: 'Settings',
          url: '/dashboard/settings',
          icon: Settings,
        },
      ],
    },
  ],
}