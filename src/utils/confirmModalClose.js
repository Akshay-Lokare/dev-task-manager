export function getContextNameForType(type, { sprintName = '', branchName = '', globalName = '' } = {}) {
  if (type === 'sprint') return sprintName
  if (type === 'branch') return branchName
  return globalName
}

export function hasRequiredContextName(type, names) {
  return Boolean(String(getContextNameForType(type, names)).trim())
}

export function needsCloseConfirmWithoutContextName(contextLabel, nameValue, hasOtherInput) {
  if (String(nameValue ?? '').trim()) return false
  if (!hasOtherInput) return false
  return true
}
