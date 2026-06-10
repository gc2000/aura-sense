import { type TextareaHTMLAttributes, forwardRef } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
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
      <textarea
        ref={ref}
        id={id}
        rows={4}
        className={[
          'w-full bg-aura-surface border border-aura-border rounded-xl px-4 py-2.5',
          'text-sm text-aura-text placeholder-aura-text-muted resize-none',
          'focus:outline-none focus:border-aura-accent/60 focus:shadow-glow-accent',
          'transition-all duration-200',
          className,
        ].join(' ')}
        {...props}
      />
    </div>
  )
)
Textarea.displayName = 'Textarea'

export default Textarea
