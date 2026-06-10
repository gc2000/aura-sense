import { type SelectHTMLAttributes, forwardRef } from 'react'

interface DropdownProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

const Dropdown = forwardRef<HTMLSelectElement, DropdownProps>(
  ({ label, options, className = '', id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-xs text-aura-text-dim tracking-widest uppercase"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={id}
          className={[
            'w-full appearance-none bg-aura-surface border border-aura-border rounded-xl px-4 py-2.5 pr-10',
            'text-sm text-aura-text',
            'focus:outline-none focus:border-aura-accent/60 focus:shadow-glow-accent',
            'transition-all duration-200 cursor-pointer',
            className,
          ].join(' ')}
          {...props}
        >
          {options.map(o => (
            <option key={o.value} value={o.value} className="bg-aura-surface">
              {o.label}
            </option>
          ))}
        </select>
        {/* Chevron icon */}
        <svg
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-aura-text-muted"
          width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden
        >
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
)
Dropdown.displayName = 'Dropdown'

export default Dropdown
