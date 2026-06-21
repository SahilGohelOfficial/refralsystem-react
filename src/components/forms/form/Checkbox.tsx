import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { cn } from '../../../lib/forms/cn'
import { errorClassName, hintClassName } from './styles'

type CheckboxProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'> & {
  label: string
  hint?: string
  error?: string
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, hint, error, required, id, className, ...props },
  ref,
) {
  return (
    <div className={cn('w-full', className)}>
      <label
        htmlFor={id}
        className={cn(
          'flex cursor-pointer items-start gap-3 rounded-lg border border-border',
          'bg-surface/50 px-3 py-3 sm:py-2.5 text-sm text-text transition-colors',
          'hover:border-primary/40 hover:bg-primary/5',
          'has-[:checked]:border-primary/50 has-[:checked]:bg-primary/10',
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          className="mt-0.5 size-4 shrink-0 rounded border-border text-primary focus:ring-2 focus:ring-primary/20"
          {...props}
        />
        <span className="flex-1 break-words">
          {label}
          {required && <span className="ml-0.5 text-error">*</span>}
        </span>
      </label>
      {error ? (
        <p className={cn(errorClassName, 'ml-1')} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className={cn(hintClassName, 'ml-1')}>{hint}</p>
      ) : null}
    </div>
  )
})

export default Checkbox
