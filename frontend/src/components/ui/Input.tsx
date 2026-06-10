import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className = '', id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-xs text-aura-text-dim tracking-widest uppercase"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={[
          'w-full bg-aura-surface border border-aura-border rounded-xl px-4 py-2.5',
          'text-sm text-aura-text placeholder-aura-text-muted',
          'focus:outline-none focus:border-aura-accent/60 focus:shadow-glow-accent',
          'transition-all duration-200',
          className,
        ].join(' ')}
        {...props}
      />
    </div>
  )
)
Input.displayName = 'Input'

export default Input
