import React from 'react'

export default function MissingContextNameDialog({
  open,
  contextLabel = 'Sprint',
  onStay,
  onLeave,
}) {
  if (!open) return null

  const label = contextLabel?.trim() || 'Sprint'

  return (
    <div
      className="confirm-dialog-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={onStay}
    >
      <div
        className="confirm-dialog-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="confirm-dialog-title" className="confirm-dialog-title">
          {label} name missing
        </h3>
        <p className="confirm-dialog-body">
          Add a {label.toLowerCase()} name before you finish, or leave now. If you leave, this
          {' '}
          won&apos;t be saved.
        </p>
        <div className="confirm-dialog-actions">
          <button type="button" className="confirm-dialog-btn-stay" onClick={onStay}>
            Stay and edit
          </button>
          <button type="button" className="confirm-dialog-btn-leave" onClick={onLeave}>
            Leave without saving
          </button>
        </div>
      </div>
    </div>
  )
}
