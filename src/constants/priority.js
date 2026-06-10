import { IconPriorityHigh, IconPriorityLow, IconPriorityMid } from '../components/Icons'

export const PRIORITIES = ['low', 'mid', 'high']

export const PRIORITY_RANK = {
  high: 0,
  mid: 1,
  low: 2,
}

export const PRIORITY_THEME = {
  low: {
    label: 'Low',
    Icon: IconPriorityLow,
    text: 'text-green-600 dark:text-green-400',
    selected: 'bg-green-50 text-green-700 border-green-300 dark:bg-green-950/40 dark:text-green-300 dark:border-green-700',
    idle: 'border-line dark:border-zinc-700 text-theme-muted hover:border-green-300 dark:hover:border-green-700',
  },
  mid: {
    label: 'Mid',
    Icon: IconPriorityMid,
    text: 'text-yellow-400 dark:text-yellow-300',
    selected: 'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-500/15 dark:text-yellow-200 dark:border-yellow-600/40',
    idle: 'border-line dark:border-zinc-700 text-theme-muted hover:border-yellow-200 dark:hover:border-yellow-600/40',
  },
  high: {
    label: 'High',
    Icon: IconPriorityHigh,
    text: 'text-red-400 dark:text-red-300',
    selected: 'bg-red-50 text-red-500 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/40',
    idle: 'border-line dark:border-zinc-700 text-theme-muted hover:border-red-200 dark:hover:border-red-500/40',
  },
}

export function sortTasksByPriority(tasks) {
  return [...tasks].sort((a, b) => {
    const rankA = PRIORITY_RANK[a.priority ?? 'mid'] ?? 1
    const rankB = PRIORITY_RANK[b.priority ?? 'mid'] ?? 1
    if (rankA !== rankB) return rankA - rankB

    const timeA = Date.parse(a.createdAt ?? a.updatedAt ?? '') || 0
    const timeB = Date.parse(b.createdAt ?? b.updatedAt ?? '') || 0
    return timeB - timeA
  })
}
