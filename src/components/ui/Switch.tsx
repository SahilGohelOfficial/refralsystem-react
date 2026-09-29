import { cn } from '../../lib/forms/cn';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
  'aria-label'?: string;
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
        'relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked
          ? 'bg-primary'
          : 'bg-text-muted/25 ring-1 ring-inset ring-border hover:ring-border-strong',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute top-0.5 left-0.5 size-5 rounded-full bg-card shadow-sm transition-transform duration-150',
          checked && 'translate-x-5',
        )}
      />
    </button>
  );
};

export default Switch;
