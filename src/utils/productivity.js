import { formatTaskDate } from './dates'

export const PRODUCTIVITY_RANGES = [
  { months: 1, label: '1 month', days: 30 },
  { months: 2, label: '2 months', days: 60 },
  { months: 3, label: '3 months', days: 90 },
]

function dateStringFromDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function enumerateDays(dayCount) {
  const days = []
  const end = new Date()
  end.setHours(12, 0, 0, 0)

  for (let offset = dayCount - 1; offset >= 0; offset -= 1) {
    const date = new Date(end)
    date.setDate(end.getDate() - offset)
    days.push(dateStringFromDate(date))
  }

  return days
}

export function getTaskCompletionDate(task) {
  if ((task.status ?? 'todo') !== 'done') return null
  if (task.endDate) return task.endDate

  const updated = Date.parse(task.updatedAt ?? '')
  if (Number.isNaN(updated)) return null
  return dateStringFromDate(new Date(updated))
}

export function buildDailyCompletionSeries(tasks, dayCount) {
  const dayKeys = enumerateDays(dayCount)
  const counts = Object.fromEntries(dayKeys.map((day) => [day, 0]))

  for (const task of tasks) {
    const completionDate = getTaskCompletionDate(task)
    if (completionDate && completionDate in counts) {
      counts[completionDate] += 1
    }
  }

  const series = dayKeys.map((date) => ({
    date,
    count: counts[date],
    label: formatTaskDate(date),
  }))

  const total = series.reduce((sum, point) => sum + point.count, 0)
  const peak = series.reduce(
    (best, point) => (point.count > best.count ? point : best),
    { date: '', count: 0, label: '' },
  )

  return {
    series,
    total,
    average: dayCount > 0 ? total / dayCount : 0,
    peak,
  }
}

export function shouldShowAxisLabel(index, totalDays) {
  if (totalDays <= 30) return index % 5 === 0 || index === totalDays - 1
  if (totalDays <= 60) return index % 7 === 0 || index === totalDays - 1
  return index % 14 === 0 || index === totalDays - 1
}
