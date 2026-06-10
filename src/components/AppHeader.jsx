import { IconLogo, IconMoon, IconSun } from './Icons'
import useSessionStore from '../store/useSessionStore'
import appPackage from '../../package.json'

const BASE_NAV_ITEMS = [
  { id: 'board', label: 'Board' },
  { id: 'notes', label: 'Notes' },
  { id: 'settings', label: 'Settings' },
]

const HIDDEN_NAV_ITEM = { id: 'analytics', label: 'Analytics' }

function NavButton({ id, label, page, onNavigate, compact = false }) {
  const active = page === id

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => onNavigate(id)}
        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors
          ${active ? 'btn-primary' : 'btn-ghost'}`}
      >
        {label}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onNavigate(id)}
      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap
        ${active
          ? 'bg-white dark:bg-zinc-900 text-theme-ink shadow-sm'
          : 'text-theme-muted hover:text-theme-ink'}`}
    >
      {label}
    </button>
  )
}

export default function AppHeader({ page, onNavigate, subtitle, theme, onToggleTheme, actions, onLogoClick }) {
  const easterEggUnlocked = useSessionStore((s) => s.easterEggUnlocked)
  const navItems = easterEggUnlocked
    ? [...BASE_NAV_ITEMS, HIDDEN_NAV_ITEM]
    : BASE_NAV_ITEMS
  const appVersion = appPackage.version

  return (
    <header className="px-8 py-5 surface-panel border-x-0 border-t-0">
      <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_1fr] items-center gap-x-4 gap-y-3">
        <div className="flex items-center gap-3 min-w-0 col-start-1 row-start-1 justify-self-start">
          <button
            type="button"
            onClick={onLogoClick}
            className={`rounded-lg p-1 -m-1 flex-shrink-0 transition-transform ${onLogoClick ? 'active:scale-95' : ''}`}
            title="MeowLogger"
          >
            <IconLogo className="w-8 h-8 text-theme-ink" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight text-theme-ink">MeowLogger</h1>
            <p className="text-xs text-theme-muted mt-0.5 truncate">{subtitle}</p>
            <p className="text-[10px] text-zinc-500/80 dark:text-zinc-400/80 mt-0.5">v{appVersion}</p>
          </div>
        </div>

        <nav className="hidden sm:flex items-center gap-1 p-1 rounded-lg bg-canvas dark:bg-zinc-950/80 col-start-2 row-start-1 justify-self-center">
          {navItems.map(({ id, label }) => (
            <NavButton key={id} id={id} label={label} page={page} onNavigate={onNavigate} />
          ))}
        </nav>

        <div className="flex items-center gap-2 flex-shrink-0 col-start-2 sm:col-start-3 row-start-1 justify-self-end">
          {actions}
          <button
            onClick={onToggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-lg btn-ghost"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <IconMoon /> : <IconSun />}
          </button>
        </div>

        <nav className="flex sm:hidden items-center justify-center gap-1 p-1 rounded-lg bg-canvas dark:bg-zinc-950/80 col-span-2 row-start-2 w-full max-w-full overflow-x-auto">
          {navItems.map(({ id, label }) => (
            <NavButton key={id} id={id} label={label} page={page} onNavigate={onNavigate} compact />
          ))}
        </nav>
      </div>
    </header>
  )
}
