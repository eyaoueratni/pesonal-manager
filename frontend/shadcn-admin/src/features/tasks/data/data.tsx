import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  type ArrowUp,
  Briefcase,
  CheckCircle2,
  Circle,
  Dumbbell,
  GraduationCap,
  Heart,
  MoreHorizontal,
  ShoppingCart,
  User,
} from 'lucide-react'

// Priorities matching backend: important, normal, low
export const priorities = [
  {
    label: 'Important',
    value: 'important' as const,
    icon: AlertCircle,
  },
  {
    label: 'Normal',
    value: 'normal' as const,
    icon: ArrowRight,
  },
  {
    label: 'Low',
    value: 'low' as const,
    icon: ArrowDown,
  },
]

// Categories matching backend: work, personal, health, fitness, etc.
export const categories = [
  {
    label: 'Work',
    value: 'work' as const,
    icon: Briefcase,
  },
  {
    label: 'Personal',
    value: 'personal' as const,
    icon: User,
  },
  {
    label: 'Health',
    value: 'health' as const,
    icon: Heart,
  },
  {
    label: 'Fitness',
    value: 'fitness' as const,
    icon: Dumbbell,
  },
  {
    label: 'Shopping',
    value: 'shopping' as const,
    icon: ShoppingCart,
  },
  {
    label: 'Education',
    value: 'education' as const,
    icon: GraduationCap,
  },
  {
    label: 'Other',
    value: 'other' as const,
    icon: MoreHorizontal,
  },
]

// Completion statuses derived from backend `completed` boolean
export const completionStatuses = [
  {
    label: 'Completed',
    value: 'true' as const,
    icon: CheckCircle2,
  },
  {
    label: 'Pending',
    value: 'false' as const,
    icon: Circle,
  },
]

// Keep for backward compat if needed elsewhere
export const priorityIcons: Record<string, typeof ArrowUp> = {
  important: AlertCircle,
  normal: ArrowRight,
  low: ArrowDown,
}

export const categoryIcons: Record<string, typeof Briefcase> = {
  work: Briefcase,
  personal: User,
  health: Heart,
  fitness: Dumbbell,
  shopping: ShoppingCart,
  education: GraduationCap,
  other: MoreHorizontal,
}
