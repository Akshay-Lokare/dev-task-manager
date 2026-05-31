import {
  IconPaw as TablerPaw,
  IconMoon as TablerMoon,
  IconPencil as TablerPencil,
  IconSun as TablerSun,
  IconTrash as TablerTrash,
  IconChevronDown,
  IconMinus,
  IconFlame,
  IconFilter as TablerFilter,
  IconInbox,
  IconProgress,
  IconCircleCheck,
} from '@tabler/icons-react'

function sizeFromClass(className = 'w-4 h-4') {
  if (className.includes('w-8') || className.includes('h-8')) return 32
  if (className.includes('w-7') || className.includes('h-7')) return 28
  if (className.includes('w-6') || className.includes('h-6')) return 24
  if (className.includes('w-5') || className.includes('h-5')) return 20
  if (className.includes('w-3') || className.includes('h-3')) return 16
  return 20
}

function PawIcon({ className, stroke = 2 }) {
  const Icon = TablerPaw
  return <Icon className={className} size={sizeFromClass(className)} stroke={stroke} />
}

function SoapBubbles({ className = 'w-4 h-4', showPlus = false }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="14" r="5.5" />
      <circle cx="16.5" cy="8" r="3" />
      <circle cx="5.5" cy="7.5" r="2" />
      <path d="M7.2 11.8c.8-1 1.8-1.5 3-1.7" opacity="0.55" />
      <path d="M15.4 6.2c.45-.45.95-.7 1.55-.75" opacity="0.55" />
      <path d="M4.8 6.7c.25-.25.55-.4.9-.45" opacity="0.55" />
      {showPlus && <path d="M10 12v4M8 14h4" />}
    </svg>
  )
}

export function IconPlus({ className = 'w-4 h-4' }) {
  return <SoapBubbles className={className} showPlus />
}

export function IconCheck({ className = 'w-3 h-3' }) {
  return <PawIcon className={className} stroke={2.2} />
}

export function IconEdit({ className = 'w-3.5 h-3.5' }) {
  return <TablerPencil className={className} size={sizeFromClass(className)} stroke={2} />
}

export function IconTrash({ className = 'w-3.5 h-3.5' }) {
  return <TablerTrash className={className} size={sizeFromClass(className)} stroke={2} />
}

export function IconNote({ className = 'w-3.5 h-3.5' }) {
  return <SoapBubbles className={className} />
}

export function IconClose({ className = 'w-4 h-4' }) {
  return <SoapBubbles className={className} />
}

export function IconSprint({ className = 'w-4 h-4' }) {
  return <SoapBubbles className={className} />
}

export function IconBranch({ className = 'w-4 h-4' }) {
  return <PawIcon className={className} stroke={2.2} />
}

export function IconGlobal({ className = 'w-4 h-4' }) {
  return <SoapBubbles className={className} />
}

export function IconLogo({ className = 'w-5 h-5' }) {
  return <SoapBubbles className={className} />
}

export function IconSun({ className = 'w-4 h-4' }) {
  return <TablerSun className={className} size={sizeFromClass(className)} stroke={2} />
}

export function IconMoon({ className = 'w-4 h-4' }) {
  return <TablerMoon className={className} size={sizeFromClass(className)} stroke={2} />
}

export function IconUser({ className = 'w-3.5 h-3.5' }) {
  return <PawIcon className={className} stroke={2.2} />
}

export function IconPaw({ className = 'w-3 h-3' }) {
  return <PawIcon className={className} stroke={2.2} />
}

export function IconLoading({ className = 'w-4 h-4' }) {
  return <SoapBubbles className={`${className} animate-pulse`} />
}

export function IconEmpty({ className = 'w-5 h-5' }) {
  return <SoapBubbles className={className} />
}

export function IconChevronDownSmall({ className = 'w-3 h-3' }) {
  return <IconChevronDown className={className} size={sizeFromClass(className)} stroke={2.2} />
}

export function IconFilter({ className = 'w-3.5 h-3.5' }) {
  return <TablerFilter className={className} size={sizeFromClass(className)} stroke={2} />
}

export function IconPriorityLow({ className = 'w-4 h-4' }) {
  return <IconChevronDown className={className} size={sizeFromClass(className)} stroke={2.2} />
}

export function IconPriorityMid({ className = 'w-4 h-4' }) {
  return <IconMinus className={className} size={sizeFromClass(className)} stroke={2.2} />
}

export function IconPriorityHigh({ className = 'w-4 h-4' }) {
  return <IconFlame className={className} size={sizeFromClass(className)} stroke={2} />
}

export function IconColumnTodo({ className = 'w-3.5 h-3.5' }) {
  return <IconInbox className={className} size={sizeFromClass(className)} stroke={2} />
}

export function IconColumnInprogress({ className = 'w-3.5 h-3.5' }) {
  return <IconProgress className={className} size={sizeFromClass(className)} stroke={2} />
}

export function IconColumnDone({ className = 'w-3.5 h-3.5' }) {
  return <IconCircleCheck className={className} size={sizeFromClass(className)} stroke={2} />
}

export const COLUMN_ICONS = {
  todo: IconColumnTodo,
  inprogress: IconColumnInprogress,
  done: IconColumnDone,
}

export const TYPE_ICONS = {
  sprint: IconSprint,
  branch: IconBranch,
  global: IconGlobal,
}
