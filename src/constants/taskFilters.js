import { PRIORITY_THEME } from './priority'

export const DEFAULT_TASK_FILTERS = {
  status: 'all',
  sprintName: 'all',
  branchName: 'all',
  priority: 'all',
  assignedTo: 'all',
}

export function getTaskFilterOptions(tasks) {
  const sprintNames = [...new Set(
    tasks.map((t) => t.sprintName?.trim()).filter(Boolean)
  )].sort((a, b) => a.localeCompare(b))

  const branchNames = [...new Set(
    tasks.map((t) => t.branchName?.trim()).filter(Boolean)
  )].sort((a, b) => a.localeCompare(b))

  const assignees = [...new Set(
    tasks.map((t) => t.assignedTo?.trim()).filter(Boolean)
  )].sort((a, b) => a.localeCompare(b))

  return { sprintNames, branchNames, assignees }
}

export function hasActiveFilters(filters) {
  return Object.entries(DEFAULT_TASK_FILTERS).some(
    ([key, value]) => filters[key] !== value
  )
}

export function filterTasks(tasks, filters) {
  return tasks.filter((task) => {
    if (filters.status !== 'all' && (task.status ?? 'todo') !== filters.status) return false

    if (filters.sprintName !== 'all') {
      if ((task.sprintName?.trim() ?? '') !== filters.sprintName) return false
    }

    if (filters.branchName !== 'all') {
      if ((task.branchName?.trim() ?? '') !== filters.branchName) return false
    }

    if (filters.priority !== 'all') {
      if ((task.priority ?? 'mid') !== filters.priority) return false
    }

    if (filters.assignedTo !== 'all') {
      if ((task.assignedTo?.trim() ?? '') !== filters.assignedTo) return false
    }

    return true
  })
}

export const TYPE_FILTER_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'sprint', label: 'Sprint' },
  { value: 'branch', label: 'Branch' },
  { value: 'global', label: 'Global' },
]

export const PRIORITY_FILTER_OPTIONS = [
  { value: 'all', label: 'All priorities' },
  ...Object.entries(PRIORITY_THEME).map(([value, theme]) => ({
    value,
    label: theme.label,
  })),
]
