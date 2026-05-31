import { useEffect, useState } from 'react'
import useSessionStore, { DEFAULT_TYPE_LABELS } from '../store/useSessionStore'
import useThemeStore from '../store/useThemeStore'
import AppHeader from './AppHeader'
import { TYPE_ICONS } from './Icons'
import { resolveTypeTheme } from '../utils/typeLabels'

const SECTION_TYPES = ['sprint', 'branch', 'global']

export default function HiddenSettingsPage({ onNavigate }) {
  const { typeLabels, setTypeLabel, resetTypeLabels } = useSessionStore()
  const { theme, toggleTheme } = useThemeStore()
  const [draftLabels, setDraftLabels] = useState(typeLabels)

  useEffect(() => {
    setDraftLabels(typeLabels)
  }, [typeLabels])

  const applyLabel = (type, value) => {
    setDraftLabels((prev) => ({ ...prev, [type]: value }))
    setTypeLabel(type, value.trim() || DEFAULT_TYPE_LABELS[type])
  }

  const handleReset = () => {
    resetTypeLabels()
    setDraftLabels({ ...DEFAULT_TYPE_LABELS })
  }

  return (
    <div className="relative flex flex-col h-screen app-shell overflow-hidden">
      <AppHeader
        page="hidden-settings"
        onNavigate={onNavigate}
        subtitle="Rename board sections for this session only"
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1 overflow-y-auto px-8 py-6 min-h-0">
        <div className="max-w-lg mx-auto space-y-4">
          <div className="surface-panel rounded-xl p-5">
            <p className="text-xs text-theme-muted mb-4">
              These names appear on task cards, filters, and forms on the board. Column names stay unchanged.
              Everything resets when you close the app.
            </p>

            <div className="space-y-4">
              {SECTION_TYPES.map((type) => {
                const sectionTheme = resolveTypeTheme(type, draftLabels)
                const Icon = TYPE_ICONS[type]
                const defaultLabel = DEFAULT_TYPE_LABELS[type]

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
                Reset defaults
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

      <p className="absolute bottom-2 right-4 text-[11px] text-theme-muted/60">
        Session only · not saved
      </p>
    </div>
  )
}
