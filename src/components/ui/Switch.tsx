import { cn } from '../../lib/forms/cn'

export interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  id?: string
  className?: string
  'aria-label'?: string
}

const Switch = ({
  checked,
  onChange,
  disabled = false,
  id,
  className,
  'aria-label': ariaLabel,
}: SwitchProps) => {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked
          ? 'border-primary bg-primary shadow-[0_0_12px_rgba(212,160,23,0.35)]'
          : 'border-border bg-surface hover:border-primary/30',
        className,
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block size-5 rounded-full bg-background shadow-md transition-transform duration-200',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}

export default Switch
