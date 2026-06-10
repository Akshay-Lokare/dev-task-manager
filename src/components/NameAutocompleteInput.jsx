import { useEffect, useId, useRef, useState } from 'react'

export function filterNameSuggestions(names, query, limit = 8) {
  const unique = [...new Set(names.filter(Boolean))]
  const normalized = query.trim().toLowerCase()
  if (!normalized) return unique.slice(0, limit)

  return unique
    .filter((name) => name.toLowerCase().includes(normalized))
    .slice(0, limit)
}

function highlightMatch(text, query) {
  if (!query.trim()) return text

  const lowerText = text.toLowerCase()
  const lowerQuery = query.trim().toLowerCase()
  const index = lowerText.indexOf(lowerQuery)
  if (index === -1) return text

  return (
    <>
      {text.slice(0, index)}
      <span className="font-medium text-violet-600 dark:text-violet-300">
        {text.slice(index, index + query.trim().length)}
      </span>
      {text.slice(index + query.trim().length)}
    </>
  )
}

export default function NameAutocompleteInput({
  value,
  onChange,
  suggestions = [],
  placeholder,
  inputClassName = 'input-field',
  onFocus,
  onBlur,
}) {
  const listId = useId()
  const rootRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  useEffect(() => {
    setActiveIndex(-1)
  }, [value, suggestions])

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  const showMenu = open && suggestions.length > 0

  const selectSuggestion = (name) => {
    onChange(name)
    setOpen(false)
    setActiveIndex(-1)
  }

  const handleKeyDown = (event) => {
    if (!showMenu) {
      if (event.key === 'ArrowDown' && suggestions.length > 0) {
        event.preventDefault()
        setOpen(true)
        setActiveIndex(0)
      }
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % suggestions.length)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1))
      return
    }

    if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      selectSuggestion(suggestions[activeIndex])
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <input
        type="text"
        role="combobox"
        aria-expanded={showMenu}
        aria-controls={showMenu ? listId : undefined}
        aria-autocomplete="list"
        placeholder={placeholder}
        value={value}
        onChange={(event) => {
          onChange(event.target.value)
          setOpen(true)
        }}
        onFocus={(event) => {
          setOpen(true)
          onFocus?.(event)
        }}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        className={inputClassName}
      />

      {showMenu && (
        <div
          id={listId}
          role="listbox"
          className="name-autocomplete-menu"
        >
          <p className="name-autocomplete-heading">Existing names</p>
          {suggestions.map((name, index) => {
            const active = index === activeIndex
            return (
              <button
                key={name}
                type="button"
                role="option"
                aria-selected={active}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectSuggestion(name)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`name-autocomplete-option ${active ? 'name-autocomplete-option-active' : ''}`}
              >
                {highlightMatch(name, value)}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
