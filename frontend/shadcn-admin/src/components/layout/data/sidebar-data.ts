import {
  Bell,
  Bot,
  Calendar,
  DollarSign,
  FileText,
  HelpCircle,
  Home,
  LayoutDashboard,
  ListTodo,
  Settings,
  UserCog,
  Wrench,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'User',
    email: 'user@homebase.com',
    avatar: '',
  },
  teams: [
    {
      name: 'HomeBase',
      logo: Home,
      plan: 'Personal Organizer',
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
          url: '/chats',
          icon: Bot,
        },
        {
          title: 'Settings',
          icon: Settings,
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: UserCog,
            },
            {
              title: 'Account',
              url: '/settings/account',
              icon: Wrench,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: Bell,
            },
          ],
        },
        {
          title: 'Help Center',
          url: '/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}