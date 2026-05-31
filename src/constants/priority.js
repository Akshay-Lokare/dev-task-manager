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
    text: 'text-zinc-400 dark:text-zinc-500',
    selected: 'bg-zinc-100 text-zinc-600 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-600',
    idle: 'border-line dark:border-zinc-700 text-theme-muted hover:border-zinc-300 dark:hover:border-zinc-600',
  },
  mid: {
    label: 'Mid',
    Icon: IconPriorityMid,
    text: 'text-amber-600 dark:text-amber-400',
    selected: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700',
    idle: 'border-line dark:border-zinc-700 text-theme-muted hover:border-amber-300 dark:hover:border-amber-700',
  },
  high: {
    label: 'High',
    Icon: IconPriorityHigh,
    text: 'text-rose-600 dark:text-rose-400',
    selected: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-700',
    idle: 'border-line dark:border-zinc-700 text-theme-muted hover:border-rose-300 dark:hover:border-rose-700',
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
