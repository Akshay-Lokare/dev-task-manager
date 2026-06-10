import { useMemo, useState } from 'react'
import { buildDailyCompletionSeries, shouldShowAxisLabel } from '../utils/productivity'

const CHART_WIDTH = 800
const CHART_HEIGHT = 176
const PADDING = { top: 12, right: 12, bottom: 8, left: 8 }

function getPointPosition(index, count, seriesLength, maxCount) {
  const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right
  const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom
  const x = PADDING.left + (index / Math.max(seriesLength - 1, 1)) * plotWidth
  const y = PADDING.top + (1 - count / maxCount) * plotHeight
  return { x, y }
}

export default function ProductivityChart({ tasks, dayCount }) {
  const [hoveredDate, setHoveredDate] = useState(null)
  const { series, total, average, peak } = useMemo(
    () => buildDailyCompletionSeries(tasks, dayCount),
    [tasks, dayCount],
  )

  const maxCount = Math.max(...series.map((point) => point.count), 1)
  const hoveredPoint = series.find((point) => point.date === hoveredDate) ?? null
  const hoveredIndex = series.findIndex((point) => point.date === hoveredDate)

  const points = series.map((point, index) => ({
    ...point,
    ...getPointPosition(index, point.count, series.length, maxCount),
  }))

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${CHART_HEIGHT - PADDING.bottom} L ${points[0].x} ${CHART_HEIGHT - PADDING.bottom} Z`
    : ''

  const tooltipLeft = hoveredIndex >= 0
    ? `${(points[hoveredIndex].x / CHART_WIDTH) * 100}%`
    : '50%'

  if (total === 0) {
    return (
      <div className="surface-panel rounded-xl p-8 text-center">
        <p className="text-sm text-theme-muted">No completed tasks in this period</p>
        <p className="text-xs text-zinc-500/70 dark:text-zinc-400/70 mt-1">
          Finish tasks on the board to see daily productivity here.
        </p>
      </div>
    )
  }

  return (
    <div className="surface-panel rounded-xl p-5 sm:p-6">
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-lg bg-violet-50/80 dark:bg-violet-950/25 border border-violet-200/60 dark:border-violet-800/40 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wide text-theme-muted">Completed</p>
          <p className="text-lg font-semibold text-violet-700 dark:text-violet-300 tabular-nums">{total}</p>
        </div>
        <div className="rounded-lg bg-canvas dark:bg-zinc-950/60 border border-theme px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wide text-theme-muted">Daily avg</p>
          <p className="text-lg font-semibold text-theme-ink tabular-nums">{average.toFixed(1)}</p>
        </div>
        <div className="rounded-lg bg-canvas dark:bg-zinc-950/60 border border-theme px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wide text-theme-muted">Best day</p>
          <p className="text-lg font-semibold text-theme-ink tabular-nums">{peak.count}</p>
          <p className="text-[10px] text-theme-muted truncate">{peak.label}</p>
        </div>
      </div>

      <div className="relative">
        {hoveredPoint && (
          <div
            className="absolute -top-1 z-10 pointer-events-none -translate-x-1/2 -translate-y-full"
            style={{ left: tooltipLeft }}
          >
            <div className="rounded-md bg-violet-700 text-white dark:bg-violet-400 dark:text-violet-950 px-2.5 py-1 text-[11px] font-medium whitespace-nowrap shadow-sm">
              {hoveredPoint.label}: {hoveredPoint.count} {hoveredPoint.count === 1 ? 'task' : 'tasks'}
            </div>
          </div>
        )}

        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="w-full h-44 sm:h-52"
          preserveAspectRatio="none"
          role="img"
          aria-label="Tasks completed per day line chart"
        >
          <defs>
            <linearGradient id="productivity-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = PADDING.top + (1 - ratio) * (CHART_HEIGHT - PADDING.top - PADDING.bottom)
            return (
              <line
                key={ratio}
                x1={PADDING.left}
                y1={y}
                x2={CHART_WIDTH - PADDING.right}
                y2={y}
                className="stroke-zinc-200/80 dark:stroke-zinc-700/80"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            )
          })}

          <path d={areaPath} fill="url(#productivity-area)" />
          <path
            d={linePath}
            fill="none"
            className="stroke-violet-500 dark:stroke-violet-400"
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point) => {
            const active = hoveredDate === point.date
            return (
              <g key={point.date}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="12"
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredDate(point.date)}
                  onMouseLeave={() => setHoveredDate(null)}
                />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={active ? 5 : 3}
                  className={`transition-all duration-150 ${active ? 'fill-violet-600 dark:fill-violet-300' : 'fill-violet-500 dark:fill-violet-400'}`}
                  pointerEvents="none"
                />
              </g>
            )
          })}
        </svg>

        <div className="mt-2 relative h-4">
          {series.map((point, index) => {
            if (!shouldShowAxisLabel(index, series.length)) return null
            const left = `${(points[index].x / CHART_WIDTH) * 100}%`
            return (
              <span
                key={`${point.date}-label`}
                className="absolute -translate-x-1/2 text-[9px] sm:text-[10px] text-zinc-500/80 dark:text-zinc-400/80 tabular-nums leading-none whitespace-nowrap"
                style={{ left }}
              >
                {point.label}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
