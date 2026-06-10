import { useEffect, useState } from 'react'
import useSettingsStore from '../store/useSettingsStore'
import useThemeStore from '../store/useThemeStore'
import AppHeader from './AppHeader'
import { TYPE_ICONS, IconPlus, IconTrash } from './Icons'
import { getTaskTagsForMode, getTypeLabelsForMode, USER_MODES } from '../constants/userMode'
import { resolveTypeTheme } from '../utils/typeLabels'

const SECTION_TYPES = ['sprint', 'branch', 'global']

export default function HiddenSettingsPage({ onNavigate }) {
  const typeLabels = useSettingsStore((s) => s.settings.typeLabels)
  const taskTags = useSettingsStore((s) => s.settings.taskTags)
  const userMode = useSettingsStore((s) => s.settings.userMode)
  const setTypeLabel = useSettingsStore((s) => s.setTypeLabel)
  const setTaskTagAt = useSettingsStore((s) => s.setTaskTagAt)
  const addTaskTag = useSettingsStore((s) => s.addTaskTag)
  const removeTaskTagAt = useSettingsStore((s) => s.removeTaskTagAt)
  const setUserMode = useSettingsStore((s) => s.setUserMode)
  const resetTypeLabels = useSettingsStore((s) => s.resetTypeLabels)
  const resetTaskTags = useSettingsStore((s) => s.resetTaskTags)
  const setAutoDeleteHours = useSettingsStore((s) => s.setAutoDeleteHours)
  const autoDeleteHours = useSettingsStore((s) => s.settings.autoDeleteHours)
  const { theme, toggleTheme } = useThemeStore()
  const [draftLabels, setDraftLabels] = useState(typeLabels)
  const [draftTags, setDraftTags] = useState(taskTags)

  useEffect(() => {
    setDraftLabels(typeLabels)
  }, [typeLabels])

  useEffect(() => {
    setDraftTags(taskTags)
  }, [taskTags])

  const applyLabel = (type, value) => {
    setDraftLabels((prev) => ({ ...prev, [type]: value }))
    const modeDefaults = getTypeLabelsForMode(userMode)
    setTypeLabel(type, value.trim() || modeDefaults[type])
  }

  const handleReset = () => {
    resetTypeLabels()
    setDraftLabels(getTypeLabelsForMode(userMode))
  }

  const handleResetTags = () => {
    resetTaskTags()
    setDraftTags(getTaskTagsForMode(userMode))
  }

  const applyTagDraft = (index, value) => {
    setDraftTags((prev) => prev.map((tag, i) => (i === index ? value : tag)))
  }

  const commitTag = (index, value) => {
    const modeDefaults = getTaskTagsForMode(userMode)
    const trimmed = value.trim()
    setDraftTags((prev) => prev.map((tag, i) => (i === index ? (trimmed || modeDefaults[index] || tag) : tag)))
    setTaskTagAt(index, trimmed || modeDefaults[index] || '')
  }

  const handleAddTag = async () => {
    await addTaskTag('')
  }

  const handleRemoveTag = async (index) => {
    await removeTaskTagAt(index)
  }

  const handleUserModeChange = async (mode) => {
    await setUserMode(mode)
  }

  const modeDefaults = getTypeLabelsForMode(userMode)

  return (
    <div className="relative flex flex-col h-screen app-shell overflow-hidden">
      <AppHeader
        page="settings"
        onNavigate={onNavigate}
        subtitle="App preferences and labels"
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1 overflow-y-auto px-8 py-6 min-h-0">
        <div className="max-w-lg mx-auto space-y-4">
          <div className="surface-panel rounded-xl p-5">
            <p className="text-[11px] uppercase tracking-wide text-theme-muted mb-3">User mode</p>
            <p className="text-xs text-theme-muted mb-4">
              Developer mode uses sprint/branch terminology. Non-developer mode uses simpler labels like Phase and Project.
            </p>
            <div className="flex gap-2 p-1 rounded-lg bg-canvas dark:bg-zinc-950/80">
              {Object.values(USER_MODES).map(({ id, label }) => {
                const active = userMode === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleUserModeChange(id)}
                    className={`flex-1 py-2.5 rounded-md text-xs font-medium transition-colors
                      ${active
                        ? 'bg-white dark:bg-zinc-900 text-theme-ink shadow-sm'
                        : 'text-theme-muted hover:text-theme-ink'}`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="surface-panel rounded-xl p-5">
            <p className="text-[11px] uppercase tracking-wide text-theme-muted mb-3">Completed task cleanup</p>
            <p className="text-xs text-theme-muted mb-4">
              Automatically remove tasks from the Completed column after a set time.
              Todo, in progress, and notes are never deleted.
            </p>
            <label className="block text-[11px] text-theme-muted mb-1.5">
              Auto delete done tasks after
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="1"
                value={autoDeleteHours}
                onChange={(event) => setAutoDeleteHours(event.target.value)}
                className="input-field py-2 flex-1"
              />
              <span className="text-xs text-theme-muted">hours</span>
            </div>
            <p className="text-[10px] text-theme-muted mt-2">
              {autoDeleteHours === 0
                ? 'Cleanup is off — completed tasks are kept forever.'
                : `Completed tasks are removed ${autoDeleteHours} hour${autoDeleteHours === 1 ? '' : 's'} after completion.`}
            </p>
          </div>

          <div className="surface-panel rounded-xl p-5">
            <p className="text-xs text-theme-muted mb-4">
              These names appear on task cards, filters, and forms on the board. Column names stay unchanged.
              Changes are saved and will persist across restarts.
            </p>

            <div className="space-y-4">
              {SECTION_TYPES.map((type) => {
                const sectionTheme = resolveTypeTheme(type, draftLabels)
                const Icon = TYPE_ICONS[type]
                const defaultLabel = modeDefaults[type]

                return (
                  <div key={type}>
                    <label className="flex items-center gap-2 text-[11px] text-theme-muted mb-1.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium ${sectionTheme.activeFilter}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {defaultLabel}
                      </span>
                      <span>→ display as</span>
                    </label>
                    <input
                      type="text"
                      value={draftLabels[type]}
                      onChange={(event) => applyLabel(type, event.target.value)}
                      placeholder={defaultLabel}
                      className="input-field"
                    />
                  </div>
                )
              })}
            </div>

            <div className="pt-5 mt-5 border-t border-theme">
              <button
                type="button"
                onClick={handleReset}
                className="w-full py-2.5 rounded-lg btn-ghost text-sm"
              >
                Reset to {USER_MODES[userMode].label.toLowerCase()} defaults
              </button>
            </div>
          </div>

          <div className="surface-panel rounded-xl p-5">
            <p className="text-[11px] uppercase tracking-wide text-theme-muted mb-3">Task tags</p>
            <p className="text-xs text-theme-muted mb-4">
              Tags appear in the task form dropdown. Developer mode uses terms like Bug and Feature;
              non-developer mode uses plainer labels like Issue and Improvement.
            </p>

            <div className="space-y-2">
              {draftTags.map((tag, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tag}
                    onChange={(event) => applyTagDraft(index, event.target.value)}
                    onBlur={(event) => commitTag(index, event.target.value)}
                    placeholder={`Tag ${index + 1}`}
                    className="input-field flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(index)}
                    disabled={draftTags.length <= 1}
                    className="w-9 h-9 flex items-center justify-center rounded-lg btn-ghost disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Remove tag"
                  >
                    <IconTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-4 mt-4 border-t border-theme">
              <button
                type="button"
                onClick={handleAddTag}
                className="flex-1 py-2.5 rounded-lg border border-theme btn-ghost text-sm inline-flex items-center justify-center gap-1.5"
              >
                <IconPlus className="w-4 h-4" />
                Add tag
              </button>
              <button
                type="button"
                onClick={handleResetTags}
                className="flex-1 py-2.5 rounded-lg btn-ghost text-sm"
              >
                Reset tags
              </button>
            </div>
          </div>

          <div className="surface-panel rounded-xl p-5">
            <p className="text-[11px] uppercase tracking-wide text-theme-muted mb-3">Preview</p>
            <div className="flex flex-wrap gap-2">
              {SECTION_TYPES.map((type) => {
                const sectionTheme = resolveTypeTheme(type, draftLabels)
                const Icon = TYPE_ICONS[type]
                return (
                  <span
                    key={type}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${sectionTheme.activeFilter}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {sectionTheme.label}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      </main>

      <p className="absolute bottom-2 right-4 text-[11px] text-zinc-500/60 dark:text-zinc-400/60">
        Made by Akshay
      </p>
    </div>
  )
}
