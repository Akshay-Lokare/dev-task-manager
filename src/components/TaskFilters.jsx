import {
  IconChevronDownSmall,
  IconFilter,
  IconPriorityHigh,
  IconPriorityLow,
  IconPriorityMid,
  IconUser,
  IconTag,
  COLUMN_ICONS,
  TYPE_ICONS,
} from './Icons'
import useSettingsStore from '../store/useSettingsStore'
import { DEFAULT_TASK_FILTERS, hasActiveFilters } from '../constants/taskFilters'
import { resolveTypeTheme } from '../utils/typeLabels'

const TYPE_TOGGLE = [
  { value: 'all', label: 'All', Icon: IconFilter, tone: 'filter-tone-violet' },
  { value: 'todo', label: 'Todo', Icon: COLUMN_ICONS.todo, tone: 'filter-tone-pink' },
  { value: 'inprogress', label: 'Active', Icon: COLUMN_ICONS.inprogress, tone: 'filter-tone-violet' },
  { value: 'done', label: 'Done', Icon: COLUMN_ICONS.done, tone: 'filter-tone-turquoise' },
]

const PRIORITY_TOGGLE = [
  { value: 'all', label: 'All', Icon: IconFilter, tone: 'filter-tone-zinc' },
  { value: 'low', label: 'Low', Icon: IconPriorityLow, tone: 'filter-tone-green' },
  { value: 'mid', label: 'Mid', Icon: IconPriorityMid, tone: 'filter-tone-yellow' },
  { value: 'high', label: 'High', Icon: IconPriorityHigh, tone: 'filter-tone-light-red' },
]

function FilterToggleGroup({ items, value, onChange, title, showLabels = false }) {
  return (
    <div className="filter-group" title={title}>
      {items.map(({ value: optionValue, label, Icon, tone }) => {
        const active = value === optionValue
        return (
          <button
            key={optionValue}
            type="button"
            onClick={() => onChange(optionValue)}
            className={`filter-toggle ${showLabels ? 'filter-toggle-labeled' : ''} ${active ? `filter-toggle-active ${tone}` : 'filter-toggle-idle'}`}
            title={label}
          >
            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
            {showLabels ? (
              <span className="text-[10px] font-medium">{label}</span>
            ) : (
              optionValue === 'all' && <span className="sr-only">{label}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

function FilterPillSelect({ icon: Icon, tone, value, onChange, options, emptyLabel }) {
  const isActive = value !== 'all'
  const current = options.find((option) => option.value === value)
  const display = value === 'all' ? emptyLabel : (current?.label ?? emptyLabel)

  return (
    <label
      className={`filter-pill ${isActive ? `filter-pill-active ${tone}` : 'filter-pill-idle'}`}
      title={display}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="truncate max-w-[88px]">{display}</span>
      <IconChevronDownSmall className="w-3 h-3 opacity-45 flex-shrink-0" />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="filter-pill-select"
        aria-label={emptyLabel}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}


export default function TaskFilters({ filters, onChange, options, visibleCount, totalCount }) {
  const typeLabels = useSettingsStore((s) => s.settings.typeLabels)
  const sprintTheme = resolveTypeTheme('sprint', typeLabels)
  const branchTheme = resolveTypeTheme('branch', typeLabels)
  const globalTheme = resolveTypeTheme('global', typeLabels)
  const globalNameOptions = [
    { value: 'all', label: `All ${globalTheme.label}` },
    ...options.globalNames.map((name) => ({ value: name, label: name })),
  ]
  const setFilter = (key) => (value) => onChange({ ...filters, [key]: value })
  const active = hasActiveFilters(filters)

  const sprintOptions = [
    { value: 'all', label: `All ${sprintTheme.label}` },
    ...options.sprintNames.map((name) => ({ value: name, label: name })),
  ]

  const branchOptions = [
    { value: 'all', label: `All ${branchTheme.label}` },
    ...options.branchNames.map((name) => ({ value: name, label: name })),
  ]

  const assigneeOptions = [
    { value: 'all', label: 'Everyone' },
    ...options.assignees.map((name) => ({ value: name, label: name })),
  ]

  const tagOptions = [
    { value: 'all', label: 'All tags' },
    ...options.tags.map((name) => ({ value: name, label: name })),
  ]

  return (
    <div className="filter-bar">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <span className="filter-label">Type</span>
          <FilterToggleGroup
            items={TYPE_TOGGLE}
            value={filters.status}
            onChange={setFilter('status')}
            title="Column stage"
            showLabels
          />
        </div>

        <div className="hidden sm:block w-px h-5 bg-line dark:bg-zinc-800" />

        <div className="flex items-center gap-2">
          <span className="filter-label">Priority</span>
          <FilterToggleGroup
            items={PRIORITY_TOGGLE}
            value={filters.priority}
            onChange={setFilter('priority')}
            title="Priority"
          />
        </div>

        <div className="hidden sm:block w-px h-5 bg-line dark:bg-zinc-800" />

        <div className="flex flex-wrap items-center gap-1.5">
          <FilterPillSelect
            icon={TYPE_ICONS.global}
            tone="filter-tone-indigo"
            value={filters.globalName}
            onChange={setFilter('globalName')}
            options={globalNameOptions}
            emptyLabel={globalTheme.label}
          />
          <FilterPillSelect
            icon={TYPE_ICONS.sprint}
            tone="filter-tone-cyan"
            value={filters.sprintName}
            onChange={setFilter('sprintName')}
            options={sprintOptions}
            emptyLabel={sprintTheme.label}
          />
          <FilterPillSelect
            icon={TYPE_ICONS.branch}
            tone="filter-tone-teal"
            value={filters.branchName}
            onChange={setFilter('branchName')}
            options={branchOptions}
            emptyLabel={branchTheme.label}
          />
          <FilterPillSelect
            icon={IconUser}
            tone="filter-tone-pink"
            value={filters.assignedTo}
            onChange={setFilter('assignedTo')}
            options={assigneeOptions}
            emptyLabel="Assignee"
          />
          <FilterPillSelect
            icon={IconTag}
            tone="filter-tone-amber"
            value={filters.tag}
            onChange={setFilter('tag')}
            options={tagOptions}
            emptyLabel="Tag"
          />
        </div>

        {active && (
          <>
            <div className="hidden sm:block w-px h-5 bg-line dark:bg-zinc-800" />
            <button
              type="button"
              onClick={() => onChange({ ...DEFAULT_TASK_FILTERS })}
              className="filter-clear"
            >
              Clear
            </button>
            <span className="filter-count ml-auto">
              {visibleCount}/{totalCount}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
