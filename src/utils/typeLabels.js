import { TYPE_THEME } from '../constants/typeTheme'
import { DEFAULT_TYPE_LABELS } from '../store/useSettingsStore'

export function resolveTypeTheme(type, typeLabels = DEFAULT_TYPE_LABELS) {
  const base = TYPE_THEME[type] ?? TYPE_THEME.global
  const label = typeLabels[type]?.trim() || base.label

  return {
    ...base,
    label,
    contextLabel: base.contextLabel ? label : null,
  }
}

export function formatTypeLabelsSubtitle(typeLabels = DEFAULT_TYPE_LABELS) {
  return [typeLabels.sprint, typeLabels.branch, typeLabels.global]
    .map((label) => label?.trim() || '')
    .filter(Boolean)
    .join(', ')
}
