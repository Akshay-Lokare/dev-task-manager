import React from 'react'

export function ChecklistBox({ checked = false, disabled = false }) {
  return (
    <span
      className={`checklist-box ${checked ? 'checklist-box-checked' : ''} ${disabled ? 'checklist-box-disabled' : ''}`}
      aria-hidden
    >
      {checked && (
        <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.5 6l2.5 2.5 4.5-5" />
        </svg>
      )}
    </span>
  )
}

export function ChecklistToggleRow({ checked, children, onToggle, className = '' }) {
  return (
    <button
      type="button"
      className={`checklist-row ${className}`}
      aria-pressed={checked}
      onClick={(event) => {
        event.stopPropagation()
        onToggle()
      }}
    >
      <ChecklistBox checked={checked} />
      <span className={`checklist-label ${checked ? 'checklist-label-done' : ''}`}>
        {children}
      </span>
    </button>
  )
}
