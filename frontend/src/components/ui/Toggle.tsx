interface ToggleProps {
  checked: boolean
  onChange: (val: boolean) => void
  label: string
  description?: string
}

export default function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer select-none">
      <span className="flex flex-col gap-0.5">
        <span className="text-sm text-aura-text">{label}</span>
        {description && <span className="text-xs text-aura-text-muted">{description}</span>}
      </span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          'relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-accent/60',
          checked ? 'bg-aura-accent' : 'bg-aura-border',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
            checked ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
    </label>
  )
}
