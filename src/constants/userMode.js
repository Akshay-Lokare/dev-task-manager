export const USER_MODES = {
  dev: { id: 'dev', label: 'Developer' },
  nonDev: { id: 'nonDev', label: 'Non-developer' },
}

export const TYPE_LABELS_BY_MODE = {
  dev: {
    sprint: 'Sprint',
    branch: 'Branch',
    global: 'Global',
  },
  nonDev: {
    sprint: 'Phase',
    branch: 'Project',
    global: 'General',
  },
}

export const NAME_PLACEHOLDERS_BY_MODE = {
  dev: {
    sprint: 'e.g. Sprint 12, Release 2.1',
    branch: 'e.g. feat/login, fix/auth-bug',
    global: 'e.g. Infra, Docs, DevOps',
  },
  nonDev: {
    sprint: 'e.g. Phase 1, Week 3, Milestone A',
    branch: 'e.g. New feature, Bug fix, Redesign',
    global: 'e.g. Work, Personal, Study',
  },
}

export function normalizeUserMode(mode) {
  return mode === 'nonDev' ? 'nonDev' : 'dev'
}

export function getTypeLabelsForMode(mode) {
  return TYPE_LABELS_BY_MODE[normalizeUserMode(mode)]
}

export const TASK_TAGS_BY_MODE = {
  dev: ['Bug', 'Feature', 'Refactor', 'Chore', 'Docs', 'Spike', 'Hotfix'],
  nonDev: ['Issue', 'Improvement', 'Update', 'Admin', 'Notes', 'Research', 'Urgent'],
}

export function getTaskTagsForMode(mode) {
  return [...TASK_TAGS_BY_MODE[normalizeUserMode(mode)]]
}
