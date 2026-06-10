import { type ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'danger' | 'ghost' | 'outline'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-aura-accent text-white shadow-glow-accent hover:bg-aura-accent-dim active:scale-95',
  danger:
    'bg-aura-red/20 text-aura-red border border-aura-red/40 shadow-glow-red hover:bg-aura-red/30 active:scale-95',
  ghost:
    'text-aura-text-dim hover:text-aura-text hover:bg-white/5 active:scale-95',
  outline:
    'border border-aura-border text-aura-text hover:border-aura-accent/50 hover:bg-aura-accent/5 active:scale-95',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-sm rounded-2xl',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth = false, className = '', children, ...props }, ref) => (
    <button
      ref={ref}
      className={[
        'inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-all duration-200',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-accent/60',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
)
Button.displayName = 'Button'

export default Button
